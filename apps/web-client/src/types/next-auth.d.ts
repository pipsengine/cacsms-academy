import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'Super Admin' | 'Administrator' | 'User';
      country: string;
      plan: 'Scout' | 'Analyst' | 'Trader' | 'ProTrader';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    country?: string;
    plan?: string;
  }
}
