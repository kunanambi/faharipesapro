import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
       <div className="absolute top-8 left-8 flex items-center gap-2">
         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-headline text-xl font-bold">Fahari Pesa</span>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>Join our platform and start earning today.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
