
'use server';

import { createClient } from "@/lib/supabase/server";
import type { Ad } from "@/lib/types";
import { revalidatePath } from "next/cache";

interface AdInput {
    title: string;
    url: string;
    reward_amount: number;
    adType: 'youtube' | 'tiktok' | 'facebook' | 'instagram';
}

export async function addAd(input: AdInput) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('ads')
        .insert({
            title: input.title,
            url: input.url,
            reward_amount: input.reward_amount,
            ad_type: input.adType,
            is_active: true,
        })
        .select()
        .single();
    
    if (error) {
        console.error(`Error adding ${input.adType} ad:`, error);
        return { error: error.message };
    }

    revalidatePath(`/admin/videos/${input.adType}`);
    revalidatePath('/earn');
    return { data, error: null };
}

export async function getAdsByType(adType: string): Promise<Ad[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('ad_type', adType)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${adType} ads:`, error);
        return [];
    }

    return data as Ad[];
}

export async function deleteAd(adId: string, adType: string) {
    const supabase = createClient();

    // If ad is a whatsapp ad, we need to delete the file from storage
    const { data: adData } = await supabase.from('ads').select('url').eq('id', adId).single();
    if (adData && adType === 'whatsapp') {
        try {
            // Extract the path from the full URL
            const url = new URL(adData.url);
            const filePath = url.pathname.split('/whatsapp_ads/').pop(); // Get path after bucket name
            
            if (filePath) {
                 await supabase.storage.from('whatsapp_ads').remove([filePath]);
            }
        } catch(e) {
            console.error("Could not delete from storage", e);
        }
    }


    const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

    if (error) {
        console.error(`Error deleting ad ${adId}:`, error);
        return { error: 'Failed to delete the ad.' };
    }

    revalidatePath(`/admin/videos/${adType}`);
    revalidatePath(`/earn/${adType}`);

    return { error: null };
}
