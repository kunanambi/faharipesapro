
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addWhatsAppAd } from "./actions";
import { getAdsByType } from "../youtube/actions";
import type { Ad } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";

export default function AdminWhatsAppAdsPage() {
    const { toast } = useToast();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const adType = 'whatsapp';

    const fetchAds = async () => {
        setLoading(true);
        const fetchedAds = await getAdsByType(adType);
        setAds(fetchedAds);
        setLoading(false);
    }

    useEffect(() => {
        fetchAds();
    }, []);

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const result = await addWhatsAppAd(formData);
        if (result.error) {
            toast({
                title: "Error adding ad",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Ad Added",
                description: "The new WhatsApp ad has been added successfully.",
            });
            formRef.current?.reset();
            fetchAds();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage WhatsApp Ads</h1>
                <p className="text-muted-foreground">Upload media for users to share on their status.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New WhatsApp Ad</CardTitle>
                    <CardDescription>
                        Upload a photo or video for the new ad.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <form ref={formRef} action={handleFormSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Ad Title</Label>
                            <Input id="title" name="title" placeholder="e.g., 'Fahari Pesa Promotion'" required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="media">Media (Photo/Video)</Label>
                            <Input id="media" name="media" type="file" required accept="image/*,video/*" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="reward_amount">Reward Amount (TZS)</Label>
                            <Input id="reward_amount" name="reward_amount" type="number" placeholder="e.g., 500" required />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Uploading..." : "Add Ad"}
                        </Button>
                     </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing WhatsApp Ads</CardTitle>
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
                                            No WhatsApp ads found.
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
