
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
    // FIX: Use the standard client. RLS will ensure only an admin can perform this action.
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

export async function updateUserByAdmin({ userId, fullName, username, phone, email, newPassword }: { 
    userId: string,
    fullName: string,
    username: string,
    phone: string,
    email: string,
    newPassword?: string 
}) {
    // IMPORTANT: Use the standard client. RLS policies will enforce admin privileges.
    const supabase = createClient();

    // RLS policies now handle authorization, so we don't need a separate admin client.
    // The `auth.admin` methods are not available on the standard client,
    // so we cannot update email/password this way. We will update the public.users table.
    // Password changes must be done by the user themselves for security.

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
    revalidatePath(`/profile/${username}`);
    return { data: publicUser, error: null };
}
