
'use server';

import { createClient } from "@/lib/supabase/client"; // Changed to client
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// This function needs to be callable from the client, so we can't use server-only Supabase client
export async function claimReward(adId: string, adType: string, rewardAmount: number, userId: string, viewsCount: number | null) {
    const supabase = createClient();

    if (!adId || isNaN(rewardAmount) || !adType) {
        return { error: 'Invalid ad data.' };
    }
    
    if (adType === 'whatsapp' && (viewsCount === null || isNaN(viewsCount) || viewsCount < 0)) {
        return { error: 'Please provide a valid number of views.' };
    }

    // Double check they haven't already watched it
    const { data: existingWatch } = await supabase
        .from('user_watched_ads')
        .select('*')
        .eq('user_id', userId)
        .eq('ad_id', adId)
        .single();
    
    if (existingWatch) {
        console.warn(`User ${userId} tried to claim reward for already watched ad ${adId}.`);
        return { error: 'already_watched' };
    }

    // 1. Add record to user_watched_ads
    const insertData: { user_id: string; ad_id: string; views_count?: number | null } = { 
        user_id: userId, 
        ad_id: adId 
    };
    if (viewsCount !== null) {
        insertData.views_count = viewsCount;
    }

    const { error: watchError } = await supabase
        .from('user_watched_ads')
        .insert(insertData);
    
    if (watchError) {
        console.error("Error recording watched ad:", watchError);
        return { error: 'Could not record your watch. Please try again.' };
    }

    // 2. Fetch user's current balance and total earnings
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance, total_earnings')
        .eq('id', userId)
        .single();
    
    if (userError || !userData) {
        console.error("Error fetching user data:", userError);
        // We should probably rollback the watched ad record here in a real scenario
        return { error: 'Could not fetch your profile to update balance.' };
    }

    // 3. Update balance and total earnings
    const newBalance = (userData.balance || 0) + rewardAmount;
    const newTotalEarnings = (userData.total_earnings || 0) + rewardAmount;
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance, total_earnings: newTotalEarnings })
        .eq('id', userId);

    if (balanceError) {
        console.error("Error updating balance/earnings:", balanceError);
        return { error: 'Could not update your balance.' };
    }

    // Since this is a server action, revalidation and redirection can happen here.
    // However, the caller component will handle the redirection logic for a better UX.
    revalidatePath(`/earn/${adType}`);
    revalidatePath('/dashboard');
    
    return { error: null };
}
