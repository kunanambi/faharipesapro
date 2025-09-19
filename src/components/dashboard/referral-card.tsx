
"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export function ReferralCard({ referralCode }: { referralCode: string }) {
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/register?ref=${referralCode}`;
      setReferralLink(link);
    }
  }, [referralCode]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share your referral link.",
    });
  };

  return (
    <Card className="bg-card border border-border">
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold mb-4 text-center">Copy Your Referral Link</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input value={referralLink} readOnly className="bg-background"/>
          <Button variant="default" onClick={handleCopy} className="bg-green-600 hover:bg-green-700 text-white">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
