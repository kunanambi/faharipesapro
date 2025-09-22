
'use client';

import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateNotification } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Notification = {
    id: number;
    title: string;
    description: string;
    is_active: boolean;
    updated_at: string | null;
}

export function NotificationForm({ notification }: { notification: Notification }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    // Local state to manage switch without waiting for server
    const [isActive, setIsActive] = useState(notification.is_active);

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const result = await updateNotification(formData);

        if (result.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Success",
                description: "Notification settings have been updated.",
            });
        }
        setIsSubmitting(false);
    }
    
    return (
        <form ref={formRef} action={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        Enable Notification
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Turn this on to show the pop-up to all users.
                    </p>
                </div>
                <Switch 
                    id="is_active" 
                    name="is_active" 
                    checked={isActive}
                    onCheckedChange={setIsActive}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input id="title" name="title" defaultValue={notification.title} required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Notification Description</Label>
                <Textarea id="description" name="description" defaultValue={notification.description} required />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}
