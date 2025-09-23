
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { addSpinConfig, getSpinConfigs, deleteSpinConfig } from "./actions";
import type { SpinConfig } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

interface SpinFormInputs {
    round1_prize: string;
    round2_prize: string;
    round3_prize: string;
}

export default function AdminSpinSettingsPage() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [configs, setConfigs] = useState<SpinConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        const newConfig: SpinFormInputs = {
            round1_prize: formData.get('round1_prize') as string,
            round2_prize: formData.get('round2_prize') as string,
            round3_prize: formData.get('round3_prize') as string,
        };

        const result = await addSpinConfig(newConfig);

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive"});
        } else {
            toast({ title: "Success", description: "New spin package has been added."});
            formRef.current?.reset();
            setConfigs(prev => [result.data as SpinConfig, ...prev]);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (configId: number) => {
        const result = await deleteSpinConfig(configId);
        if (result.error) {
            toast({
                title: "Error Deleting",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Deleted",
                description: "The spin package has been deleted.",
            });
            setConfigs(prev => prev.filter(c => c.id !== configId));
        }
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Spin Prize Settings</h1>
                <p className="text-muted-foreground">Add or remove spin packages. Each package has 3 rounds.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Spin Package</CardTitle>
                    <CardDescription>
                        Define the prizes for each of the three rounds in this package.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleFormSubmit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="round1_prize">Round 1 Prize</Label>
                                <Input id="round1_prize" name="round1_prize" placeholder="e.g., 100 or TRY AGAIN" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="round2_prize">Round 2 Prize</Label>
                                <Input id="round2_prize" name="round2_prize" placeholder="e.g., 180 or 0" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="round3_prize">Round 3 Prize</Label>
                                <Input id="round3_prize" name="round3_prize" placeholder="e.g., 50 or TRY AGAIN" required />
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Spin Package
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Spin History</CardTitle>
                    <CardDescription>
                        List of all available spin packages. The game will use the newest one (at the top).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Round 1</TableHead>
                                    <TableHead>Round 2</TableHead>
                                    <TableHead>Round 3</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
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
                                            <TableCell className="font-medium">{config.round1_prize}</TableCell>
                                            <TableCell className="font-medium">{config.round2_prize}</TableCell>
                                            <TableCell className="font-medium">{config.round3_prize}</TableCell>
                                            <TableCell className="text-right space-x-2">
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
                                                                This will permanently delete this spin package.
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
                                            No spin packages found. Add one to enable the game.
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
