
'use server'

import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

const REFERRAL_BONUS = 1500;

export async function approveUser(userId: string) {
    const supabase = createClient();

    const { data: approvedUser, error: approveError } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', userId)
        .select('invited_by')
        .single();

    if (approveError) {
        console.error("Error approving user:", approveError);
        return { error: 'Failed to approve user.' };
    }

    if (approvedUser && approvedUser.invited_by) {
        const referrerUsername = approvedUser.invited_by;
        
        const { data: referrer, error: referrerError } = await supabase
            .from('users')
            .select('id, balance, total_earnings')
            .eq('username', referrerUsername)
            .single();

        if (referrer && !referrerError) {
            const newBalance = (referrer.balance || 0) + REFERRAL_BONUS;
            const newTotalEarnings = (referrer.total_earnings || 0) + REFERRAL_BONUS;
            await supabase
                .from('users')
                .update({ balance: newBalance, total_earnings: newTotalEarnings })
                .eq('id', referrer.id);
        }
    }
    
    revalidatePath('/admin/users');
    revalidatePath('/team');
    revalidatePath('/dashboard');
    return { error: null };
}

async function revokeReferralBonus(userId: string) {
    const supabase = createClient();

    const { data: demotedUser } = await supabase
        .from('users')
        .select('invited_by')
        .eq('id', userId)
        .single();

    if (demotedUser && demotedUser.invited_by) {
        const { data: referrer } = await supabase
            .from('users')
            .select('id, balance, total_earnings')
            .eq('username', demotedUser.invited_by)
            .single();

        if (referrer) {
            const newBalance = Math.max(0, (referrer.balance || 0) - REFERRAL_BONUS);
            const newTotalEarnings = Math.max(0, (referrer.total_earnings || 0) - REFERRAL_BONUS);
            await supabase
                .from('users')
                .update({ balance: newBalance, total_earnings: newTotalEarnings })
                .eq('id', referrer.id);
        }
    }
}


export async function toggleUserStatus(userId: string, currentStatus: 'approved' | 'pending') {
    const supabase = createClient();
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    
    if (newStatus === 'approved') {
         await approveUser(userId);
    } else {
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
    revalidatePath('/team');
    revalidatePath('/dashboard');
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
        return { error: 'Failed to update user profile data.' };
    }

    revalidatePath('/admin/users');
    revalidatePath(`/dashboard`);
    revalidatePath(`/team`);
    return { data: publicUser, error: null };
}

// This needs admin client. It will stay, but we need to ensure it's used correctly.
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
