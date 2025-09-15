
export type User = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  registeredAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  balance?: number;
  netProfit?: number;
};

// This represents a user from auth.users joined with our public.users table
export type SupabaseUser = {
  id: string;
  email?: string;
  created_at: string;
  raw_user_meta_data: {
    full_name: string;
    username: string;
    phone: string;
    balance: number;
    net_profit: number;
  };
  // This status comes from our public.users table
  dbStatus: 'pending' | 'approved' | 'rejected';
};
