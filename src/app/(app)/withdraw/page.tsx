
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
import { toast } from "@/hooks/use-toast";

export default async function WithdrawPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const { data: publicUser } = await supabase.from('users').select('username, phone, balance').eq('id', user.id).single();
    const { data: withdrawalHistory, error: historyError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (historyError) {
        console.error("Error fetching withdrawal history:", historyError);
    }
    
    const username = publicUser?.username || "user";
    const phone = publicUser?.phone || "";
    const balance = publicUser?.balance || 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value) + ' TZS';
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">Hi, {username}!</p>
                    <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                        <CreditCard className="h-8 w-8 text-primary" />
                        Request Withdrawal
                    </h1>
                </div>
                 <div className="text-right">
                    <p className="text-muted-foreground">Available Balance</p>
                    <p className="font-bold text-2xl text-green-400">{formatCurrency(balance)}</p>
                </div>
            </div>
            
            {searchParams.error && (
                <div className="p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                    <p className="font-bold">Error</p>
                    <p>{searchParams.error}</p>
                </div>
            )}
             {searchParams.success && (
                <div className="p-4 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md">
                    <p className="font-bold">Success</p>
                    <p>{searchParams.success}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardDescription>Minimum withdrawal is 4,800 TZS. A 6% VAT will be applied.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={requestWithdrawal} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (TZS)</Label>
                            <Input id="amount" name="amount" type="number" placeholder="Enter amount" required min="4800" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="phone" name="phone" type="tel" placeholder="0712345678" defaultValue={phone} required className="pl-10" />
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
