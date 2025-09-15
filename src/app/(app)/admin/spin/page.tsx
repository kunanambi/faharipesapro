
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSpinSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Spin Wheel Settings</h1>
                <p className="text-muted-foreground">Control the spin wheel feature for all users.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Spin Wheel Status</CardTitle>
                    <CardDescription>
                        Enable or disable the spin wheel for all users on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                Enable Spin Wheel
                            </p>
                            <p className="text-sm text-muted-foreground">
                                When disabled, users will see a "limit reached" message.
                            </p>
                        </div>
                        <Switch id="spin-enabled" defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
