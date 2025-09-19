
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
    
    // Mark the withdrawal as declined
    const { error: declineError } = await supabase
        .from('withdrawals')
        .update({ status: 'declined' })
        .eq('id', requestId);

    if (declineError) {
        console.error("CRITICAL: Could not update withdrawal status to 'declined'.", declineError);
        return { success: false, message: `Failed to update withdrawal status.` };
    }
    
    // Revalidate all relevant paths
    revalidatePath('/admin/withdrawals');
    revalidatePath('/withdraw');
    return { success: true };
}
