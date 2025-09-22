
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Ad } from "@/lib/types";
import { Share2, Calendar, Tag, Info, VideoOff } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

async function getUnwatchedAds(userId: string, adType: Ad['ad_type']) {
    const supabase = createClient();
    
    const { data: allAds, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .eq('ad_type', adType)
        .order('created_at', { ascending: false });

    if (adsError) {
        console.error(`Error fetching ${adType} ads:`, adsError);
        return [];
    }

    const { data: watchedAds, error: watchedError } = await supabase
        .from('user_watched_ads')
        .select('ad_id')
        .eq('user_id', userId);
        
    if (watchedError) {
        console.error("Error fetching watched ads:", watchedError);
        return allAds; 
    }

    const watchedAdIds = new Set(watchedAds.map(ad => ad.ad_id));
    const unwatchedAds = allAds.filter(ad => !watchedAdIds.has(ad.id));
    
    return unwatchedAds as Ad[]; 
}


export default function EarnWhatsAppPage() {
    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="font-headline text-3xl font-bold">WhatsApp Ads</h1>
                <p className="text-muted-foreground">Share on your status to earn.</p>
            </div>
             <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="font-semibold text-lg">Not Yet Implemented</p>
                        <p className="text-muted-foreground">This feature is still under development. Please check back later.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
