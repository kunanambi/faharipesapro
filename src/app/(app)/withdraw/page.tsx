
"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { requestWithdrawal } from "./actions";
import { Loader2 } from "lucide-react";
import type { Withdrawal } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  amount: z.coerce.number().min(5000, { message: "Minimum withdrawal amount is TZS 5,000." }),
  registration_name: z.string().min(3, { message: "Please enter a valid name." }),
  network: z.string({ required_error: "Please select a network." }),
  phone_number: z.string().min(10, { message: "Please enter a valid phone number." }),
});

export default function WithdrawPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [phone, setPhone] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        const { data: publicUser } = await supabase
          .from('users')
          .select('balance, phone, full_name')
          .eq('id', user.id)
          .single();

        setBalance(publicUser?.balance || 0);
        setPhone(publicUser?.phone || "");
        setFullName(publicUser?.full_name || "");

        const { data: withdrawalHistory } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (withdrawalHistory) {
            setWithdrawals(withdrawalHistory);
        }

      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 5000,
    },
  });

  useEffect(() => {
    if (phone) form.setValue("phone_number", phone);
    if (fullName) form.setValue("registration_name", fullName);
  }, [phone, fullName, form]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
    if (!user) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }
    
    if (values.amount > balance) {
        form.setError("amount", { type: "manual", message: "You do not have enough balance." });
        return;
    }

    const result = await requestWithdrawal({ ...values, userId: user.id, username: user.user_metadata.username });

    if (result.error) {
      toast({
        title: "Request Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Request Sent",
        description: "Your withdrawal request has been received and is being processed.",
      });
      const newBalance = balance - values.amount;
      setBalance(newBalance);
      setWithdrawals([result.data as Withdrawal, ...withdrawals]);
      form.reset({ amount: 5000, phone_number: phone, registration_name: fullName });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  if (loading) {
    return <div>Loading...</div>;
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value) + ' TZS';
  }

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1 className="font-headline text-3xl font-bold">Withdraw Funds</h1>
        <p className="text-muted-foreground">Request a withdrawal from your account.</p>
      </div>

      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="pt-6">
            <p className="text-sm text-center text-primary-foreground">Your Balance</p>
            <p className="text-3xl font-bold text-center text-white">{formatCurrency(balance)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Form</CardTitle>
          <CardDescription>
            The minimum withdrawal amount is {formatCurrency(5000)}.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter amount..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registration_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                            <SelectItem value="Tigo-Pesa">Tigo-Pesa</SelectItem>
                            <SelectItem value="Halo-Pesa">Halo-Pesa</SelectItem>
                            <SelectItem value="Airtel-Money">Airtel-Money</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number to Receive Funds</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., 0712345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  {withdrawals.length > 0 ? withdrawals.map(w => (
                      <div key={w.id} className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                          <div>
                              <p className="font-bold">{formatCurrency(w.amount)}</p>
                              <p className="text-sm text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
                          </div>
                           <Badge
                                className={cn(
                                    w.status === "approved" && "bg-green-600",
                                    w.status === "pending" && "bg-yellow-600",
                                    w.status === "rejected" && "bg-red-600"
                                )}
                            >
                                {w.status}
                            </Badge>
                      </div>
                  )) : (
                      <p className="text-muted-foreground text-center">You have no withdrawal history.</p>
                  )}
              </div>
          </CardContent>
      </Card>

    </div>
  );
}
