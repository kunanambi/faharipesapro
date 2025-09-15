
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Play, Youtube, Cog, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const adminLinks = [
    { href: "/admin/users", title: "User Management", icon: <Users /> },
    { href: "/admin/withdrawals", title: "Withdrawal Requests", icon: <CreditCard /> },
    { href: "/admin/videos/youtube", title: "YouTube Videos", icon: <Youtube /> },
    { href: "/admin/videos/tiktok", title: "Tiktok Videos", icon: <Play /> },
    { href: "/admin/videos/facebook", title: "Facebook Videos", icon: <Play /> },
    { href: "/admin/spin", title: "Spin Settings", icon: <Cog /> },
]

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your platform from one place.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminLinks.map(link => (
                    <Link href={link.href} key={link.title}>
                        <Card className="hover:bg-accent hover:text-accent-foreground transition-colors h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                                <div className="text-muted-foreground">{link.icon}</div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">Manage {link.title.toLowerCase()}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
             <Card className="bg-card border border-border">
                <CardContent className="pt-6">
                <Button asChild className="w-full" variant="outline">
                    <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    User Panel
                    </Link>
                </Button>
                </CardContent>
            </Card>
        </div>
    )
}
