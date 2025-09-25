
'use server';

import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Converts a file to a Base64 data URI
async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}

export async function getPendingContent() {
    // Use the standard client for reads, as it's allowed for all authenticated users
    const supabase = createAdminClient(); 
    const { data, error } = await supabase
        .from('pending_page_content')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error("Error fetching pending page content:", error);
        return null;
    }
    return data;
}

export async function updatePendingContent(formData: FormData) {
    const supabase = createAdminClient();
    
    const title = formData.get('title') as string;
    const instructions = formData.get('instructions') as string;
    const payment_number = formData.get('payment_number') as string;
    const payment_name = formData.get('payment_name') as string;
    const imageFile = formData.get('image') as File;

    const updates: { [key: string]: any } = {
        title,
        instructions,
        payment_number,
        payment_name,
        updated_at: new Date().toISOString()
    };

    if (imageFile && imageFile.size > 0) {
        updates.image_url = await fileToDataUri(imageFile);
    }

    const { error } = await supabase
        .from('pending_page_content')
        .update(updates)
        .eq('id', 1);

    if (error) {
        console.error("Error updating pending content:", error);
        return { error: 'Failed to update content. Check server logs.' };
    }

    revalidatePath('/admin/pending-settings');
    revalidatePath('/pending');

    return { error: null };
}

export async function deletePendingImage() {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('pending_page_content')
        .update({ image_url: null, updated_at: new Date().toISOString() })
        .eq('id', 1);
    
    if (error) {
        console.error("Error deleting pending image:", error);
        return { error: 'Failed to delete image.' };
    }

    revalidatePath('/admin/pending-settings');
    revalidatePath('/pending');

    return { error: null };
}
