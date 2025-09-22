
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function claimReward(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to claim a reward.' };
    }
    
    const adId = formData.get('adId') as string;
    const adType = formData.get('adType') as string;
    const rewardAmount = parseFloat(formData.get('rewardAmount') as string);
    const viewsCount = formData.get('views_count') ? parseInt(formData.get('views_count') as string, 10) : null;

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
        .eq('user_id', user.id)
        .eq('ad_id', adId)
        .single();
    
    if (existingWatch) {
        console.warn(`User ${user.id} tried to claim reward for already watched ad ${adId}.`);
        redirect(`/earn/${adType}?error=already_watched`);
        return;
    }

    // 1. Add record to user_watched_ads
    const insertData: { user_id: string; ad_id: string; views_count?: number | null } = { 
        user_id: user.id, 
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
        .eq('id', user.id)
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
        .eq('id', user.id);

    if (balanceError) {
        console.error("Error updating balance/earnings:", balanceError);
        return { error: 'Could not update your balance.' };
    }

    // Revalidate paths to show updated data
    revalidatePath(`/earn/${adType}`);
    revalidatePath('/dashboard');
    
    // Redirect back to the earn page for that specific ad type
    redirect(`/earn/${adType}`);
}
