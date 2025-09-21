
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Withdrawal } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, RefreshCw } from "lucide-react";
import { approveWithdrawal, rejectWithdrawal } from "./actions";
import { cn } from "@/lib/utils";

const VAT_RATE = 0.06; // 6%

export default function AdminWithdrawalsPage() {
    const { toast } = useToast();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchWithdrawals = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('withdrawals')
            .select(`*`) // We no longer need the explicit join
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: "Error", description: "Could not fetch withdrawals.", variant: "destructive" });
        } else {
            setWithdrawals(data as Withdrawal[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleApprove = async (id: string) => {
        setUpdatingId(id);
        const result = await approveWithdrawal(id);
        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Withdrawal approved." });
            setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'approved' } : w));
        }
        setUpdatingId(null);
    };

    const handleReject = async (id: string) => {
        setUpdatingId(id);
        const result = await rejectWithdrawal(id);
        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Withdrawal rejected." });
            setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'rejected' } : w));
        }
        setUpdatingId(null);
    };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value) + ' TZS';
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                 <div>
                    <h1 className="font-headline text-3xl font-bold">Withdrawal Requests</h1>
                    <p className="text-muted-foreground">Review and process user withdrawal requests.</p>
                </div>
                 <Button onClick={fetchWithdrawals} variant="outline" size="icon" disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>
           
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
                                ) : withdrawals.filter(w => w.status === 'pending').length > 0 ? (
                                    withdrawals.filter(w => w.status === 'pending').map((w) => {
                                        const vatAmount = w.amount * VAT_RATE;
                                        const netPayable = w.amount - vatAmount;

                                        return (
                                        <TableRow key={w.id}>
                                            <TableCell>
                                                <div className="font-medium">{w.user_username}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold">{formatCurrency(w.amount)}</div>
                                                <div className="text-xs text-red-500">VAT (6%): {formatCurrency(vatAmount)}</div>
                                                <div className="text-sm font-semibold text-green-500">Payable: {formatCurrency(netPayable)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">Name: {w.registration_name}</div>
                                                <div className="text-sm text-muted-foreground">Network: {w.network}</div>
                                                <div className="text-sm text-muted-foreground">Phone: {w.phone_number}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {updatingId === w.id ? <Loader2 className="h-4 w-4 animate-spin ml-auto" /> : (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="outline" size="icon" className="h-8 w-8 text-green-500" onClick={() => handleApprove(w.id)}><Check className="h-4 w-4"/></Button>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleReject(w.id)}><X className="h-4 w-4"/></Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )})
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No pending requests.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Processed Requests</CardTitle>
                     <CardDescription>History of approved and rejected withdrawal requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {loading ? (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
                                ) : withdrawals.filter(w => w.status !== 'pending').length > 0 ? (
                                    withdrawals.filter(w => w.status !== 'pending').map((w) => (
                                        <TableRow key={w.id}>
                                            <TableCell>
                                                <div className="font-medium">{w.user_username}</div>
                                            </TableCell>
                                            <TableCell>{formatCurrency(w.amount)}</TableCell>
                                            <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={w.status === 'approved' ? 'default' : 'destructive'} className={cn(w.status === 'approved' && "bg-green-600")}>{w.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow><TableCell colSpan={4} className="h-24 text-center">No processed requests.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
