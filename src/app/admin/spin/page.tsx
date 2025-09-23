
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";
import { getSpinPrizes, updateSpinPrizes } from "./actions";
import { cn } from "@/lib/utils";

interface SpinPrizes {
    round1_prize: string;
    round2_prize: string;
    round3_prize: string;
}

export default function AdminSpinSettingsPage() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [prizes, setPrizes] = useState<SpinPrizes | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPrizes = async () => {
        setLoading(true);
        const fetchedPrizes = await getSpinPrizes();
        if (fetchedPrizes) {
            setPrizes(fetchedPrizes);
        } else {
             toast({ title: "Error", description: "Could not load spin settings. Make sure you have run the required SQL setup.", variant: "destructive"});
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPrizes();
    }, []);

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const newPrizes = {
            round1_prize: formData.get('round1_prize') as string,
            round2_prize: formData.get('round2_prize') as string,
            round3_prize: formData.get('round3_prize') as string,
        };

        const result = await updateSpinPrizes(newPrizes);

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive"});
        } else {
            toast({ title: "Success", description: "Spin prizes have been updated."});
            if(result.data) {
                setPrizes(result.data);
            }
        }
        setIsSubmitting(false);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Spin Prize Settings</h1>
                    <p className="text-muted-foreground">Define the prizes for each of the 3 spin rounds.</p>
                </div>
                <Button onClick={fetchPrizes} variant="outline" size="icon" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Set Spin Prizes</CardTitle>
                    <CardDescription>
                        When a user plays, they will get these prizes in order for 3 rounds.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : prizes ? (
                        <form ref={formRef} action={handleFormSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="round1_prize">Round 1 Prize</Label>
                                <Input id="round1_prize" name="round1_prize" placeholder="e.g., 100 or TRY AGAIN" required defaultValue={prizes.round1_prize} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="round2_prize">Round 2 Prize</Label>
                                <Input id="round2_prize" name="round2_prize" placeholder="e.g., 180 or 0" required defaultValue={prizes.round2_prize} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="round3_prize">Round 3 Prize</Label>
                                <Input id="round3_prize" name="round3_prize" placeholder="e.g., 50 or TRY AGAIN" required defaultValue={prizes.round3_prize} />
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
