'use client';

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';

export default function LoginPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-950">
      <AuthModal isOpen={open} onClose={() => setOpen(false)} mode="login" />
    </div>
  );
}
