import { SpinWheel } from "@/components/dashboard/spin-wheel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SpinPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Spin to Win</h1>
                <p className="text-muted-foreground">Test your luck and win exciting prizes!</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-center">Spin the Wheel!</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="w-full max-w-sm">
                        <SpinWheel />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
