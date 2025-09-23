
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SpinPrizesInput {
    round1_prize: string;
    round2_prize: string;
    round3_prize: string;
}

// Fetches the current spin prizes for the admin form
export async function getSpinPrizes() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('spin_configurations')
        .select('round1_prize, round2_prize, round3_prize')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error("Error fetching spin prizes:", error);
        return null;
    }
    return data;
}

// Updates the spin prizes
export async function updateSpinPrizes(input: SpinPrizesInput) {
    const supabase = createClient();
    
    const { error } = await supabase
        .from('spin_configurations')
        .update({
            round1_prize: input.round1_prize,
            round2_prize: input.round2_prize,
            round3_prize: input.round3_prize,
            updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

    if (error) {
        console.error("Error updating spin prizes:", error);
        return { error: 'Failed to update spin prizes.' };
    }
    
    revalidatePath('/admin/spin');
    revalidatePath('/spin'); // Revalidate the user-facing spin page
    return { data: input, error: null }; // Return the input data on success
}

// Action for when a user completes a spin round
export async function claimSpinPrize(prizeAmount: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to claim a prize.' };
    }
    
    if (prizeAmount <= 0) {
        return { error: null, data: { message: "No prize to claim." } }; // No prize to claim
    }

    // Fetch user's current balance and total earnings
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance, total_earnings')
        .eq('id', user.id)
        .single();
    
    if (userError || !userData) {
        console.error("Error fetching user data:", userError);
        return { error: 'Could not fetch your profile to update balance.' };
    }

    // Update balance and total earnings
    const newBalance = (userData.balance || 0) + prizeAmount;
    const newTotalEarnings = (userData.total_earnings || 0) + prizeAmount;
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance, total_earnings: newTotalEarnings })
        .eq('id', user.id);

    if (balanceError) {
        console.error("Error updating balance/earnings for spin prize:", balanceError);
        return { error: 'Could not update your balance.' };
    }

    // Revalidate paths to show updated data
    revalidatePath('/dashboard');
    
    return { error: null, data: { newBalance } };
}
