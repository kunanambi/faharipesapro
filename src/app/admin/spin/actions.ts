
'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SpinConfigInput {
    prize_label: string;
    prize_color: string;
}

export async function getSpinConfigs() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('spin_configurations')
        .select('*')
        .order('spin_order', { ascending: true });
    
    if (error) {
        console.error("Error fetching spin configs:", error);
        return [];
    }
    return data;
}

export async function addSpinConfig(input: SpinConfigInput) {
    const supabase = createClient();
    
    // First, find the highest current spin_order
    const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('spin_configurations')
        .select('spin_order')
        .order('spin_order', { ascending: false })
        .limit(1)
        .single();
    
    if (maxOrderError && maxOrderError.code !== 'PGRST116') { // PGRST116: No rows found, which is fine
        console.error("Error getting max spin order:", maxOrderError);
        return { error: 'Could not determine spin order.' };
    }
    
    const newOrder = (maxOrderData?.spin_order || 0) + 1;

    // Now, insert the new config
    const { data, error } = await supabase
        .from('spin_configurations')
        .insert({
            spin_order: newOrder,
            prize_label: input.prize_label,
            prize_color: input.prize_color,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding spin config:", error);
        return { error: 'Failed to add new spin prize.' };
    }
    
    revalidatePath('/admin/spin');
    revalidatePath('/spin'); // Revalidate the user-facing spin page
    return { data, error: null };
}

export async function deleteSpinConfig(id: number) {
    const supabase = createClient();
    const { error } = await supabase
        .from('spin_configurations')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting spin config:", error);
        return { error: 'Failed to delete spin prize.' };
    }

    // After deleting, we need to re-order the remaining items to ensure the sequence is contiguous
    const { data: remainingConfigs, error: fetchError } = await supabase
        .from('spin_configurations')
        .select('id')
        .order('spin_order', { ascending: true });
    
    if (fetchError) {
        console.error("Error fetching configs to re-order:", fetchError);
        // Deletion was successful, but re-ordering failed. Not ideal but not a critical failure.
    } else {
        const updates = remainingConfigs.map((config, index) => 
            supabase
                .from('spin_configurations')
                .update({ spin_order: index + 1 })
                .eq('id', config.id)
        );
        await Promise.all(updates);
    }
    
    revalidatePath('/admin/spin');
    revalidatePath('/spin');
    return { error: null };
}
