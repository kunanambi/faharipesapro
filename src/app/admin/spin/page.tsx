
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { getSpinSettings, updateSpinSettings } from "./actions";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface SpinSettings {
    round1_prize: string;
    round2_prize: string;
    round3_prize: string;
    is_active: boolean;
    version: number;
}

export default function AdminSpinSettingsPage() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [settings, setSettings] = useState<SpinSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Local state for the switch to provide instant UI feedback
    const [isActive, setIsActive] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        const fetchedSettings = await getSpinSettings();
        if (fetchedSettings) {
            setSettings(fetchedSettings);
            setIsActive(fetchedSettings.is_active);
        } else {
             toast({ title: "Error", description: "Could not load spin settings. Make sure you have run the required SQL setup.", variant: "destructive"});
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const newSettings = {
            round1_prize: formData.get('round1_prize') as string,
            round2_prize: formData.get('round2_prize') as string,
            round3_prize: formData.get('round3_prize') as string,
            is_active: isActive,
        };

        const result = await updateSpinSettings(newSettings);

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive"});
        } else {
            toast({ title: "Success", description: "Spin settings have been updated."});
            if(result.data) {
                // We cast here because result.data has the updated version
                setSettings(result.data as SpinSettings);
                setIsActive(result.data.is_active);
            }
        }
        setIsSubmitting(false);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Spin Prize Settings</h1>
                    <p className="text-muted-foreground">Define the prizes for each round and enable/disable the wheel.</p>
                </div>
                <Button onClick={fetchSettings} variant="outline" size="icon" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Set Spin Prizes & Status</CardTitle>
                    <CardDescription>
                        Set prizes for each round. Use the switch to make the wheel available to users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : settings ? (
                        <form ref={formRef} action={handleFormSubmit} className="space-y-6">
                            <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="is_active" className="text-base font-medium">
                                        Enable Spin Wheel
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Turn this on to allow all users to play the spin wheel.
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
                                <Label htmlFor="round1_prize">Round 1 Prize</Label>
                                <Input id="round1_prize" name="round1_prize" placeholder="e.g., 100 or TRY AGAIN" required defaultValue={settings.round1_prize} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="round2_prize">Round 2 Prize</Label>
                                <Input id="round2_prize" name="round2_prize" placeholder="e.g., 180 or 0" required defaultValue={settings.round2_prize} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="round3_prize">Round 3 Prize</Label>
                                <Input id="round3_prize" name="round3_prize" placeholder="e.g., 50 or TRY AGAIN" required defaultValue={settings.round3_prize} />
                            </div>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Settings
                            </Button>
                        </form>
                    ) : (
                        <p className="text-destructive text-center">Could not load settings.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
