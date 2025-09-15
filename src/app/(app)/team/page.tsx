import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="font-headline text-3xl font-bold">My Team</h1>
            <p className="text-muted-foreground">View your team members and earnings.</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed rounded-lg">
                    <Users className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">You don't have any team members yet.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
