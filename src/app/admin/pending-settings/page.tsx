
'use client';

import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updatePendingContent, getPendingContent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import Image from 'next/image';

interface PendingContent {
    id: number;
    title: string;
    instructions: string;
    payment_number: string;
    payment_name: string;
    image_url: string | null;
}

export default function AdminPendingSettingsPage() {
    const { toast } = useToast();
    const [content, setContent] = useState<PendingContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [removeImage, setRemoveImage] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const data = await getPendingContent();
            if (data) {
                setContent(data);
            }
            setLoading(false);
        };
        fetchContent();
    }, []);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        formData.set('remove_image', String(removeImage));

        const result = await updatePendingContent(formData);

        if (result.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Success",
                description: "Pending page content has been updated.",
            });
            // Refetch data to show the latest changes
            const updatedData = await getPendingContent();
            if (updatedData) {
                setContent(updatedData);
            }
            setRemoveImage(false);
             if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Clear the file input
            }
        }
        setIsSubmitting(false);
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading Settings...</p>
            </div>
        );
    }

    if (!content) {
        return <p className="text-destructive">Could not load settings. Please check the database and refresh.</p>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Pending Page</h1>
                <p className="text-muted-foreground">Control the content shown to users whose accounts are pending activation.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Content Settings</CardTitle>
                    <CardDescription>
                        Use the form below to change the text and image on the pending page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Page Title</Label>
                            <Input id="title" name="title" defaultValue={content.title} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="payment_number">Payment Number</Label>
                            <Input id="payment_number" name="payment_number" defaultValue={content.payment_number} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="payment_name">Payment Name</Label>
                            <Input id="payment_name" name="payment_name" defaultValue={content.payment_name} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="instructions">Instructions</Label>
                            <Textarea id="instructions" name="instructions" defaultValue={content.instructions} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image">Image (Optional)</Label>
                             {content.image_url && !removeImage ? (
                                <div className="relative">
                                    <Image src={content.image_url} alt="Current image" width={200} height={200} className="rounded-md border"/>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7"
                                        onClick={() => setRemoveImage(true)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                             ) : (
                                <>
                                    {removeImage && <p className="text-sm text-destructive">Image will be removed on save.</p>}
                                    <Input ref={fileInputRef} id="image" name="image" type="file" accept="image/*" />
                                </>
                             )}
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
