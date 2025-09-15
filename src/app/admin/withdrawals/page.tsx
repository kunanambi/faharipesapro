
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

// This is placeholder data. We will replace this with real data from Supabase later.
const withdrawalRequests = [
    { id: '1', username: 'johndoe', amount: 5000, method: 'M-Pesa', phone: '0712345678', date: '2023-11-15' },
    { id: '2', username: 'janesmith', amount: 10000, method: 'Tigo Pesa', phone: '0612345678', date: '2023-11-14' },
    { id: '3', username: 'mikej', amount: 2500, method: 'Airtel Money', phone: '0788123456', date: '2023-11-13' },
]

export default function AdminWithdrawalsPage() {
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
                                {withdrawalRequests.length > 0 ? (
                                    withdrawalRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">@{req.username}</TableCell>
                                            <TableCell>{req.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{req.method}</Badge>
                                            </TableCell>
                                            <TableCell>{req.phone}</TableCell>
                                            <TableCell>{req.date}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200">
                                                        <Check className="h-4 w-4" />
                                                        <span className="sr-only">Approve</span>
                                                    </Button>
                                                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Reject</span>
                                                    </Button>
                                                </div>
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
