
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ExpenseInput {
    description: string;
    amount: number;
}

export async function getExpenses() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching expenses:", error);
        return [];
    }
    return data;
}

export async function addExpense(input: ExpenseInput) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('expenses')
        .insert({
            description: input.description,
            amount: input.amount,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding expense:", error);
        return { error: 'Failed to add new expense.' };
    }
    
    revalidatePath('/admin/expenses');
    revalidatePath('/admin/dashboard');
    
    return { data, error: null };
}

export async function deleteExpense(expenseId: number) {
    const supabase = createClient();

    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

    if (error) {
        console.error("Error deleting expense:", error);
        return { error: 'Failed to delete expense.' };
    }

    revalidatePath('/admin/expenses');
    revalidatePath('/admin/dashboard');

    return { error: null };
}
