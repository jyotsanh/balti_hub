import { useState, useCallback } from 'react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Simple module-level singleton so any component can trigger toasts
type ToastFn = (item: Omit<ToastItem, 'id'>) => void;
let _addToast: ToastFn = () => {};

export function setToastFn(fn: ToastFn) {
  _addToast = fn;
}

export function toast(item: Omit<ToastItem, 'id'>) {
  _addToast(item);
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
