
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
    
    // --- Validation (Basic) ---
    if (!amount || !phone || !network || !registrationName) {
        return redirect('/withdraw?error=All fields are required.');
    }
    if (amount < 4800) {
        return redirect('/withdraw?error=Minimum withdrawal is 4,800 TZS.');
    }
    
    // --- New, Direct Logic based on your suggestion ---

    // 1. Get the user's current balance
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

    if (userError || !userData) {
        return redirect(`/withdraw?error=Could not fetch your user profile. Please try again.`);
    }

    const currentBalance = userData.balance || 0;

    // 2. Calculate VAT and total deduction
    const vat = amount * 0.06;
    const totalDeduction = amount + vat;

    // 3. Check for sufficient balance
    if (currentBalance < totalDeduction) {
        return redirect(`/withdraw?error=Insufficient balance. You need ${totalDeduction} TZS to make this withdrawal.`);
    }

    // 4. Calculate the new balance
    const newBalance = currentBalance - totalDeduction;

    // 5. Update the user's balance in the database
    const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

    if (updateError) {
        return redirect(`/withdraw?error=Could not update your balance. Please try again.`);
    }

    // 6. Insert the withdrawal request
    const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
            user_id: user.id,
            amount: amount,
            phone_number: phone,
            network: network,
            registration_name: registrationName,
            status: 'pending'
        });

    if (withdrawalError) {
        // If this fails, we must refund the user immediately!
        await supabase.from('users').update({ balance: currentBalance }).eq('id', user.id);
        return redirect(`/withdraw?error=Could not create withdrawal request. Your balance has been restored.`);
    }

    // 7. Revalidate paths to show updated balance everywhere
    revalidatePath('/dashboard');
    revalidatePath('/withdraw');
    
    return redirect(`/withdraw?success=Your withdrawal request for ${amount} TZS has been submitted successfully!`);
}
