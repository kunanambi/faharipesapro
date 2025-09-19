
"use client";

import { useState, useEffect, useMemo } from 'react';
import { createClient } from "@/lib/supabase/client";
import type { PublicUser } from "@/lib/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, UserCheck, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserList } from "@/components/admin/user-list";
import { useToast } from '@/hooks/use-toast';
import { ApprovalTable } from '@/components/admin/approval-table';

export default function UserManagementPage() {
    const supabase = createClient();
    const { toast } = useToast();
    const [users, setUsers] = useState<PublicUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            // RLS is disabled, so a direct select will work.
            const { data, error } = await supabase.from('users').select('*');

            if (error) {
                console.error("Error fetching users:", error);
                toast({
                    title: "Error loading users",
                    description: "Could not fetch user data. Please try again.",
                    variant: "destructive"
                });
            } else {
                setUsers(data as PublicUser[]);
            }
            setLoading(false);
        };

        fetchUsers();
    }, [supabase, toast]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        );
    }, [users, searchTerm]);

    const stats = useMemo(() => {
        const total = users.length;
        const approved = users.filter(u => u.status === 'approved').length;
        const pending = users.filter(u => u.status === 'pending').length;
        return { total, approved, pending };
    }, [users]);
    
    const handleUserUpdate = (updatedUser: PublicUser) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleStatusToggle = (userId: string, newStatus: 'approved' | 'pending') => {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    }
    
    const onUserApproved = (approvedUserId: string) => {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === approvedUserId ? { ...user, status: 'approved' } : user
          )
        );
    };

    if (loading) {
        return <div>Loading users...</div>
    }
    
    const pendingUsers = users.filter(user => user.status === 'pending');
    const approvedUsers = filteredUsers.filter(user => user.status === 'approved');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage all users on the platform.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Users" value={stats.total.toString()} icon={<Users />} cardClassName="bg-blue-600/90 text-white" description="" />
                <StatCard title="Approved" value={stats.approved.toString()} icon={<UserCheck />} cardClassName="bg-green-600/90 text-white" description="" />
                <StatCard title="Pending" value={stats.pending.toString()} icon={<Clock />} cardClassName="bg-yellow-600/90 text-white" description="" />
            </div>
            
            <ApprovalTable users={pendingUsers} onUserApproved={onUserApproved} />

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search approved users by name, username, email, or phone..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <UserList users={approvedUsers} onUserUpdate={handleUserUpdate} onStatusToggle={handleStatusToggle} />

        </div>
    )
}
