
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { claimReward } from "./actions";
import { CheckCircle, Download, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)([\w-]{11})/,
        /(?:https-?:\/\/)?youtu\.be\/([\w-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    if (/^[\w-]{11}$/.test(url)) {
        return url;
    }
    console.error("Could not parse YouTube URL or ID:", url);
    return null;
}

function OtherAdContent({ url }: { url: string }) {
    return (
        <div className="text-center p-8 border-dashed border-2 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Complete Action</h3>
            <p className="text-muted-foreground mb-4">Click the button below to open the content in a new tab.</p>
            <Button asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Open Content
                </a>
            </Button>
        </div>
    )
}

function WhatsAppAdContent({ url, title }: { url: string, title: string }) {
    const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg');

    return (
        <div className="space-y-4">
             <div className="text-center p-4 border-dashed border-2 rounded-lg bg-muted/20">
                <h3 className="font-bold text-lg mb-2">How to Earn</h3>
                <ol className="text-sm text-muted-foreground list-decimal list-inside text-left mx-auto max-w-sm">
                    <li>Download the media below.</li>
                    <li>Post it on your WhatsApp status.</li>
                    <li>Wait for 24 hours.</li>
                    <li>After viewing, click "Claim Reward" below.</li>
                </ol>
            </div>
            {isVideo ? (
                 <video controls src={url} className="w-full rounded-lg border" />
            ) : (
                <Image src={url} alt={title} width={500} height={500} className="w-full h-auto rounded-lg border" />
            )}
            <Button asChild className="w-full">
                <a href={url} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Media
                </a>
            </Button>
        </div>
    )
}


export default async function WatchAdPage({ params }: { params: { adId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/');
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

    const { data: watchedAd } = await supabase
        .from('user_watched_ads')
        .select('ad_id')
        .eq('user_id', user.id)
        .eq('ad_id', params.adId)
        .single();
    
    if (watchedAd) {
        redirect(`/earn/${ad.ad_type}?error=already_watched`);
    }

    let adContent;

    if (ad.ad_type === 'youtube') {
        const videoId = getYouTubeVideoId(ad.url);
        if (!videoId) {
             return (
                <Card>
                    <CardHeader>
                        <CardTitle>Invalid Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The YouTube video URL for this ad is invalid. Please contact an administrator.</p>
                    </CardContent>
                </Card>
            );
        }
        adContent = (
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
        );
    } else if (ad.ad_type === 'instagram' && (ad.url.includes('/p/') || ad.url.includes('/reel/'))) {
        // Simple image display for Instagram, as embedding is complex and restricted.
        adContent = <OtherAdContent url={ad.url} />;
    } else if (ad.ad_type === 'whatsapp') {
        adContent = <WhatsAppAdContent url={ad.url} title={ad.title} />;
    }
    else {
        // Fallback for TikTok, Facebook, or other types
        adContent = <OtherAdContent url={ad.url} />;
    }
    
    return (
        <div className="space-y-6">
             <div>
                <h1 className="font-headline text-3xl font-bold">{ad.title}</h1>
                <p className="text-muted-foreground">View the content below to earn your reward.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Reward: {ad.reward_amount} TZS</CardTitle>
                </CardHeader>
                <CardContent>
                    {adContent}
                </CardContent>
                <CardFooter>
                    <form action={claimReward}>
                        <input type="hidden" name="adId" value={ad.id} />
                        <input type="hidden" name="adType" value={ad.ad_type} />
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
