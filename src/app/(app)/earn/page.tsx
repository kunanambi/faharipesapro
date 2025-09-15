import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Youtube } from "lucide-react";
import Link from "next/link";

const earnOptions = [
    { title: "Facebook Ads", icon: <Play className="h-8 w-8" />, href: "#" },
    { title: "Instagram Ads", icon: <Play className="h-8 w-8" />, href: "#" },
    { title: "YouTube Videos", icon: <Youtube className="h-8 w-8" />, href: "#" },
    { title: "Tiktok Videos", icon: <Play className="h-8 w-8" />, href: "#" },
]

export default function EarnPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Earn</h1>
                <p className="text-muted-foreground">Watch videos and ads to earn money.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {earnOptions.map(option => (
                    <Link href={option.href} key={option.title}>
                        <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{option.title}</CardTitle>
                                {option.icon}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+100 TZS</div>
                                <p className="text-xs text-muted-foreground">per video</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
