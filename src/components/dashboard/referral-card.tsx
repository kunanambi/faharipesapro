"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function ReferralCard() {
  const { toast } = useToast();
  const referralLink = "https://fahari.co/ref/user123";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share your referral link.",
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline">Referral Program</CardTitle>
        <CardDescription>
          Earn KSh 1,500 for every new user who signs up with your link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input value={referralLink} readOnly />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
