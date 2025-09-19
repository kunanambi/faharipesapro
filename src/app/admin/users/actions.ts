
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const REFERRAL_BONUS = 1500;

export async function approveUser(userId: string) {
    const supabase = createClient();

    // Step 1: Update the user's status to 'approved' and get their details
    const { data: approvedUser, error: approveError } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', userId)
        .select('invited_by')
        .single();

    if (approveError) {
        console.error("Error approving user:", approveError);
        return { error: 'Failed to approve user. Check RLS policies and server logs.' };
    }

    // Step 2: If the user was referred, apply the bonus
    if (approvedUser && approvedUser.invited_by) {
        const referrerUsername = approvedUser.invited_by;
        
        // Get the referrer's current balance
        const { data: referrer, error: referrerError } = await supabase
            .from('users')
            .select('id, balance')
            .eq('username', referrerUsername)
            .single();

        if (referrerError || !referrer) {
            console.error(`Referrer with username ${referrerUsername} not found.`, referrerError);
            // Even if the referrer isn't found, the user approval should not fail.
        } else {
            // Calculate new balance and update the referrer
            const newBalance = (referrer.balance || 0) + REFERRAL_BONUS;
            const { error: balanceError } = await supabase
                .from('users')
                .update({ balance: newBalance })
                .eq('id', referrer.id);

            if (balanceError) {
                console.error("Error applying referral bonus:", balanceError);
                // Log the error but don't block the main operation
            }
        }
    }
    
    revalidatePath('/admin/users');
    revalidatePath('/team'); // Revalidate team page to update earnings
    revalidatePath('/dashboard'); // Revalidate dashboard to update balance
    return { error: null };
}

export async function toggleUserStatus(userId: string, currentStatus: 'approved' | 'pending') {
    const supabase = createClient();
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    
    const { data, error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error("Error toggling user status:", error);
        return { error: 'Failed to update status. RLS policies might be incorrect.' };
    }

    if (newStatus === 'approved') {
         await approveUser(userId); // Use the same approval logic to grant bonus
    }
    
    revalidatePath('/admin/users');
    return { data, error: null };
}

export async function updateUserByAdmin({ userId, fullName, username, phone, email, balance }: { 
    userId: string,
    fullName: string,
    username: string,
    phone: string,
    email: string,
    balance: number
}) {
    const supabase = createClient();

    const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .update({ full_name: fullName, username, phone, email, balance })
        .eq('id', userId)
        .select()
        .single();

    if (publicUserError) {
        console.error("Error updating public user data:", publicUserError);
        return { error: 'Failed to update user profile data. Check RLS policies.' };
    }

    revalidatePath('/admin/users');
    revalidatePath(`/dashboard`);
    revalidatePath(`/profile/${username}`);
    return { data: publicUser, error: null };
}
