
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
    return { success: true };
}


export async function declineWithdrawal(requestId: number, userId: string, amount: number) {
    const supabase = createClient();
    
    // --- This is a critical transaction, ensure it's atomic ---
    
    // 1. Get the withdrawal details to find the exact VAT deducted
    const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('vat')
        .eq('id', requestId)
        .single();
        
    if(withdrawalError || !withdrawalData) {
        return { success: false, message: 'Could not find the original withdrawal record to process refund.' };
    }

    const totalDeduction = amount + (withdrawalData.vat || 0);

    // 2. Get the user's current balance
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        return { success: false, message: 'Failed to fetch user for refund.' };
    }
    
    // 3. Refund the TOTAL deducted amount to the user's balance
    const newBalance = (user.balance || 0) + totalDeduction;
    const { error: balanceUpdateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
        
    if (balanceUpdateError) {
        return { success: false, message: 'Failed to refund user balance.' };
    }

    // 4. Mark the withdrawal as declined
    const { error: declineError } = await supabase
        .from('withdrawals')
        .update({ status: 'declined' })
        .eq('id', requestId);

    if (declineError) {
         // This is a critical error state. The user was refunded, but the request isn't marked declined.
         // For simplicity, we report the error. A more robust system might queue this for retry.
        console.error("CRITICAL: User was refunded, but withdrawal status could not be updated to 'declined'.", declineError);
        return { success: false, message: `Failed to update withdrawal status, but user was refunded ${totalDeduction} TZS.` };
    }
    
    // 5. Revalidate all relevant paths
    revalidatePath('/admin/withdrawals');
    revalidatePath('/dashboard'); 
    revalidatePath('/withdraw');
    return { success: true };
}
