

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function LoginView() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      toast({
        title: "Login Failed",
        description: signInError.message,
        variant: "destructive",
      });
      return;
    }

    if (signInData.user) {
      // For all users, check their role and status from the public.users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('status, role')
        .eq('id', signInData.user.id)
        .single();

      if (userError || !userData) {
        toast({
          title: "Login Failed",
          description: "Could not verify user status. Please try again.",
          variant: "destructive"
        });
        await supabase.auth.signOut(); // Log them out
        return;
      }
      
      // Check if user is an admin
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
        return;
      }

      // Handle regular users based on status
      if (userData.status === 'pending') {
        router.push('/pending');
      } else if (userData.status === 'approved') {
        router.push("/dashboard");
      } else {
         toast({
          title: "Account Not Active",
          description: "Your account is not active. Please contact support.",
          variant: "destructive"
        });
        await supabase.auth.signOut();
      }
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
        {/* Decorative elements */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-primary/20" />
        <div className="absolute -top-1/4 -left-1/4 w-[45%] h-[45%] rounded-full border-[1.5px] border-primary/50" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-primary/20" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[45%] h-[45%] rounded-full border-[1.5px] border-primary/50" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
            <h1 className="font-headline text-5xl font-bold text-white">FAHARI PESA</h1>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Email" 
                      {...field} 
                      className="bg-white/90 text-black placeholder:text-gray-500 rounded-full py-6 text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...field}
                        className="bg-white/90 text-black placeholder:text-gray-500 rounded-full py-6 text-lg pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
                type="submit" 
                className="w-full !mt-10 rounded-full py-6 text-lg font-bold bg-gradient-to-r from-[#e6b366] to-[#d4a050] text-primary-foreground"
                disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="mt-8 text-center">
            <p className="text-sm text-white">
                Don't have an account?{' '}
                <Link href="/register" className="font-bold underline">
                    Register
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}