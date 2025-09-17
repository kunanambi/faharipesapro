
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Phone, Building, User as UserIcon, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { requestWithdrawal } from "./actions";
import type { User } from "@supabase/supabase-js";

type PublicUser = {
    username: string;
    phone: string;
    balance: number;
}

type WithdrawalHistory = {
    id: number;
    amount: number;
    network: string;
    created_at: string;
    status: 'paid' | 'pending' | 'declined';
}

export default function WithdrawPage() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [user, setUser] = useState<User | null>(null);
    const [publicUser, setPublicUser] = useState<PublicUser | null>(null);
    const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
    
    const [amount, setAmount] = useState<number>(0);
    const [newBalance, setNewBalance] = useState<number>(0);

    const error = searchParams.get('error');
    const success = searchParams.get('success');

    useEffect(() => {
        const getData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push('/');
                return;
            }
            setUser(authUser);

            const { data: publicUserData, error: publicUserError } = await supabase
                .from('users')
                .select('username, phone, balance')
                .eq('id', authUser.id)
                .single();
            
            if (publicUserError || !publicUserData) {
                console.error("Error fetching public user data:", publicUserError);
                return;
            }
            setPublicUser(publicUserData);
            setNewBalance(publicUserData.balance || 0);

            const { data: historyData, error: historyError } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: false });

            if (historyError) {
                console.error("Error fetching withdrawal history:", historyError);
            } else {
                setWithdrawalHistory(historyData as WithdrawalHistory[]);
            }
        };

        getData();
    }, [supabase, router]);

    const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newAmount = Number(e.target.value);
        setAmount(newAmount);

        if (publicUser) {
            if (newAmount > 0) {
                 const vat = newAmount * 0.06;
                 const totalDeduction = newAmount + vat;
                 setNewBalance(publicUser.balance - totalDeduction);
            } else {
                setNewBalance(publicUser.balance);
            }
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value) + ' TZS';
    };

    if (!publicUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">Hi, {publicUser?.username || "user"}!</p>
                    <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                        <CreditCard className="h-8 w-8 text-primary" />
                        Request Withdrawal
                    </h1>
                </div>
                 <div className="text-right">
                    <p className="text-muted-foreground">Available Balance</p>
                    <p className="font-bold text-2xl text-green-400">{formatCurrency(newBalance)}</p>
                </div>
            </div>
            
            {error && (
                <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
             {success && (
                <div className="p-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md">
                    <p className="font-bold">Success</p>
                    <p>{success}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardDescription>Minimum withdrawal is 4,800 TZS. A 6% VAT will be applied to the withdrawal amount and deducted from your balance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={requestWithdrawal} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (TZS)</Label>
                            <Input id="amount" name="amount" type="number" placeholder="Enter amount" required min="4800" onChange={handleAmountChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="phone" name="phone" type="tel" placeholder="0712345678" defaultValue={publicUser?.phone || ""} required className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method">Network</Label>
                             <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Select name="network" required>
                                    <SelectTrigger id="method" className="pl-10">
                                        <SelectValue placeholder="Select Network" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                                        <SelectItem value="Tigo Pesa">Tigo Pesa</SelectItem>
                                        <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                                        <SelectItem value="HaloPesa">HaloPesa</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-name">Registration Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="reg-name" name="registrationName" type="text" placeholder="Enter registered name" required className="pl-10"/>
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg">
                            Request Withdrawal
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-6 w-6" />
                        Withdrawal History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="hidden sm:table-cell">Method</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawalHistory && withdrawalHistory.length > 0 ? (
                                    withdrawalHistory.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{formatCurrency(req.amount)}</TableCell>
                                            <TableCell className="hidden sm:table-cell">{req.network}</TableCell>
                                            <TableCell className="hidden md:table-cell">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    className={cn(
                                                        "text-xs font-bold capitalize",
                                                        req.status === "paid"
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : req.status === "pending"
                                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                                    )}
                                                    variant="outline"
                                                >
                                                    {req.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No withdrawal history found.
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
