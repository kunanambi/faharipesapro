
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SpinSettingsInput {
    round1_prize: string;
    round2_prize: string;
    round3_prize: string;
    is_active: boolean; // This can come as a string from FormData, handle it.
}

// Fetches the current spin settings for the admin form
export async function getSpinSettings() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('spin_configurations')
        .select('round1_prize, round2_prize, round3_prize, is_active, version')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error("Error fetching spin settings:", error);
        return null;
    }
    return data;
}

// Updates the spin settings and increments the version
export async function updateSpinSettings(input: SpinSettingsInput) {
    const supabase = createClient();

    // First, get the current version
    const { data: currentData, error: getError } = await supabase
        .from('spin_configurations')
        .select('version')
        .eq('id', 1)
        .single();
    
    if (getError) {
        console.error("Error fetching current spin version:", getError);
        return { error: 'Failed to get current settings version.' };
    }

    const newVersion = (currentData.version || 0) + 1;
    
    // Ensure is_active is a proper boolean
    const isActiveBoolean = String(input.is_active).toLowerCase() === 'true';

    const { error } = await supabase
        .from('spin_configurations')
        .update({
            round1_prize: input.round1_prize,
            round2_prize: input.round2_prize,
            round3_prize: input.round3_prize,
            is_active: isActiveBoolean,
            version: newVersion,
            updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

    if (error) {
        console.error("Error updating spin settings:", error);
        return { error: 'Failed to update spin settings.' };
    }
    
    revalidatePath('/admin/spin');
    revalidatePath('/spin'); // Revalidate the user-facing spin page
    
    const updatedData = { ...input, is_active: isActiveBoolean, version: newVersion };
    return { data: updatedData, error: null };
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
