import { useEffect } from 'react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import { useToastState, setToastFn } from '@/lib/toast';

export function Toaster() {
  const { toasts, addToast, removeToast } = useToastState();

  useEffect(() => {
    setToastFn(addToast);
  }, [addToast]);

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          open
          onOpenChange={(open) => {
            if (!open) removeToast(t.id);
          }}
          duration={4000}
        >
          <div className="grid gap-1">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
