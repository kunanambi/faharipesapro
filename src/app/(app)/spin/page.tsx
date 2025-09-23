
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function SpinPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Zungusha Gurudumu</h1>
                <p className="text-muted-foreground">Test your luck and win exciting prizes!</p>
            </div>
            
            <Card className="bg-muted/30">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mb-4" />
                        <p className="font-semibold text-lg text-foreground">No Available Spin</p>
                        <p>The Spin Wheel game is not available at the moment. Please check back later.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
