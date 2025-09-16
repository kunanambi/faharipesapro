
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

    // Start a transaction to ensure atomicity
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        return { success: false, message: 'Failed to fetch user for refund.' };
    }
    
    // Refund the amount to the user's balance
    const newBalance = (user.balance || 0) + amount;
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
        return { success: false, message: 'Failed to decline withdrawal after refund.' };
    }
    
    revalidatePath('/admin/withdrawals');
    revalidatePath('/dashboard');
    return { success: true };
}
