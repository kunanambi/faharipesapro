'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ContentData {
    title: string;
    instructions: string;
    payment_number: string;
    payment_name: string;
}

export async function updatePendingContent(formData: FormData) {
    // Use the standard server client. RLS policies will handle authorization.
    const supabase = createClient();
    
    const data: ContentData = {
        title: formData.get('title') as string,
        instructions: formData.get('instructions') as string,
        payment_number: formData.get('payment_number') as string,
        payment_name: formData.get('payment_name') as string,
    };

    if (!data.title || !data.instructions || !data.payment_name || !data.payment_number) {
        return { error: 'All fields are required.' };
    }

    // This update will only succeed if the user has the 'admin' role,
    // as defined by our RLS policy.
    const { error } = await supabase
        .from('pending_page_content')
        .update({
            title: data.title,
            instructions: data.instructions,
            payment_number: data.payment_number,
            payment_name: data.payment_name,
            updated_at: new Date().toISOString()
        })
        .eq('id', 1);

    if (error) {
        console.error("Error updating pending content:", error);
        // The error message will be more informative now, e.g., "new row violates row-level security policy"
        return { error: `Failed to update content. Ensure you are logged in as an admin. Details: ${error.message}` };
    }

    revalidatePath('/pending');
    revalidatePath('/admin/pending-settings');

    return { error: null };
}

export async function getPendingContent() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('pending_page_content')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error("Error fetching pending content:", error);
        return null;
    }
    return data;
}
