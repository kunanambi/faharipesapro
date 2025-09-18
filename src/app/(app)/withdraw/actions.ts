
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestWithdrawal(formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/withdraw?error=You must be logged in to make a withdrawal.');
    }

    const amount = Number(formData.get('amount') as string);
    const phone = formData.get('phone') as string;
    const network = formData.get('network') as string;
    const registrationName = formData.get('registrationName') as string;
    
    // --- Validation ---
    if (!amount || !phone || !network || !registrationName) {
        return redirect('/withdraw?error=All fields are required.');
    }
    if (amount < 4800) {
        return redirect('/withdraw?error=Minimum withdrawal is 4,800 TZS.');
    }
    
    // --- Get User's Current Balance ---
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

    if (userError || !userData) {
        return redirect(`/withdraw?error=Could not fetch your user profile. Please try again.`);
    }

    const currentBalance = userData.balance || 0;

    // --- Calculate VAT and New Balance ---
    const vat = Math.ceil(amount * 0.06);
    const totalDeduction = amount + vat;

    if (currentBalance < totalDeduction) {
        return redirect(`/withdraw?error=Insufficient balance. You need ${totalDeduction} TZS to make this withdrawal.`);
    }

    const newBalance = currentBalance - totalDeduction;

    // --- Perform Database Operations ---
    
    // 1. Update user's balance
    const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

    if (updateError) {
        return redirect(`/withdraw?error=Could not update your balance. Please try again.`);
    }

    // 2. Insert the withdrawal request (with the `vat` field included)
    const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
            user_id: user.id,
            amount: amount,
            phone_number: phone,
            network: network,
            registration_name: registrationName,
            status: 'pending',
            vat: vat // *** THE CRITICAL FIX IS HERE ***
        });

    if (withdrawalError) {
        // If this fails, we must refund the user immediately!
        await supabase.from('users').update({ balance: currentBalance }).eq('id', user.id);
        return redirect(`/withdraw?error=Could not create withdrawal request. Your balance has been restored.`);
    }

    // 3. Revalidate paths to show updated balance
    revalidatePath('/dashboard');
    revalidatePath('/withdraw');
    
    return redirect(`/withdraw?success=Your withdrawal request for ${amount} TZS has been submitted successfully!`);
}
