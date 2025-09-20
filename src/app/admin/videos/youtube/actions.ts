
'use server';

import { createClient } from "@/lib/supabase/server";
import type { YouTubeVideo } from "@/lib/types";
import { revalidatePath } from "next/cache";

interface VideoInput {
    title: string;
    url: string;
    reward_amount: number;
}

export async function addYouTubeVideo(input: VideoInput) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('ads')
        .insert({
            title: input.title,
            url: input.url,
            reward_amount: input.reward_amount,
            ad_type: 'youtube', // Hardcoded for this action
            is_active: true,
        })
        .select()
        .single();
    
    if (error) {
        console.error("Error adding YouTube video:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/videos/youtube');
    return { data, error: null };
}

export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('ad_type', 'youtube')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }

    return data as YouTubeVideo[];
}
