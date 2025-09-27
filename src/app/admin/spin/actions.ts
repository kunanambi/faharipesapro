
'use server';

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

interface SpinConfigInput {
    round1_prize: string;
    round2_prize: string;
    round3_prize: string;
}

// Fetches all spin configurations
export async function getSpinConfigs() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('spin_configurations')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching spin configs:", error);
        return [];
    }
    return data;
}

// Adds a new spin configuration
export async function addSpinConfig(input: SpinConfigInput) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('spin_configurations')
        .insert({
            round1_prize: input.round1_prize,
            round2_prize: input.round2_prize,
            round3_prize: input.round3_prize,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding spin config:", error);
        return { error: 'Failed to add new spin package.' };
    }
    
    revalidatePath('/admin/spin');
    revalidatePath('/spin'); // Revalidate the user-facing spin page
    
    return { data, error: null };
}

// Deletes a spin configuration
export async function deleteSpinConfig(configId: number) {
    const supabase = createClient();

    const { error } = await supabase
        .from('spin_configurations')
        .delete()
        .eq('id', configId);

    if (error) {
        console.error("Error deleting spin config:", error);
        return { error: 'Failed to delete spin package.' };
    }

    revalidatePath('/admin/spin');
    revalidatePath('/spin');

    return { error: null };
}

// Action for when a user completes a spin round
export async function claimSpinPrize(prizeAmount: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to claim a prize.' };
    }
    
    if (prizeAmount <= 0) {
        // No prize to claim, but the action is successful.
        return { error: null, data: { message: "No prize value to claim." } };
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
