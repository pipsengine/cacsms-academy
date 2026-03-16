'use client';

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';

export default function RegisterPage() {
  const [open, setOpen] = useState(true);
  const [country] = useState<'Nigeria' | 'International'>(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Lagos') || tz.includes('Africa/Lagos')) {
        return 'Nigeria';
      }
    } catch {
      // Ignore
    }
    return 'International';
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <AuthModal isOpen={open} onClose={() => setOpen(false)} mode="register" defaultCountry={country} />
    </div>
  );
}
