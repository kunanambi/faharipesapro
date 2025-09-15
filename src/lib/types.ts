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
    status: 'pending' | 'approved' | 'rejected';
  };
};
