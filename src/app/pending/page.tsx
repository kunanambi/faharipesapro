
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, Wifi, Smartphone, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from 'next/image';

interface PendingContent {
    title: string;
    instructions: string;
    payment_number: string;
    payment_name: string;
}

// A simple placeholder for the Mastercard logo
const MastercardLogo = () => (
    <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="48" height="30" rx="4" fill="transparent"/>
        <circle cx="15" cy="15" r="10" fill="#EB001B"/>
        <circle cx="33"cy="15" r="10" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

export default function PendingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [content, setContent] = useState<PendingContent | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }
            setUser(user);
            
            // Fetch content from the new table
            const { data: contentData, error: contentError } = await supabase
                .from('pending_page_content')
                .select('title, instructions, payment_number, payment_name')
                .eq('id', 1)
                .single();

            if (contentData) {
                setContent(contentData);
            } else {
                console.error("Could not fetch pending page content:", contentError);
                // Fallback content
                setContent({
                    title: "Activate Your Account",
                    instructions: "After making payment, click the button below and submit your payment screenshot for account activation.",
                    payment_number: "0768 525 345",
                    payment_name: "Joseph Kunambi",
                });
            }

            setLoading(false);
        };
        fetchData();
    }, [supabase, router]);
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading || !content) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    const whatsappNumber = "+255768525345";
    const whatsappMessage = `Hi Sir, I have made the payment. Please activate my account. Username: ${user?.user_metadata?.username || ''} Email: ${user?.email || ''}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      whatsappMessage
    )}`;


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 font-body">
      <div className="w-full max-w-md text-center">

        <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card border-2 border-primary mb-4">
                <span className="font-headline text-4xl font-bold text-primary">F</span>
            </div>
             <h1 className="font-headline text-3xl font-bold text-white">Fahari Pesa</h1>
        </div>

        <p className="text-muted-foreground mb-6">
            Hi, <span className="font-bold text-primary">{user?.user_metadata?.username || "user"}</span>! Your account is pending approval. Please complete the payment to activate your account.
        </p>

        <h2 className="font-headline text-2xl font-bold text-white mb-4">{content.title}</h2>

        {/* Payment Card */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-yellow-600/30 to-neutral-900 p-6 text-left shadow-2xl mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black/30 backdrop-blur-sm"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <p className="font-semibold">Payment via M-Pesa</p>
                    <Wifi className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-8 bg-neutral-400 rounded-md flex items-center justify-center border-2 border-neutral-500">
                        <Smartphone className="w-5 h-5 text-neutral-800"/>
                    </div>
                </div>

                <div className="font-mono text-xl tracking-wider mb-2">
                    {content.payment_number}
                </div>
                <div className="flex justify-between items-end">
                    <p className="font-semibold text-lg">{content.payment_name}</p>
                    <MastercardLogo />
                </div>
            </div>
        </div>
        
        <p className="text-muted-foreground mb-8">
           {content.instructions}
        </p>

        <div className="space-y-4">
            <Button asChild className="w-full rounded-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700">
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-6 w-6"/>
                    Contact on WhatsApp
                </Link>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full rounded-full py-6 text-lg font-bold border-muted-foreground text-muted-foreground hover:bg-muted/20 hover:text-white">
                <LogOut className="mr-2 h-6 w-6"/>
                Logout
            </Button>
        </div>
      </div>
    </div>
  );
}
