
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { addAd, getAdsByType } from "../youtube/actions"; // Re-using actions
import type { Ad } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

type Inputs = {
  title: string;
  url: string;
  reward_amount: number;
};

export default function AdminFacebookVideosPage() {
    const { toast } = useToast();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Inputs>();
    const adType = 'facebook';

    const fetchAds = async () => {
        setLoading(true);
        const fetchedAds = await getAdsByType(adType);
        setAds(fetchedAds);
        setLoading(false);
    }

    useEffect(() => {
        fetchAds();
    }, []);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        const result = await addAd({ ...data, adType });
        if (result.error) {
            toast({
                title: "Error adding ad",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Ad Added",
                description: "The new Facebook ad has been added successfully.",
            });
            reset();
            fetchAds(); // Refresh the list
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Facebook Videos</h1>
                <p className="text-muted-foreground">Add, remove, and manage Facebook videos for users to watch.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Facebook Ad</CardTitle>
                     <CardDescription>
                        Enter the details for the new ad.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Ad Title</Label>
                            <Input id="title" placeholder="e.g., 'Special Promotion'" {...register("title", { required: true })} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="url">Facebook Video URL</Label>
                            <Input id="url" placeholder="https://www.facebook.com/watch/?v=..." {...register("url", { required: true })} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="reward_amount">Reward Amount (TZS)</Label>
                            <Input id="reward_amount" type="number" placeholder="e.g., 100" {...register("reward_amount", { required: true, valueAsNumber: true })} />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Ad"}
                        </Button>
                     </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Facebook Ads</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Reward</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="text-right">URL</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : ads.length > 0 ? (
                                    ads.map((ad) => (
                                        <TableRow key={ad.id}>
                                            <TableCell className="font-medium">{ad.title}</TableCell>
                                            <TableCell>{ad.reward_amount} TZS</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant={ad.is_active ? "default" : "secondary"}>
                                                    {ad.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={ad.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No Facebook ads found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
