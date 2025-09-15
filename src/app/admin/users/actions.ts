
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveUser(userId: string) {
    const supabase = createClient();

    // The RLS policy on the 'users' table will check if the person
    // making the request has an 'admin' role before allowing this update.
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

