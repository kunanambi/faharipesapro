
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, Wifi, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Image from 'next/image';

const content = {
    title: "Activate Your Account",
    instructions: "After making payment, click the button below and submit your payment screenshot for account activation.",
    payment_number: "0768 525 345",
    payment_name: "Joseph Kunambi",
};

const MastercardLogo = () => (
    <svg width="48" height="30" viewBox="0 0 48 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="48" height="30" rx="4" fill="transparent"/>
        <circle cx="15" cy="15" r="10" fill="#EB001B"/>
        <circle cx="33"cy="15" r="10" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

const FahariLogo = () => (
    <div className="relative w-16 h-16 mb-4">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M5 9C5 7.89543 5.89543 7 7 7H17C18.1046 7 19 7.89543 19 9V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V9Z" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
            <path d="M9 14H13" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 11V17" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M15 7C15 4.79086 13.2091 3 11 3C8.79086 3 7 4.79086 7 7" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        </svg>
    </div>
);


export default function PendingPage() {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }
            setUser(user);
        };
        fetchUser();
    }, [supabase, router]);
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (!user) {
        return <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">Loading...</div>;
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
            <FahariLogo />
            <h1 className="font-headline text-3xl font-bold text-white">Fahari Pesa</h1>
        </div>

        <p className="text-muted-foreground mb-6">
            Hi, <span className="font-bold text-primary">{user?.user_metadata?.username || "user"}</span>! Your account is pending approval. Please complete the payment to activate your account.
        </p>

        <h2 className="font-headline text-2xl font-bold text-white mb-4">{content.title}</h2>

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
