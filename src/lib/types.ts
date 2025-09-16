

export type PublicUser = {
  id: string;
  created_at: string | null;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  status: 'pending' | 'approved';
  role: string | null;
  balance: number | null;
  net_profit: number | null;
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
