
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestWithdrawal(formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/?error=You must be logged in to make a withdrawal.');
    }

    const amount = Number(formData.get('amount') as string);
    const phone = formData.get('phone') as string;
    const network = formData.get('network') as string;
    const registrationName = formData.get('registrationName') as string;
    
    // --- Validation (Basic) ---
    if (!amount || !phone || !network || !registrationName) {
        return redirect('/withdraw?error=All fields are required.');
    }
    
    // Call the new, robust database function to handle the transaction
    const { data, error } = await supabase.rpc('request_withdrawal_with_vat', {
        withdrawal_amount: amount,
        phone: phone,
        network_name: network,
        reg_name: registrationName,
    });

    if (error) {
        console.error("RPC Error:", error);
        // This will catch unexpected database errors (like function not existing, etc.)
        return redirect(`/withdraw?error=An unexpected database error occurred: ${error.message}`);
    }

    // The RPC returns a JSON object with 'success' and 'message'
    if (data.success) {
        // Revalidate paths to show updated balance and withdrawal history
        revalidatePath('/dashboard');
        revalidatePath('/withdraw');
        return redirect(`/withdraw?success=${data.message}`);
    } else {
        // Display the specific error message from the database function (e.g., "Insufficient balance")
        return redirect(`/withdraw?error=${data.message}`);
    }
}
