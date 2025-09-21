
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Ad } from "@/lib/types";
import { PlayCircle, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VideoOff } from 'lucide-react';


async function getUnwatchedAds(userId: string) {
    const supabase = createClient();
    
    const { data: allAds, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (adsError) {
        console.error("Error fetching ads:", adsError);
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

export default async function EarnPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const earnOptions = await getUnwatchedAds(user.id);
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value) + ' TZS';
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Earn</h1>
                <p className="text-muted-foreground">Watch videos, posts and ads to earn money.</p>
            </div>
            {earnOptions.length > 0 ? (
                <div className="space-y-4">
                    {earnOptions.map(option => (
                        <Card key={option.id} className="bg-card border border-border/50">
                            <CardContent className="p-4 space-y-3">
                                <h3 className="font-bold text-lg">{option.title}</h3>
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                     <div className="flex items-center gap-1">
                                        <Tag className="h-4 w-4" />
                                        <span className="capitalize">{option.ad_type}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(option.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between p-4 pt-0">
                                <Button variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled>
                                    {formatCurrency(option.reward_amount)}
                                </Button>
                                <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold">
                                    <Link href={`/earn/watch/${option.id}`}>
                                        <PlayCircle className="mr-2 h-5 w-5"/>
                                        PLAY
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <VideoOff className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="font-semibold text-lg">No New Ads</p>
                            <p className="text-muted-foreground">You have watched all available ads. Please check back later.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
