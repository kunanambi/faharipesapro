
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { claimReward } from "./actions";
import { CheckCircle } from "lucide-react";

function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;

    // Comprehensive regex to handle various YouTube URL formats including Shorts
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)([\w-]{11})/,
        /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    // Fallback for raw IDs (if no pattern matches, but it looks like an ID)
    // A typical YouTube ID is 11 characters long and base64.
    // This regex is a bit more specific.
    if (/^[\w-]{11}$/.test(url)) {
        return url;
    }

    console.error("Could not parse YouTube URL or ID:", url);
    return null;
}


export default async function WatchAdPage({ params }: { params: { adId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/');
    }

    // Check if user has already watched this ad
    const { data: watchedAd, error: watchedError } = await supabase
        .from('user_watched_ads')
        .select('ad_id')
        .eq('user_id', user.id)
        .eq('ad_id', params.adId)
        .single();
    
    if (watchedAd) {
        // If they have, redirect them with a message
        redirect('/earn?error=already_watched');
    }


    const { data: ad, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', params.adId)
        .eq('is_active', true)
        .single();

    if (error || !ad) {
        notFound();
    }

    const videoId = getYouTubeVideoId(ad.url);

    if (!videoId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invalid Video</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The YouTube video URL is invalid. Please contact an administrator.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
             <div>
                <h1 className="font-headline text-3xl font-bold">{ad.title}</h1>
                <p className="text-muted-foreground">Watch the full video below to earn your reward.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Reward: {ad.reward_amount} TZS</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video w-full rounded-lg overflow-hidden border">
                         <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </CardContent>
                <CardFooter>
                    <form action={claimReward}>
                        <input type="hidden" name="adId" value={ad.id} />
                        <input type="hidden" name="rewardAmount" value={ad.reward_amount} />
                        <Button size="lg">
                            <CheckCircle className="mr-2 h-5 w-5"/>
                            Claim Reward
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}
