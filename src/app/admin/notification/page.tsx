
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotification } from "./actions";
import { NotificationForm } from "./notification-form";

export default async function AdminNotificationPage() {
    
    const notificationData = await getNotification();

    if (!notificationData) {
         return (
            <div className="space-y-6">
                <h1 className="font-headline text-3xl font-bold">Manage Offer Notification</h1>
                <p className="text-destructive">Could not load notification settings. Please check database configuration.</p>
            </div>
        )
    }

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
                    <NotificationForm notification={notificationData} />
                </CardContent>
            </Card>
        </div>
    )
}
