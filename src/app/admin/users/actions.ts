
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
        return { error: 'Failed to update status.' };
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
    // IMPORTANT: When creating the client for admin actions,
    // you must use the service role key for elevated privileges.
    // This client is created with direct environment variable access.
    const supabase = createClient();

    // 1. Update auth.users table first (email, password)
    // This is the more critical operation.
    const authUpdateData: { email?: string; password?: string } = {};
    if (email) authUpdateData.email = email;
    if (newPassword) authUpdateData.password = newPassword;

    if (Object.keys(authUpdateData).length > 0) {
        // The `auth.admin` object is available on any server-side Supabase client
        // and uses the service_role key under the hood to perform admin tasks.
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdateData);
        if (authError) {
            console.error("Error updating auth user data:", authError);
            return { error: 'Failed to update user authentication details.' };
        }
    }

    // 2. Update the associated public.users table
    const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .update({ full_name: fullName, username, phone, email })
        .eq('id', userId)
        .select()
        .single();

    if (publicUserError) {
        console.error("Error updating public user data:", publicUserError);
        // Even if this fails, the auth update succeeded, so we should report a partial success.
        // For now, we'll return an error but this could be handled more gracefully.
        return { error: 'Failed to update user profile data after updating auth details.' };
    }

    revalidatePath('/admin/users');
    revalidatePath(`/profile/${username}`); // Also revalidate profile if it's a dynamic page
    return { data: publicUser, error: null };
}
