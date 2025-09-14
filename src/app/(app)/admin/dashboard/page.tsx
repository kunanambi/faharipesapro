import { ApprovalTable } from "@/components/admin/approval-table";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage user registrations and platform settings.</p>
            </div>
            <ApprovalTable />
        </div>
    )
}
