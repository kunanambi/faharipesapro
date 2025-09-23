
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import { addSpinConfig, getSpinConfigs, deleteSpinConfig } from "./actions";
import type { SpinConfig } from "@/lib/types";
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
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
    "#6A3B99", "#55A630", "#E5383B", "#C71F66", "#F07167", 
    "#0B4DA0", "#0081A7", "#007200", "#FFC300", "#D4A373"
];

export default function AdminSpinSettingsPage() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [configs, setConfigs] = useState<SpinConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    const fetchConfigs = async () => {
        setLoading(true);
        const fetchedConfigs = await getSpinConfigs();
        setConfigs(fetchedConfigs);
        setLoading(false);
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const prizeLabel = formData.get('prize_label') as string;

        if (!prizeLabel || !selectedColor) {
            toast({ title: "Error", description: "Label and color are required.", variant: "destructive"});
            setIsSubmitting(false);
            return;
        }

        const result = await addSpinConfig({ prize_label: prizeLabel, prize_color: selectedColor });

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive"});
        } else {
            toast({ title: "Success", description: "Spin configuration added."});
            setConfigs(prev => [...prev, result.data as SpinConfig].sort((a, b) => a.spin_order - b.spin_order));
            formRef.current?.reset();
            // Cycle to the next color for convenience
            const nextColorIndex = (PRESET_COLORS.indexOf(selectedColor) + 1) % PRESET_COLORS.length;
            setSelectedColor(PRESET_COLORS[nextColorIndex]);
        }
        setIsSubmitting(false);
    };
    
    const handleDelete = async (id: number) => {
        const result = await deleteSpinConfig(id);
        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive"});
        } else {
            toast({ title: "Success", description: "Spin configuration deleted."});
            setConfigs(prev => prev.filter(c => c.id !== id));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">Spin Wheel Settings</h1>
                    <p className="text-muted-foreground">Define the prizes and appearance of the spin wheel.</p>
                </div>
                <Button onClick={fetchConfigs} variant="outline" size="icon" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Spin Prize</CardTitle>
                    <CardDescription>
                        Each prize you add will appear as a segment on the wheel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleFormSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="prize_label">Prize Label</Label>
                            <Input id="prize_label" name="prize_label" placeholder="e.g., TSH 100 or TRY AGAIN" required />
                        </div>
                        <div className="grid gap-2">
                            <Label>Prize Color</Label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={cn(
                                            "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                                            selectedColor === color ? "border-primary scale-110" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Prize
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Wheel Segments</CardTitle>
                     <CardDescription>This is the list of prizes currently on the wheel, in order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Prize</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : configs.length > 0 ? (
                                    configs.map((config) => (
                                        <TableRow key={config.id}>
                                            <TableCell className="font-medium">{config.spin_order}</TableCell>
                                            <TableCell>{config.prize_label}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 rounded-full border" style={{backgroundColor: config.prize_color}} />
                                                    {config.prize_color}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the "{config.prize_label}" segment.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(config.id)} className="bg-destructive hover:bg-destructive/90">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No spin configurations found. Add one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
