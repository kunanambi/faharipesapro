
"use client";

import { Bell, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface NotificationData {
    title: string;
    description: string;
    is_active: boolean;
}

export function OfferCard() {
    const [notification, setNotification] = useState<NotificationData | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotification = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('offer_notification')
                .select('title, description, is_active')
                .eq('id', 1)
                .single();

            if (!error && data) {
                setNotification(data);
                // Check if the notification is active and hasn't been closed in this session
                const sessionClosed = sessionStorage.getItem('offerCardClosed');
                if (data.is_active && !sessionClosed) {
                    setIsVisible(true);
                }
            }
            setIsLoading(false);
        };

        fetchNotification();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Remember that the user closed it for this session
        sessionStorage.setItem('offerCardClosed', 'true');
    };

    if (isLoading || !isVisible || !notification) {
        return null;
    }

    return (
        <div className="relative rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white shadow-lg">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <Bell className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold">{notification.title}</h3>
                    <p className="text-sm">{notification.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-white hover:bg-white/20 hover:text-white" onClick={handleClose}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </Button>
            </div>
        </div>
    );
}
