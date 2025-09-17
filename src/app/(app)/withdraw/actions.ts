
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestWithdrawal(formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/?error=You must be logged in to make a withdrawal.');
        return;
    }

    const amount = Number(formData.get('amount') as string);
    const phone = formData.get('phone') as string;
    const network = formData.get('network') as string;
    const registrationName = formData.get('registrationName') as string;
    
    // --- Validation ---
    if (!amount || !phone || !network || !registrationName) {
        redirect('/withdraw?error=All fields are required.');
        return;
    }
    if (amount < 4800) {
        redirect(`/withdraw?error=Minimum withdrawal amount is 4,800 TZS.`);
        return;
    }

    // --- VAT and Total Deduction Calculation ---
    const vat = amount * 0.06;
    const totalDeduction = amount + vat;

    // --- Check User Balance ---
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

    if (userError || !userData) {
        redirect('/withdraw?error=Could not verify your balance.');
        return;
    }
    
    const currentBalance = userData.balance || 0;

    if (currentBalance < totalDeduction) {
        redirect(`/withdraw?error=Insufficient balance. You need ${totalDeduction.toLocaleString()} TZS to withdraw ${amount.toLocaleString()} TZS (including VAT).`);
        return;
    }

    // --- Deduct total amount from balance ---
    const newBalance = currentBalance - totalDeduction;
    const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id);

    if (updateError) {
        console.error("Balance update error:", updateError);
        redirect('/withdraw?error=Failed to update your balance. Please try again.');
        return;
    }

    // --- Create withdrawal request for the original amount ---
    const { error: insertError } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount, // Log the actual amount requested by the user
        phone_number: phone,
        network,
        registration_name: registrationName,
        status: 'pending',
    });

    if (insertError) {
        // This is a critical failure. The user's balance was deducted, but the withdrawal wasn't logged.
        // We must refund the user immediately.
        console.error("CRITICAL: Withdrawal insert failed after balance deduction.", insertError);
        await supabase
            .from('users')
            .update({ balance: currentBalance }) // Revert to the original balance
            .eq('id', user.id);
        
        revalidatePath('/dashboard'); // revalidate to show refunded balance
        redirect('/withdraw?error=Could not create your withdrawal request. Your balance has been restored. Please try again.');
        return;
    }
    
    // Revalidate paths to show updated balance and withdrawal history
    revalidatePath('/dashboard');
    revalidatePath('/withdraw');
    redirect('/withdraw?success=Withdrawal request submitted successfully!');
}

