"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Shield, User } from "lucide-react";

export function LoginView() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-grid-slate-100 dark:bg-grid-slate-900">
      <style jsx>{`
        .bg-grid-slate-100 {
          background-image: linear-gradient(
              hsl(var(--primary) / 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              to right,
              hsl(var(--primary) / 0.03) 1px,
              hsl(var(--background)) 1px
            );
          background-size: 20px 20px;
        }
        .dark .bg-grid-slate-900 {
           background-image: linear-gradient(
              hsl(var(--primary) / 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to right,
              hsl(var(--primary) / 0.1) 1px,
              hsl(var(--background)) 1px
            );
          background-size: 20px 20px;
        }
      `}</style>
      <Card className="w-full max-w-sm shadow-2xl border-2 border-primary/10">
        <CardHeader className="items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-headline text-4xl">Fahari Pesa</CardTitle>
          <CardDescription className="pt-2">
            Your partner in financial growth. Please select your role to
            continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">
              <User />
              Login as User
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/admin/dashboard">
              <Shield />
              Login as Admin
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="flex-col items-center gap-2">
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?
          </p>
          <Button asChild variant="link" className="p-0 h-auto">
            <Link href="/register">Create one now</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
