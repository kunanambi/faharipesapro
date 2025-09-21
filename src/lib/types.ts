
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
  total_earnings: number | null;
  invited_by: string | null;
  referral_code: string | null;
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
  };
  // This status comes from our public.users table
  dbStatus: 'pending' | 'approved' | 'rejected';
};

export type Ad = {
    id: string;
    created_at: string;
    title: string;
    ad_type: 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'whatsapp';
    url: string;
    reward_amount: number;
    is_active: boolean;
};

export type Withdrawal = {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  phone_number: string;
  status: 'pending' | 'approved' | 'rejected';
  user_username: string | null;
  registration_name: string | null; // Added
  network: string | null; // Added
  users?: {
    full_name: string | null;
    email: string | null;
  }
};
