
import { ApprovalTable } from "@/components/admin/approval-table";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseUser } from "@/lib/types";

export default async function UserManagementPage() {
    const supabase = createClient();
    
    // Fetch all users from auth.users
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("Error fetching auth users:", authError);
        return <div>Error loading users.</div>;
    }

    // Fetch statuses from the public.users table
    const userIds = authUsers.map(u => u.id);
    const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('id, status')
        .in('id', userIds);

    if (publicError) {
        console.error("Error fetching public users:", publicError);
        return <div>Error loading user statuses.</div>;
    }

    // Create a map for quick status lookup
    const statusMap = new Map(publicUsers.map(u => [u.id, u.status]));

    // Combine auth user data with the status from the public table
    const combinedUsers = authUsers.map(user => ({
        ...user,
        dbStatus: statusMap.get(user.id) || 'pending' // Default to pending if not found
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
