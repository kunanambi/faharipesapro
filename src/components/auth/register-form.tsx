"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  invitedBy: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      username: "",
      phone: "",
      email: "",
      password: "",
      invitedBy: "fahariceo", // Example referrer username
      terms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password, fullName, username, phone, invitedBy } = values;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          phone,
          invited_by: invitedBy,
          status: 'pending',
          balance: 0,
          net_profit: 0
        },
      },
    });

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    router.push("/pending");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Full Name" {...field} className="bg-white/90 text-black placeholder:text-gray-500 rounded-full py-6 text-lg"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Username" {...field} className="bg-white/90 text-black placeholder:text-gray-500 rounded-full py-6 text-lg"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="tel" placeholder="Phone Number" {...field} className="bg-white/90 text-black placeholder:text-gray-500 rounded-full py-6 text-lg"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} className="bg-white/90 text-black placeholder:text-gray-500 rounded-full py-6 text-lg"/>
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
        
        <p className="text-center text-white">Invited By : fahariceo</p>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 text-white justify-center">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="terms"
                  className="border-white"
                />
              </FormControl>
              <FormLabel htmlFor="terms" className="text-sm font-normal">
                Accept Terms and Conditions
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
            type="submit" 
            className="w-full !mt-10 rounded-full py-6 text-lg font-bold bg-gradient-to-r from-[#e6b366] to-[#d4a050] text-primary-foreground" 
            disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Registering..." : "Register"}
        </Button>
      </form>
    </Form>
  );
}
