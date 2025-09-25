
'use server';

import { createClient as createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}

export async function updatePendingContent(formData: FormData) {
    const supabase = createAdminClient(); // Use admin client for elevated privileges
    
    const title = formData.get('title') as string;
    const instructions = formData.get('instructions') as string;
    const payment_number = formData.get('payment_number') as string;
    const payment_name = formData.get('payment_name') as string;
    const imageFile = formData.get('image') as File;
    const removeImage = formData.get('remove_image') === 'true';

    const updateData: { [key: string]: any } = {
        title,
        instructions,
        payment_number,
        payment_name,
        updated_at: new Date().toISOString(),
    };

    if (removeImage) {
        updateData.image_url = null;
    } else if (imageFile && imageFile.size > 0) {
        updateData.image_url = await fileToDataUri(imageFile);
    }
    
    const { error } = await supabase
        .from('pending_page_content')
        .update(updateData)
        .eq('id', 1);

    if (error) {
        console.error("Error updating pending page content:", error);
        return { error: 'Failed to update content. ' + error.message };
    }

    revalidatePath('/admin/pending-settings');
    revalidatePath('/pending');

    return { error: null };
}

export async function getPendingContent() {
    const supabase = createAdminClient();
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
