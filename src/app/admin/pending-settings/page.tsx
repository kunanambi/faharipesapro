
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPendingContent } from "./actions";
import { PendingContentForm } from "./pending-content-form";

export default async function AdminPendingSettingsPage() {
    
    const contentData = await getPendingContent();

    if (!contentData) {
         return (
            <div className="space-y-6">
                <h1 className="font-headline text-3xl font-bold">Manage Pending Page</h1>
                <p className="text-destructive">Could not load pending page settings. Ensure you have run the initial SQL setup.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Pending Page</h1>
                <p className="text-muted-foreground">Control the content shown to users whose accounts are pending approval.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                    <CardDescription>
                        Use the form below to change the text and image on the pending page.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PendingContentForm content={contentData} />
                </CardContent>
            </Card>
        </div>
    )
}
