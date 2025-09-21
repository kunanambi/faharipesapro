
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm, SubmitHandler } from "react-hook-form";
import { addAd, getAdsByType } from "./actions";
import type { Ad } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

type Inputs = {
  title: string;
  url: string;
  reward_amount: number;
};

export default function AdminYouTubeVideosPage() {
    const { toast } = useToast();
    const [videos, setVideos] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Inputs>();
    const adType = 'youtube';

    const fetchVideos = async () => {
        setLoading(true);
        const fetchedVideos = await getAdsByType(adType);
        setVideos(fetchedVideos);
        setLoading(false);
    }

    useEffect(() => {
        fetchVideos();
    }, []);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        const result = await addAd({ ...data, adType });
        if (result.error) {
            toast({
                title: "Error adding video",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Video Added",
                description: "The new YouTube video has been added successfully.",
            });
            reset();
            fetchVideos(); // Refresh the list
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage YouTube Videos</h1>
                <p className="text-muted-foreground">Add, remove, and manage YouTube videos for users to watch.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New YouTube Video</CardTitle>
                     <CardDescription>
                        Enter the details for the new video.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Video Title</Label>
                            <Input id="title" placeholder="e.g., 'Official Music Video'" {...register("title", { required: true })} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="url">YouTube Video URL or ID</Label>
                            <Input id="url" placeholder="https://www.youtube.com/watch?v=..." {...register("url", { required: true })} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="reward_amount">Reward Amount (TZS)</Label>
                            <Input id="reward_amount" type="number" placeholder="e.g., 100" {...register("reward_amount", { required: true, valueAsNumber: true })} />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Video"}
                        </Button>
                     </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing YouTube Videos</CardTitle>
                    <CardDescription>
                        A list of all YouTube videos currently in the system.
                    </CardDescription>
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
                                ) : videos.length > 0 ? (
                                    videos.map((video) => (
                                        <TableRow key={video.id}>
                                            <TableCell className="font-medium">{video.title}</TableCell>
                                            <TableCell>{video.reward_amount} TZS</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant={video.is_active ? "default" : "secondary"}>
                                                    {video.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No YouTube videos found.
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
