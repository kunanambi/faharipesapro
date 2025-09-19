
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', userId);

    if (error) {
        console.error("Error approving user:", error);
        return { error: 'Failed to approve user. Check RLS policies and server logs.' };
    }
    
    revalidatePath('/admin/users');
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
    
    revalidatePath('/admin/users');
    return { data, error: null };
}

export async function updateUserByAdmin({ userId, fullName, username, phone, email }: { 
    userId: string,
    fullName: string,
    username: string,
    phone: string,
    email: string,
}) {
    const supabase = createClient();

    // The `auth.admin` methods have been removed. We update the public.users table directly.
    // RLS policies now handle authorization.

    const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .update({ full_name: fullName, username, phone, email })
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
