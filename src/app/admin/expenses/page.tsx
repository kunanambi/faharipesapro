
"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { addExpense, getExpenses, deleteExpense } from "./actions";
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

interface Expense {
    id: number;
    description: string;
    amount: number;
    created_at: string;
}

export default function AdminExpensesPage() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchExpenses = async () => {
            setLoading(true);
            const fetchedExpenses = await getExpenses();
            setExpenses(fetchedExpenses);
            setLoading(false);
        };
        fetchExpenses();
    }, []);

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const newExpense = {
            description: formData.get('description') as string,
            amount: parseFloat(formData.get('amount') as string),
        };

        if (!newExpense.description || isNaN(newExpense.amount)) {
            toast({ title: "Invalid Input", description: "Please provide a valid description and amount.", variant: "destructive"});
            setIsSubmitting(false);
            return;
        }

        const result = await addExpense(newExpense);

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive"});
        } else {
            toast({ title: "Success", description: "New expense has been added."});
            formRef.current?.reset();
            setExpenses(prev => [result.data as Expense, ...prev]);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (expenseId: number) => {
        const result = await deleteExpense(expenseId);
        if (result.error) {
            toast({
                title: "Error Deleting",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Deleted",
                description: "The expense record has been deleted.",
            });
            setExpenses(prev => prev.filter(e => e.id !== expenseId));
        }
    }
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US').format(value) + ' TZS';
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Expenses</h1>
                <p className="text-muted-foreground">Add or remove company expenses to track profitability.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Expense</CardTitle>
                    <CardDescription>
                        Enter the details of the expense.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleFormSubmit} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" name="description" placeholder="e.g., Office Rent, Internet Bill" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount (TZS)</Label>
                                <Input id="amount" name="amount" type="number" placeholder="e.g., 50000" required />
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Expense
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Expense History</CardTitle>
                    <CardDescription>
                        List of all recorded business expenses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : expenses.length > 0 ? (
                                    expenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell className="text-sm text-muted-foreground">{new Date(expense.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{expense.description}</TableCell>
                                            <TableCell>{formatCurrency(expense.amount)}</TableCell>
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
                                                                This will permanently delete this expense record.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(expense.id)} className="bg-destructive hover:bg-destructive/90">
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
                                            No expenses found.
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
