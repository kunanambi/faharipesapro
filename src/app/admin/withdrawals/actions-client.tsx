
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import { useTransition } from "react";
import { approveWithdrawal, declineWithdrawal } from "./actions";

interface WithdrawalActionsProps {
    requestId: number;
    userId: string;
    amount: number;
}

export function WithdrawalActions({ requestId, userId, amount }: WithdrawalActionsProps) {
    const { toast } = useToast();
    let [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveWithdrawal(requestId);
            if (result.success) {
                toast({ title: "Success", description: "Withdrawal approved and marked as paid." });
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    const handleDecline = () => {
        startTransition(async () => {
            const result = await declineWithdrawal(requestId, userId, amount);
             if (result.success) {
                toast({ title: "Success", description: "Withdrawal declined and amount refunded to user." });
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="flex justify-end gap-2">
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200"
                onClick={handleApprove}
                disabled={isPending}
            >
                <Check className="h-4 w-4" />
                <span className="sr-only">Approve</span>
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={handleDecline}
                disabled={isPending}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Reject</span>
            </Button>
        </div>
    );
}
