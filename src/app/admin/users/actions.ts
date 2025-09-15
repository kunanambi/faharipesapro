'use server'

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
    const supabase = createAdminClient();

    // First, update the status in our public 'users' table.
    const { error: publicUserError } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', userId);

    if (publicUserError) {
        console.error("Error updating public user status:", publicUserError);
        return { error: 'Failed to update user status.' };
    }
    
    // Then, update the metadata in the auth.users table.
    const { error: authUserError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { status: 'approved' } }
    )

    if (authUserError) {
        console.error("Error updating auth user metadata:", authUserError);
        // Note: You might want to handle rollback logic here if the first update succeeded.
        // For now, we'll just report the error.
        return { error: 'Failed to update user auth metadata.' };
    }

    revalidatePath('/admin/users');
    return { error: null };
}
