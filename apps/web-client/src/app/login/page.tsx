'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import AuthModal from '@/components/AuthModal';

export default function LoginPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    router.push('/');
  };

  return (
    <div className="relative min-h-screen">
      <LandingPage />
      <AuthModal isOpen={open} onClose={handleClose} mode="login" />
    </div>
  );
}
