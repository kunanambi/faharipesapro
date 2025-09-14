import Link from "next/link";
import { RegisterForm } from "./register-form";

export function RegisterView() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
      {/* Decorative elements */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-primary/20" />
      <div className="absolute -top-1/4 -left-1/4 w-[45%] h-[45%] rounded-full border-[1.5px] border-primary/50" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary/20" />
      <div className="absolute -bottom-1/4 -right-1/4 w-[45%] h-[45%] rounded-full border-[1.5px] border-primary/50" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
            <h1 className="font-headline text-5xl font-bold text-white">FAHARI PESA</h1>
        </div>
        <div className="text-center mb-10">
          <h2 className="font-headline text-3xl font-bold text-white">Create Account</h2>
        </div>
        
        <RegisterForm />
        
        <div className="mt-8 text-center">
            <p className="text-sm text-white">
                Already have an account?{' '}
                <Link href="/" className="font-bold underline">
                    Login
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}
