'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { isPublicRoute } from '@/lib/auth/redirects';

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const { user, isLoading } = useAuth();
  const pathname = usePathname() || '/';

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id, timestamp: new Date() };
    
    setNotifications((prev) => [newNotification, ...prev].slice(0, 5));

    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  useEffect(() => {
    if (isLoading || !user || isPublicRoute(pathname)) {
      return;
    }

    let active = true;

    const load = async () => {
      const res = await fetch('/api/alerts/history?limit=5', { cache: 'no-store' });
      if (!active || res.status === 401) return;

      const data = await res.json().catch(() => null);
      if (!active || !res.ok || !data?.alerts) return;

      setSeenIds((prevSeen) => {
        const nextSeen = [...prevSeen];
        for (const alert of data.alerts) {
          if (nextSeen.includes(alert.id)) continue;

          addNotification({
            title: alert.title,
            message: alert.message,
            type: alert.severity === 'success' || alert.severity === 'warning' || alert.severity === 'error'
              ? alert.severity
              : 'info',
          });
          nextSeen.push(alert.id);
        }

        return nextSeen.slice(-50);
      });
    };

    void load();
    const interval = setInterval(() => void load(), 20_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [addNotification, isLoading, pathname, user]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${
                notification.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' :
                notification.type === 'warning' ? 'bg-amber-950/80 border-amber-500/30 text-amber-100' :
                notification.type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-100' :
                'bg-zinc-900/80 border-zinc-700/50 text-zinc-100'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{notification.title}</p>
                <p className="text-xs opacity-80 mt-1">{notification.message}</p>
              </div>
              <button 
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
