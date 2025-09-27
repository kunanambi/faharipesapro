
'use server';

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}

export async function addWhatsAppAd(formData: FormData) {
    const supabase = createClient();

    const title = formData.get('title') as string;
    const reward_amount = parseFloat(formData.get('reward_amount') as string);
    const mediaFile = formData.get('media') as File;
    
    if (!title || isNaN(reward_amount) || !mediaFile || mediaFile.size === 0) {
        return { error: 'Missing required fields: title, reward amount, or media file.' };
    }

    const mediaDataUri = await fileToDataUri(mediaFile);

    const { data, error: insertError } = await supabase
        .from('ads')
        .insert({
            title,
            reward_amount,
            ad_type: 'whatsapp',
            url: mediaDataUri,
            is_active: true,
        })
        .select()
        .single();
    
    if (insertError) {
        console.error(`Error adding WhatsApp ad:`, insertError);
        return { error: insertError.message };
    }

    revalidatePath(`/admin/videos/whatsapp`);
    revalidatePath('/earn/whatsapp');
    return { data, error: null };
}
