
'use server';

import { createClient } from "@/lib/supabase/client"; // Changed to client
import { revalidatePath } from "next/cache";

interface NotificationData {
    title: string;
    description: string;
    is_active: boolean;
}

export async function updateNotification(formData: FormData) {
    const supabase = createClient();
    
    const data: NotificationData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        is_active: formData.get('is_active') === 'on',
    };

    if (!data.title || !data.description) {
        return { error: 'Title and description are required.' };
    }

    const { error } = await supabase
        .from('offer_notification')
        .update({
            title: data.title,
            description: data.description,
            is_active: data.is_active,
            updated_at: new Date().toISOString()
        })
        .eq('id', 1);

    if (error) {
        console.error("Error updating notification:", error);
        return { error: 'Failed to update notification.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/notification');

    return { error: null };
}

export async function getNotification() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('offer_notification')
        .select('*')
        .eq('id', 1)
        .single();
    
    if (error) {
        console.error("Error fetching notification settings:", error);
        return null;
    }
    return data;
}
