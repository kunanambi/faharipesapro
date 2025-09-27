
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotification } from "./actions";
import { NotificationForm } from "./notification-form";
import { Skeleton } from "@/components/ui/skeleton";

type Notification = {
    id: number;
    title: string;
    description: string;
    is_active: boolean;
    updated_at: string | null;
}

export default function AdminNotificationPage() {
    const [notificationData, setNotificationData] = useState<Notification | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotificationData = async () => {
            setLoading(true);
            try {
                const data = await getNotification();
                if (data) {
                    setNotificationData(data as Notification);
                } else {
                    setError("Could not load notification settings. Please check database configuration.");
                }
            } catch (e) {
                setError("An unexpected error occurred.");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchNotificationData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Offer Notification</h1>
                <p className="text-muted-foreground">Control the offer pop-up shown to all users on their dashboard.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                        Use the form below to change the message and status of the notification.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    ) : error ? (
                        <p className="text-destructive">{error}</p>
                    ) : notificationData ? (
                        <NotificationForm notification={notificationData} />
                    ) : (
                         <p className="text-destructive">Could not load notification settings. The notification might not exist in the database.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
