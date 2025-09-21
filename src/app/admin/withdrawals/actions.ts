
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveWithdrawal(withdrawalId: string) {
    const supabase = createClient();
    
    // Note: The amount has already been deducted from the user's balance upon request.
    // Here, we just mark the request as approved.
    const { data, error } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', withdrawalId)
        .select()
        .single();
    
    if (error) {
        console.error("Error approving withdrawal:", error);
        return { error: 'Failed to approve withdrawal.' };
    }

    revalidatePath('/admin/withdrawals');
    revalidatePath(`/withdraw`); // Revalidate for user history
    return { data, error: null };
}

export async function rejectWithdrawal(withdrawalId: string) {
    const supabase = createClient();

    // 1. Get the withdrawal details
    const { data: withdrawal, error: fetchError } = await supabase
        .from('withdrawals')
        .select('user_id, amount, status')
        .eq('id', withdrawalId)
        .single();

    if (fetchError || !withdrawal) {
        console.error("Error fetching withdrawal to reject:", fetchError);
        return { error: "Could not find the withdrawal request." };
    }

    if (withdrawal.status !== 'pending') {
        return { error: "This request has already been processed." };
    }

    // 2. Return the amount to the user's balance
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', withdrawal.user_id)
        .single();
    
    if (userError || !user) {
        console.error("Error fetching user to refund:", userError);
        return { error: "Could not find the user to refund." };
    }

    const newBalance = (user.balance || 0) + withdrawal.amount;
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', withdrawal.user_id);

    if (balanceError) {
        console.error("Error refunding user balance:", balanceError);
        return { error: "Failed to refund the user's balance." };
    }

    // 3. Mark the withdrawal as rejected
    const { data, error: rejectError } = await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', withdrawalId)
        .select()
        .single();

    if (rejectError) {
        console.error("Error rejecting withdrawal:", rejectError);
        // Attempt to roll back the refund... this is getting complex, should use a db function
        await supabase
            .from('users')
            .update({ balance: user.balance })
            .eq('id', withdrawal.user_id);
        return { error: 'Failed to reject withdrawal.' };
    }

    revalidatePath('/admin/withdrawals');
    revalidatePath(`/withdraw`);
    revalidatePath('/dashboard');

    return { data, error: null };
}
