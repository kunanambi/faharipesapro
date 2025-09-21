
'use server'

import { createClient as createAdminClient } from "@/lib/supabase/admin";
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
        
        // Get the referrer's current data
        const { data: referrer, error: referrerError } = await supabase
            .from('users')
            .select('id, balance, total_earnings')
            .eq('username', referrerUsername)
            .single();

        if (referrerError || !referrer) {
            console.error(`Referrer with username ${referrerUsername} not found.`, referrerError);
            // Even if the referrer isn't found, the user approval should not fail.
        } else {
            // Calculate new balance and update the referrer
            const newBalance = (referrer.balance || 0) + REFERRAL_BONUS;
            const newTotalEarnings = (referrer.total_earnings || 0) + REFERRAL_BONUS;
            const { error: balanceError } = await supabase
                .from('users')
                .update({ balance: newBalance, total_earnings: newTotalEarnings })
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

async function revokeReferralBonus(userId: string) {
    const supabase = createClient();

    // Step 1: Get the user who is being moved to 'pending' to find out who referred them.
    const { data: demotedUser, error: demotedUserError } = await supabase
        .from('users')
        .select('invited_by')
        .eq('id', userId)
        .single();

    if (demotedUserError || !demotedUser || !demotedUser.invited_by) {
        console.log(`User ${userId} was not referred or could not be found. No bonus to revoke.`);
        return; // No referrer, so nothing to do.
    }

    // Step 2: Find the referrer and get their balance.
    const referrerUsername = demotedUser.invited_by;
    const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, balance, total_earnings')
        .eq('username', referrerUsername)
        .single();

    if (referrerError || !referrer) {
        console.error(`Referrer ${referrerUsername} not found while trying to revoke bonus.`);
        return; // Referrer not found, can't revoke.
    }

    // Step 3: Deduct the bonus from the referrer's balance and total earnings.
    const newBalance = Math.max(0, (referrer.balance || 0) - REFERRAL_BONUS);
    const newTotalEarnings = Math.max(0, (referrer.total_earnings || 0) - REFERRAL_BONUS);
    const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: newBalance, total_earnings: newTotalEarnings })
        .eq('id', referrer.id);

    if (balanceError) {
        console.error("Error revoking referral bonus:", balanceError);
    }
}


export async function toggleUserStatus(userId: string, currentStatus: 'approved' | 'pending') {
    const supabase = createClient();
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    
    // This is a simplified toggle; using approveUser directly is better for bonus logic
    if (newStatus === 'approved') {
         await approveUser(userId);
    } else {
        // If moving to pending, update status and revoke bonus
        const { error } = await supabase
            .from('users')
            .update({ status: 'pending' })
            .eq('id', userId);
        
        if (error) {
             console.error("Error toggling user status to pending:", error);
             return { error: 'Failed to update status.' };
        }
        await revokeReferralBonus(userId);
    }
    
    revalidatePath('/admin/users');
    revalidatePath('/team'); // Revalidate team page to update earnings/status
    revalidatePath('/dashboard'); // Revalidate dashboard to update balance
    return { data: { id: userId }, error: null };
}

export async function updateUserByAdmin({ userId, fullName, username, phone, email, balance, total_earnings }: { 
    userId: string,
    fullName: string,
    username: string,
    phone: string,
    email: string,
    balance: number,
    total_earnings: number
}) {
    const supabase = createClient();

    const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .update({ full_name: fullName, username, phone, email, balance, total_earnings })
        .eq('id', userId)
        .select()
        .single();

    if (publicUserError) {
        console.error("Error updating public user data:", publicUserError);
        return { error: 'Failed to update user profile data. Check RLS policies.' };
    }

    revalidatePath('/admin/users');
    revalidatePath(`/dashboard`);
    revalidatePath(`/team`);
    return { data: publicUser, error: null };
}

export async function changeUserPasswordByAdmin({ userId, newPassword }: { userId: string, newPassword: string }) {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
    );

    if (error) {
        console.error("Error changing user password by admin:", error);
        return { error: 'Failed to change password. ' + error.message };
    }

    return { data, error: null };
}
