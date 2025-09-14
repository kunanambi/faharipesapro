import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hourglass } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      {/* Decorative elements */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-primary/20" />
      <div className="absolute -top-1/4 -left-1/4 w-[45%] h-[45%] rounded-full border-[1.5px] border-primary/50" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary/20" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[45%] h-[45%] rounded-full border-[1.5px] border-primary/50" />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="flex flex-col items-center justify-center text-center p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/20 shadow-lg">
          <Hourglass className="h-16 w-16 text-primary mb-6" />
          <h1 className="font-headline text-3xl font-bold mb-3 text-white">
            Registration Pending
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Thank you for registering! Your account is currently awaiting approval from an administrator. You will be notified via email once your account has been activated.
          </p>
          <Button asChild className="rounded-full py-6 text-lg font-bold bg-gradient-to-r from-[#e6b366] to-[#d4a050] text-primary-foreground">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
