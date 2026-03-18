'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import AuthModal from '@/components/AuthModal';

export default function RegisterPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const handleClose = () => {
    setOpen(false);
    router.push('/');
  };
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
    <div className="relative min-h-screen">
      <LandingPage />
      <AuthModal isOpen={open} onClose={handleClose} mode="register" defaultCountry={country} />
    </div>
  );
}
