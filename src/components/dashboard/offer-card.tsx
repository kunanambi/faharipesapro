"use client";

import { Bell, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

export function OfferCard() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="relative rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white shadow-lg">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <Bell className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold">New offer available!</h3>
                    <p className="text-sm">Earn double on TikTok Ads today.</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-white hover:bg-white/20 hover:text-white" onClick={() => setIsVisible(false)}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </Button>
            </div>
        </div>
    );
}
