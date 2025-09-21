
import { Card, CardContent } from "@/components/ui/card";
import { Info } from 'lucide-react';

export default function EarnWhatsAppPage() {
    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="font-headline text-3xl font-bold">WhatsApp Ads</h1>
                <p className="text-muted-foreground">Share on your status to earn.</p>
            </div>
             <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Info className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="font-semibold text-lg">Not Available</p>
                        <p className="text-muted-foreground">This section is temporarily unavailable. Please check back later.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
