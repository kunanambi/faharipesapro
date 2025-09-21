
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Ad, PublicUser } from "@/lib/types";
import { Download, MessageCircle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

async function getAds(adType: Ad['ad_type']) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .eq('ad_type', adType)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${adType} ads:`, error);
        return [];
    }
    return data as Ad[];
}

export default function EarnWhatsAppPage() {
    const { toast } = useToast();
    const supabase = createClient();
    const [user, setUser] = useState<PublicUser | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [views, setViews] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const { data: publicUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();
                setUser(publicUser);
            }
        };

        const fetchAds = async () => {
            const whatsappAds = await getAds('whatsapp');
            setAds(whatsappAds);
            setLoading(false);
        };
        
        fetchUserData();
        fetchAds();
    }, [supabase]);

    const handleDownload = (url: string, title: string) => {
        // Using a link to trigger download
        const link = document.createElement('a');
        link.href = url;
        // The 'download' attribute suggests a filename to the browser.
        // It's not guaranteed to work for all origins due to security policies.
        link.setAttribute('download', `fahari-pesa-${title.replace(/\s+/g, '-')}`); 
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Downloading...",
            description: "Your media is being downloaded. Share it on your status!",
        });
    };
    
    const whatsappNumber = "+255768525345";
    const generateMessage = (adTitle: string) => `Hi Sir, I have shared the ad "${adTitle}" on my status. I got ${views} views. Please verify and credit my account. Username: ${user?.username || ''}`;

    if (loading) {
        return <div>Loading ads...</div>;
    }

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="font-headline text-3xl font-bold">WhatsApp Ads</h1>
                <p className="text-muted-foreground">Share on your status to earn.</p>
            </div>
            {ads.length > 0 ? (
                <div className="space-y-4">
                    {ads.map(ad => {
                        const isVideo = ad.url.includes('.mp4') || ad.url.includes('.mov');
                        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(generateMessage(ad.title))}`;
                        
                        return (
                        <Card key={ad.id} className="bg-card border border-border/50 overflow-hidden">
                            <CardHeader>
                                <CardTitle>{ad.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isVideo ? (
                                    <video controls src={ad.url} className="w-full rounded-md border" />
                                ) : (
                                    <div className="relative w-full aspect-video">
                                        <Image src={ad.url} alt={ad.title} fill objectFit="contain" className="rounded-md"/>
                                    </div>
                                )}
                                <Button onClick={() => handleDownload(ad.url, ad.title)} className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Media
                                </Button>
                            </CardContent>
                             <CardFooter className="flex-col items-start space-y-4 bg-muted/30 p-4">
                                <Label htmlFor={`views-${ad.id}`} className="font-semibold">Step 1: Enter Your Status Views</Label>
                                <Input 
                                    id={`views-${ad.id}`}
                                    type="number" 
                                    placeholder="e.g., 150" 
                                    value={views} 
                                    onChange={(e) => setViews(e.target.value)}
                                    className="bg-background"
                                />
                                 <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Info className="h-4 w-4"/>
                                    After entering views, click the WhatsApp button to send your screenshot for verification.
                                 </p>
                            </CardFooter>

                             {views && (
                                <a 
                                    href={whatsappUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
                                >
                                    <MessageCircle className="h-8 w-8" />
                                </a>
                            )}
                        </Card>
                    )})}
                </div>
            ) : (
                 <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <Info className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="font-semibold text-lg">No New WhatsApp Ads</p>
                            <p className="text-muted-foreground">Please check back later for new ads.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
