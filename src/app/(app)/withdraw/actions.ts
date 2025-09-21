
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface WithdrawalRequest {
    amount: number;
    phone_number: string;
    userId: string;
    username: string;
}

export async function requestWithdrawal(input: WithdrawalRequest) {
    const supabase = createClient();

    const { userId, username, amount, phone_number } = input;

    // 1. Get user's current balance
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();
    
    if (userError || !userData) {
        console.error("Error fetching user for withdrawal:", userError);
        return { error: 'Could not find user profile.' };
    }

    const currentBalance = userData.balance || 0;
    if (amount > currentBalance) {
        return { error: 'Insufficient balance.' };
    }

    // 2. Deduct amount from user's balance
    const newBalance = currentBalance - amount;
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
    
    if (balanceError) {
        console.error("Error updating user balance:", balanceError);
        return { error: 'Failed to update balance.' };
    }

    // 3. Create a withdrawal record
    const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
            user_id: userId,
            user_username: username,
            amount,
            phone_number,
            status: 'pending',
        })
        .select()
        .single();

    if (withdrawalError) {
        console.error("Error creating withdrawal record:", withdrawalError);
        // Rollback balance deduction
        await supabase
            .from('users')
            .update({ balance: currentBalance })
            .eq('id', userId);
        return { error: 'Failed to create withdrawal request.' };
    }

    revalidatePath('/withdraw');
    revalidatePath('/admin/withdrawals');
    revalidatePath('/dashboard');

    return { data: withdrawalData, error: null };
}
