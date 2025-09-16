
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

// This is placeholder data. We will replace this with real data from Supabase later.
const withdrawalHistory = [
    { id: '1', amount: 15000, method: 'M-Pesa', date: '2023-11-10', status: 'Completed' },
    { id: '2', amount: 20000, method: 'Tigo Pesa', date: '2023-11-05', status: 'Completed' },
    { id: '3', amount: 10000, method: 'Airtel Money', date: '2023-10-28', status: 'Pending' },
];

export default async function WithdrawPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }
    
    // We fetch from the public users table which has the correct phone number and username
    const { data: publicUser } = await supabase.from('users').select('username, phone').eq('id', user.id).single();

    const username = publicUser?.username || "user";
    const phone = publicUser?.phone || "";

    return (
        <div className="space-y-8">
            <div>
                <p className="text-muted-foreground">Hi, {username}!</p>
                <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                    <CreditCard className="h-8 w-8 text-primary" />
                    Request Withdrawal
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardDescription>Minimum withdrawal is 10,000 TZS.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (TZS)</Label>
                            <Input id="amount" type="number" placeholder="Enter amount" required min="10000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="phone" type="tel" placeholder="0712345678" defaultValue={phone} required className="pl-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method">Network</Label>
                             <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Select required>
                                    <SelectTrigger id="method" className="pl-10">
                                        <SelectValue placeholder="Select Network" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                                        <SelectItem value="tigo">Tigo Pesa</SelectItem>
                                        <SelectItem value="airtel">Airtel Money</SelectItem>
                                        <SelectItem value="halopesa">HaloPesa</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reg-name">Registration Name</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input id="reg-name" type="text" placeholder="Enter registered name" required className="pl-10"/>
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
                                {withdrawalHistory.length > 0 ? (
                                    withdrawalHistory.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.amount.toLocaleString()} TZS</TableCell>
                                            <TableCell className="hidden sm:table-cell">{req.method}</TableCell>
                                            <TableCell className="hidden md:table-cell">{req.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    className={cn(
                                                        "text-xs font-bold",
                                                        req.status === "Completed"
                                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                        : req.status === "Pending"
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
