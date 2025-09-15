
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
    const supabase = createClient(true); // Use admin client to update user auth

    // 1. Update public.users table
    const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .update({ full_name: fullName, username, phone, email })
        .eq('id', userId)
        .select()
        .single();

    if (publicUserError) {
        console.error("Error updating public user data:", publicUserError);
        return { error: 'Failed to update user profile.' };
    }

    // 2. Update auth.users table (email, password)
    const authUpdateData: { email?: string; password?: string } = {};
    if (email) authUpdateData.email = email;
    if (newPassword) authUpdateData.password = newPassword;

    if (Object.keys(authUpdateData).length > 0) {
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdateData);
        if (authError) {
            console.error("Error updating auth user data:", authError);
            // Revert public user data if auth update fails? For now, we'll just return the error.
            return { error: 'Failed to update user authentication details.' };
        }
    }

    revalidatePath('/admin/users');
    return { data: publicUser, error: null };
}
