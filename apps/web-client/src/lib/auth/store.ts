import bcrypt from 'bcryptjs';

export type Role = 'Super Admin' | 'Administrator' | 'User';
export type PlanType = 'Free' | 'Professional' | 'Premium';
export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled' | 'Pending';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  country: string;
  role: Role;
  createdDate: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: PlanType;
  price: number;
  currency: string;
  startDate: string;
  expiryDate: string;
  paymentProvider: string;
  status: SubscriptionStatus;
}

// In-memory mock database
class Store {
  users: User[] = [];
  subscriptions: Subscription[] = [];

  constructor() {
    // Seed an admin user
    const adminId = 'admin-1';
    this.users.push({
      id: adminId,
      name: 'Admin User',
      email: 'admin@cacsms.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      country: 'Nigeria',
      role: 'Super Admin',
      createdDate: new Date().toISOString()
    });
    this.subscriptions.push({
      id: 'sub-1',
      userId: adminId,
      planType: 'Premium',
      price: 0,
      currency: '₦',
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      paymentProvider: 'System',
      status: 'Active'
    });
  }
}

// Singleton instance
export const db = new Store();
