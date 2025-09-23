
import { SpinWheel } from "@/components/dashboard/spin-wheel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { AlertCircle } from "lucide-react";

export default async function SpinPage() {
    const supabase = createClient();
    const { data: spinSettings } = await supabase
        .from('spin_configurations')
        .select('round1_prize, round2_prize, round3_prize, is_active, version')
        .eq('id', 1)
        .single();
    
    const isSpinActive = spinSettings?.is_active ?? false;
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Zungusha Gurudumu</h1>
                <p className="text-muted-foreground">Test your luck and win exciting prizes!</p>
            </div>
            {isSpinActive ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-center">Zungusha Gurudumu!</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="w-full max-w-sm">
                            <SpinWheel settings={spinSettings!} />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mb-4" />
                            <p className="font-semibold text-lg text-foreground">Mchezo Haupatikani</p>
                            <p>Mchezo wa Zungusha Gurudumu haupatikani kwa sasa. Tafadhali jaribu tena baadaye.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
