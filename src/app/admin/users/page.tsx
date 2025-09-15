

import { ApprovalTable } from "@/components/admin/approval-table";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseUser } from "@/lib/types";

// This is a simplified type for the data we get from the public.users table
type PublicUser = {
    id: string;
    created_at: string;
    full_name: string;
    username: string;
    email: string;
    phone: string;
    status: 'pending' | 'approved' | 'rejected';
    role: string;
}

export default async function UserManagementPage() {
    const supabase = createClient();
    
    // Fetch all users from the public.users table.
    // This will rely on RLS policies to allow the admin to see all users.
    const { data: users, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error("Error fetching users:", error);
        return (
            <div className="text-red-500">
                <p>Error loading users: {error.message}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                    This might be because the Row Level Security (RLS) policies are not set up correctly. 
                    Please ensure you have run the SQL script provided to enable admin access to the users table.
                </p>
            </div>
        );
    }
    
    // The data from public.users doesn't match the SupabaseUser type exactly.
    // We need to map it to the structure that ApprovalTable expects.
    const combinedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        raw_user_meta_data: {
            full_name: user.full_name,
            username: user.username,
            phone: user.phone,
            balance: 0, // These fields are not in the public.users table yet
            net_profit: 0,
            status: user.status,
        },
        dbStatus: user.status,
    })) as (SupabaseUser & { dbStatus: 'pending' | 'approved' | 'rejected' })[];


    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage new user registrations.</p>
            </div>
            <ApprovalTable users={combinedUsers} />
        </div>
    )
}

