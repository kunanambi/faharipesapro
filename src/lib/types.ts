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
