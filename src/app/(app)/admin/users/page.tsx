
import { ApprovalTable } from "@/components/admin/approval-table";

export default function UserManagementPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage new user registrations.</p>
            </div>
            <ApprovalTable />
        </div>
    )
}
