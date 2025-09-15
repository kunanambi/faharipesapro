
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function AdminTiktokVideosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Tiktok Videos</h1>
                <p className="text-muted-foreground">Add, remove, and manage Tiktok videos for users to watch.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Upload Video</CardTitle>
                     <CardDescription>
                        Upload a new video to be shown in the Tiktok Ads section.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed rounded-lg">
                        <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Drag and drop videos here, or click to browse.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
