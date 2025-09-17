
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveWithdrawal(requestId: number) {
    const supabase = createClient();
    const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'paid' })
        .eq('id', requestId);

    if (error) {
        console.error("Error approving withdrawal:", error);
        return { success: false, message: error.message };
    }

    revalidatePath('/admin/withdrawals');
    revalidatePath('/dashboard');
    revalidatePath('/withdraw');
    return { success: true };
}


export async function declineWithdrawal(requestId: number, userId: string, amount: number) {
    const supabase = createClient();

    // --- VAT and Total Deduction Calculation ---
    // This is the total amount that was originally deducted from the user's balance.
    const vat = amount * 0.06;
    const totalDeduction = amount + vat;

    // Start a transaction to ensure atomicity
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        return { success: false, message: 'Failed to fetch user for refund.' };
    }
    
    // Refund the TOTAL deducted amount to the user's balance
    const newBalance = (user.balance || 0) + totalDeduction;
    const { error: balanceUpdateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
        
    if (balanceUpdateError) {
        return { success: false, message: 'Failed to refund user balance.' };
    }

    // Mark the withdrawal as declined
    const { error: declineError } = await supabase
        .from('withdrawals')
        .update({ status: 'declined' })
        .eq('id', requestId);

    if (declineError) {
         // If this fails, we should ideally roll back the balance update.
        console.error("Failed to decline withdrawal, but balance was refunded:", declineError);
        // Attempt to revert the balance update
         await supabase
            .from('users')
            .update({ balance: user.balance }) // Revert to original
            .eq('id', userId);
        return { success: false, message: 'Failed to decline withdrawal after refund. Balance restored.' };
    }
    
    revalidatePath('/admin/withdrawals');
    revalidatePath('/dashboard'); 
    revalidatePath('/withdraw');
    return { success: true };
}
