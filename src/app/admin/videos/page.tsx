
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Play } from "lucide-react";
import Link from "next/link";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

const videoSections = [
    { href: "/admin/videos/youtube", title: "YouTube Videos", icon: <Youtube /> },
    { href: "/admin/videos/tiktok", title: "Tiktok Videos", icon: <Play /> },
    { href: "/admin/videos/facebook", title: "Facebook Videos", icon: <Play /> },
    { href: "/admin/videos/instagram", title: "Instagram Ads", icon: <FaInstagram /> },
    { href: "/admin/videos/whatsapp", title: "WhatsApp Ads", icon: <FaWhatsapp /> },
]

export default function AdminVideosPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Manage Videos</h1>
                <p className="text-muted-foreground">Select a platform to manage videos.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoSections.map(link => (
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
        </div>
    )
}
