
'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestWithdrawal(formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/withdraw?error=You must be logged in to make a withdrawal.');
    }

    const amount = Number(formData.get('amount') as string);
    const phone = formData.get('phone') as string;
    const network = formData.get('network') as string;
    const registrationName = formData.get('registrationName') as string;
    
    // --- Validation ---
    if (!amount || !phone || !network || !registrationName) {
        return redirect('/withdraw?error=All fields are required.');
    }
    if (amount < 4800) {
        return redirect('/withdraw?error=Minimum withdrawal is 4,800 TZS.');
    }
    
    const vat = Math.ceil(amount * 0.06);

    // Insert the withdrawal request. The balance logic is removed.
    const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
            user_id: user.id,
            amount: amount,
            phone_number: phone,
            network: network,
            registration_name: registrationName,
            status: 'pending',
            vat: vat
        });

    if (withdrawalError) {
        console.error("Withdrawal insertion error:", withdrawalError);
        return redirect(`/withdraw?error=Could not create withdrawal request. Please check permissions.`);
    }

    // Revalidate paths to show updated history
    revalidatePath('/withdraw');
    
    return redirect(`/withdraw?success=Your withdrawal request for ${amount} TZS has been submitted successfully!`);
}
