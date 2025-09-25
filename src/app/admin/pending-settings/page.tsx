
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPendingContent } from "./actions";
import { PendingContentForm } from "./pending-content-form";

export default async function AdminPendingSettingsPage() {
    
    const contentData = await getPendingContent();

    if (!contentData) {
         return (
            <div className="space-y-6">
                <h1 className="font-headline text-3xl font-bold">Manage Pending Page</h1>
                <p className="text-destructive">
                    Could not load content settings. Please ensure you have run the initial SQL setup to create the `pending_page_content` table.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Pending Page</h1>
                <p className="text-muted-foreground">Control the information shown to users whose accounts are pending activation.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Page Content</CardTitle>
                    <CardDescription>
                        Use the form below to change the text content displayed on the pending page. The image is fixed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PendingContentForm content={contentData} />
                </CardContent>
            </Card>
        </div>
    )
}
