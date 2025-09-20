import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { YouTubeVideo } from "@/lib/types";
import { Play, Youtube, VideoOff, Tv } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";


async function getUnwatchedAds(userId: string) {
    const supabase = createClient();
    
    // 1. Get all active ads
    const { data: allAds, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true);

    if (adsError) {
        console.error("Error fetching ads:", adsError);
        return [];
    }

    // 2. Get all ads watched by the user
    const { data: watchedAds, error: watchedError } = await supabase
        .from('user_watched_ads')
        .select('ad_id')
        .eq('user_id', userId);
        
    if (watchedError) {
        console.error("Error fetching watched ads:", watchedError);
        return allAds; // Return all ads if watched history fails
    }

    const watchedAdIds = new Set(watchedAds.map(ad => ad.ad_id));

    // 3. Filter out watched ads
    const unwatchedAds = allAds.filter(ad => !watchedAdIds.has(ad.id));
    
    return unwatchedAds as YouTubeVideo[]; // Assuming all ads are YouTube for now
}

export default async function EarnPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const earnOptions = await getUnwatchedAds(user.id);
    
    const getIcon = (adType: string) => {
        switch(adType) {
            case 'youtube': return <Youtube className="h-8 w-8" />;
            case 'tiktok': return <Tv className="h-8 w-8" />;
            case 'facebook': return <Play className="h-8 w-8" />;
            default: return <Play className="h-8 w-8" />;
        }
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Earn</h1>
                <p className="text-muted-foreground">Watch videos and ads to earn money.</p>
            </div>
            {earnOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {earnOptions.map(option => (
                        <Link href={`/earn/watch/${option.id}`} key={option.id}>
                            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors h-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{option.title}</CardTitle>
                                    {getIcon(option.ad_type)}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+{option.reward_amount} TZS</div>
                                    <p className="text-xs text-muted-foreground">per video</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <VideoOff className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="font-semibold text-lg">No New Videos</p>
                            <p className="text-muted-foreground">You have watched all available videos. Please check back later.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
