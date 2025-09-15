
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
    const supabase = createClient();

    // The RLS policy on the 'users' table will check if the person
    // making the request is an admin before allowing this update.
    const { error } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', userId);

    if (error) {
        console.error("Error approving user:", error);
        return { error: 'Failed to approve user. Check RLS policies and server logs.' };
    }
    
    // We also need to update the metadata in auth.users for consistency,
    // but this requires an admin client. For now, we will rely on the public.users status.
    // The login flow should check the status from the public.users table.
    // If you need to update auth metadata, a database function is the most secure way.

    revalidatePath('/admin/users');
    return { error: null };
}
