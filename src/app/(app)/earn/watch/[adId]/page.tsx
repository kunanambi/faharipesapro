

'use client'

import { createClient } from "@/lib/supabase/client";
import { notFound, redirect, useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { claimReward } from "./actions";
import { CheckCircle, Download, Link as LinkIcon, MessageCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import type { Ad, PublicUser } from "@/lib/types";

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

function WhatsAppAdContent({ ad, user }: { ad: Ad, user: PublicUser }) {
    const isVideo = ad.url.startsWith('data:video');
    const [viewsCount, setViewsCount] = useState<string>('');
    const [whatsappUrl, setWhatsappUrl] = useState('');

    useEffect(() => {
        if (viewsCount && Number(viewsCount) > 0) {
            const whatsappNumber = "255768525345"; // Removed '+' from the number
            const whatsappMessage = `Hi Sir, I have shared the ad "${ad.title}" on my status. I got ${viewsCount} views. Please verify and credit my account. Username: ${user.username}`;
            const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
            setWhatsappUrl(url);
        } else {
            setWhatsappUrl('');
        }
    }, [viewsCount, ad.title, user.username]);

    return (
        <>
            <div className="space-y-4">
                 <div className="text-center p-4 border-dashed border-2 rounded-lg bg-muted/20">
                    <h3 className="font-bold text-lg mb-2">How to Earn</h3>
                    <ol className="text-sm text-muted-foreground list-decimal list-inside text-left mx-auto max-w-sm">
                        <li>Download the media below.</li>
                        <li>Post it on your WhatsApp status.</li>
                        <li>After 24 hours, check views and enter the count below.</li>
                        <li>Click the WhatsApp button to send your screenshot.</li>
                        <li>Finally, click "Claim Reward" to submit.</li>
                    </ol>
                </div>
                {isVideo ? (
                     <video controls src={ad.url} className="w-full rounded-lg border" />
                ) : (
                    <Image src={ad.url} alt={ad.title} width={500} height={500} className="w-full h-auto rounded-lg border" />
                )}
                <Button asChild className="w-full">
                    <a href={ad.url} download={`fahari-ad-${ad.id}.${isVideo ? 'mp4' : 'jpg'}`} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download Media
                    </a>
                </Button>
            </div>
            <form action={claimReward}>
                <input type="hidden" name="adId" value={ad.id} />
                <input type="hidden" name="adType" value={ad.ad_type} />
                <input type="hidden" name="rewardAmount" value={ad.reward_amount} />
                
                <div className="space-y-4 pt-6">
                    <div className="grid gap-2">
                        <Label htmlFor="views_count">Number of Views</Label>
                        <Input 
                            id="views_count" 
                            name="views_count" 
                            type="number" 
                            placeholder="e.g., 50" 
                            required 
                            className="bg-background"
                            value={viewsCount}
                            onChange={(e) => setViewsCount(e.target.value)}
                        />
                    </div>
                    <Button size="lg" className="w-full">
                        <CheckCircle className="mr-2 h-5 w-5"/>
                        Claim Reward
                    </Button>
                </div>
            </form>

            {/* Floating WhatsApp Button */}
            {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-4 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-50">
                    <MessageCircle className="h-6 w-6" />
                    <span className="sr-only">Send Screenshot on WhatsApp</span>
                </a>
            )}
        </>
    )
}


export default function WatchAdPage() {
    const params = useParams();
    const adId = params.adId as string;
    const supabase = createClient();
    const router = useRouter();
    const [ad, setAd] = useState<Ad | null>(null);
    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!adId) return;

            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push('/');
                return;
            }

            // Fetch public user data
            const { data: publicUser, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (userError || !publicUser) {
                 console.error("Error fetching user profile:", userError);
                 router.push('/dashboard');
                 return;
            }
            setUser(publicUser as PublicUser);

            // Fetch ad data
            const { data: adData, error: adError } = await supabase
                .from('ads')
                .select('*')
                .eq('id', adId)
                .eq('is_active', true)
                .single();

            if (adError || !adData) {
                notFound();
                return;
            }
            setAd(adData as Ad);

            // Check if ad was already watched
            const { data: watchedAd } = await supabase
                .from('user_watched_ads')
                .select('ad_id')
                .eq('user_id', authUser.id)
                .eq('ad_id', adId)
                .single();
            
            if (watchedAd) {
                redirect(`/earn/${adData.ad_type}?error=already_watched`);
                return;
            }
            
            setLoading(false);
        };
        
        fetchData();
    }, [adId, supabase, router]);

    if (loading || !ad || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    let adContent;
    let claimForm;

    if (ad.ad_type === 'whatsapp') {
        adContent = <WhatsAppAdContent ad={ad} user={user} />;
        // The form is now inside the WhatsAppAdContent component
        claimForm = null;
    } else {
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
        } else {
            // Fallback for TikTok, Facebook, or other types
            adContent = <OtherAdContent url={ad.url} />;
        }
        
        claimForm = (
             <form action={claimReward}>
                <input type="hidden" name="adId" value={ad.id} />
                <input type="hidden" name="adType" value={ad.ad_type} />
                <input type="hidden" name="rewardAmount" value={ad.reward_amount} />
                <Button size="lg">
                    <CheckCircle className="mr-2 h-5 w-5"/>
                    Claim Reward
                </Button>
            </form>
        )
    }
    
    return (
        <div className="space-y-6 pb-32">
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
                {claimForm && (
                     <CardFooter>
                       {claimForm}
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
