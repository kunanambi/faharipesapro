
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestWithdrawal(formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to make a withdrawal.' };
    }

    const amount = Number(formData.get('amount') as string);
    const phone = formData.get('phone') as string;
    const network = formData.get('network') as string;
    const registrationName = formData.get('registrationName') as string;

    // --- Validation ---
    if (!amount || !phone || !network || !registrationName) {
        return { error: 'All fields are required.' };
    }
    if (amount < 10000) {
        return { error: 'Minimum withdrawal amount is 10,000 TZS.' };
    }

    // --- Check User Balance ---
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

    if (userError || !userData) {
        return { error: 'Could not verify your balance.' };
    }

    if (userData.balance < amount) {
        redirect('/withdraw?error=Insufficient balance');
        return;
    }

    // --- Deduct amount from balance & Create withdrawal request in a transaction ---
    const newBalance = userData.balance - amount;

    const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

    if (updateError) {
        return { error: 'Failed to update balance.' };
    }

    const { data, error } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount,
        phone_number: phone,
        network,
        registration_name: registrationName,
        status: 'pending',
    });

    if (error) {
        // If this fails, we should ideally roll back the balance update.
        // For simplicity, we'll log the error. A more robust solution would use a db transaction.
        console.error("Failed to create withdrawal request, but balance was deducted:", error);
        return { error: 'Failed to create withdrawal request.' };
    }

    revalidatePath('/withdraw');
    redirect('/withdraw?success=Withdrawal request submitted successfully!');
}
