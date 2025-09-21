
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Ensure the file exists before using it
export async function addWhatsAppAd(formData: FormData) {
    const supabase = createClient();

    const title = formData.get('title') as string;
    const reward_amount = parseFloat(formData.get('reward_amount') as string);
    const mediaFile = formData.get('media') as File;
    
    if (!title || isNaN(reward_amount) || !mediaFile || mediaFile.size === 0) {
        return { error: 'Missing required fields: title, reward amount, or media file.' };
    }

    // 1. Upload file to Supabase Storage
    const fileExt = mediaFile.name.split('.').pop();
    const fileName = `whatsapp/${Date.now()}.${fileExt}`; // Added a folder for organization
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
        .from('public') // CORRECTED BUCKET NAME
        .upload(filePath, mediaFile);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return { error: 'Failed to upload media file.' };
    }

    // 2. Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
        .from('public') // CORRECTED BUCKET NAME
        .getPublicUrl(filePath);

    if (!urlData) {
        return { error: 'Failed to get public URL for the media file.' };
    }
    const publicUrl = urlData.publicUrl;


    // 3. Insert the ad into the 'ads' table
    const { data, error: insertError } = await supabase
        .from('ads')
        .insert({
            title,
            reward_amount,
            ad_type: 'whatsapp',
            url: publicUrl,
            is_active: true,
        })
        .select()
        .single();
    
    if (insertError) {
        console.error(`Error adding WhatsApp ad:`, insertError);
        // Optionally, delete the uploaded file if the DB insert fails
        await supabase.storage.from('public').remove([filePath]);
        return { error: insertError.message };
    }

    revalidatePath(`/admin/videos/whatsapp`);
    revalidatePath('/earn/whatsapp');
    return { data, error: null };
}
