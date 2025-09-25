
'use client';

import { useRef, useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { updatePendingContent, deletePendingImage } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Content = {
    id: number;
    title: string;
    instructions: string;
    payment_number: string;
    payment_name: string;
    image_url: string | null;
}

export function PendingContentForm({ content: initialContent }: { content: Content }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [currentImage, setCurrentImage] = useState(initialContent.image_url);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
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
            // This is tricky as we can't easily get the new image URL without a full page reload.
            // For now, we just tell the user it's updated. A page refresh will show the new image.
        }
        setIsSubmitting(false);
    }
    
    const handleDelete = async () => {
        const result = await deletePendingImage();
        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Image has been removed." });
            setCurrentImage(null);
        }
    }
    
    return (
        <form ref={formRef} action={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={initialContent.title} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions Text</Label>
                <Textarea id="instructions" name="instructions" defaultValue={initialContent.instructions} required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="payment_name">Payment Name</Label>
                <Input id="payment_name" name="payment_name" defaultValue={initialContent.payment_name} required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="payment_number">Payment Number</Label>
                <Input id="payment_number" name="payment_number" defaultValue={initialContent.payment_number} required />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">Upload Image</Label>
                <Input id="image" name="image" type="file" accept="image/*" />
                <p className="text-sm text-muted-foreground">Uploading a new image will replace the current one.</p>
            </div>

            {currentImage && (
                <div className="space-y-2">
                    <Label>Current Image</Label>
                    <div className="relative w-full max-w-sm rounded-lg overflow-hidden border">
                         <Image src={currentImage} alt="Pending page image" width={400} height={200} className="object-cover" />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will permanently delete the image from the pending page.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}
