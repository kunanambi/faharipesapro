
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function WithdrawPage() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Here you would typically handle the form submission, e.g., call an API.
        toast({
            title: "Request Submitted",
            description: "Your withdrawal request has been submitted successfully.",
        });
        // Optionally reset the form
        (e.target as HTMLFormElement).reset();
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Withdraw Funds</h1>
                <p className="text-muted-foreground">Request a withdrawal of your earnings.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Withdrawal Form</CardTitle>
                    <CardDescription>Minimum withdrawal is 10,000 TZS.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (TZS)</Label>
                            <Input id="amount" type="number" placeholder="e.g., 15000" required min="10000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method">Payment Method</Label>
                            <Select required>
                                <SelectTrigger id="method">
                                    <SelectValue placeholder="Select a payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                                    <SelectItem value="tigo">Tigo Pesa</SelectItem>
                                    <SelectItem value="airtel">Airtel Money</SelectItem>
                                    <SelectItem value="halopesa">HaloPesa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="e.g., 0712345678" required />
                        </div>
                        <Button type="submit" className="w-full">Submit Request</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
