
'use server';

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

interface WithdrawalRequest {
    amount: number;
    phone_number: string;
    registration_name: string;
    network: string;
    userId: string;
    username: string;
}

const VAT_RATE = 0.06; // 6%

export async function requestWithdrawal(input: WithdrawalRequest) {
    const supabase = createClient();

    const { userId, username, amount, phone_number, registration_name, network } = input;

    // 1. Calculate VAT and total deduction
    const vatAmount = amount * VAT_RATE;
    const totalDeduction = amount + vatAmount;

    // 2. Get user's current balance
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
    if (totalDeduction > currentBalance) {
        return { error: 'Insufficient balance to cover the withdrawal amount and VAT.' };
    }

    // 3. Deduct total amount (amount + VAT) from user's balance
    const newBalance = currentBalance - totalDeduction;
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
    
    if (balanceError) {
        console.error("Error updating user balance:", balanceError);
        return { error: 'Failed to update balance.' };
    }

    // 4. Create a withdrawal record
    const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
            user_id: userId,
            user_username: username,
            amount, // The requested amount, not the total deduction
            phone_number,
            registration_name,
            network,
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
