'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

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

  // Simulate random market events
  useEffect(() => {
    const events = [
      { title: 'Breakout Detected', message: 'GBPJPY H1 breaking R4 resistance', type: 'success' as const },
      { title: 'Liquidity Sweep', message: 'EURUSD M15 swept previous daily low', type: 'warning' as const },
      { title: 'Volatility Spike', message: 'USDJPY D1 volatility expanding', type: 'info' as const },
      { title: 'AI Probability Update', message: 'AUDNZD LONG probability increased to 82%', type: 'success' as const },
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 15 seconds
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        addNotification(randomEvent);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [addNotification]);

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
