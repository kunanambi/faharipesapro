
'use client';

import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updatePendingContent } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Content = {
    id: number;
    title: string;
    instructions: string;
    payment_number: string;
    payment_name: string;
    updated_at: string | null;
}

export function PendingContentForm({ content }: { content: Content }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

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
        }
        setIsSubmitting(false);
    }
    
    return (
        <form ref={formRef} action={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={content.title} required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea id="instructions" name="instructions" defaultValue={content.instructions} required rows={4} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="payment_name">Payment Name</Label>
                    <Input id="payment_name" name="payment_name" defaultValue={content.payment_name} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="payment_number">Payment Number</Label>
                    <Input id="payment_number" name="payment_number" defaultValue={content.payment_number} required />
                </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}
