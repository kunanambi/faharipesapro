
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WithdrawalActions } from "./actions-client";

export default async function AdminWithdrawalsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/');

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') redirect('/dashboard');

    const { data: withdrawalRequests, error } = await supabase
        .from('withdrawals')
        .select('*, users(username)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching withdrawal requests:", error);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Withdrawal Requests</h1>
                <p className="text-muted-foreground">Approve or decline user withdrawal requests.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                        Review and process pending withdrawal requests from users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Amount (TZS)</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawalRequests && withdrawalRequests.length > 0 ? (
                                    withdrawalRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">@{req.users.username}</TableCell>
                                            <TableCell>{req.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{req.network}</Badge>
                                            </TableCell>
                                            <TableCell>{req.phone_number}</TableCell>
                                            <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <WithdrawalActions requestId={req.id} userId={req.user_id} amount={req.amount} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No pending withdrawal requests.
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
