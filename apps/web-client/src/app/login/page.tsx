'use client';

import { useState } from 'react';
import LandingPage from '@/app/landing/page';
import AuthModal from '@/components/AuthModal';

export default function LoginPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative min-h-screen">
      <LandingPage />
      <AuthModal isOpen={open} onClose={() => setOpen(false)} mode="login" />
    </div>
  );
}
