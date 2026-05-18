import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { User as UserIcon, AlertTriangle } from 'lucide-react';
import { updateMe, deleteMe } from '@/api/users';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const schema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(8, 'Min 8 characters').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      password: '',
    },
  });

  const updateMut = useMutation({
    mutationFn: updateMe,
    onSuccess: (updated) => {
      setUser(updated);
      toast({ title: 'Profile updated' });
    },
    onError: (err: AxiosError<ApiError>) => {
      toast({ title: 'Update failed', description: err.response?.data?.error, variant: 'destructive' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      logout();
      navigate('/');
      toast({ title: 'Account deleted' });
    },
    onError: (err: AxiosError<ApiError>) => {
      toast({ title: 'Delete failed', description: err.response?.data?.error, variant: 'destructive' });
    },
  });

  function onSubmit(values: FormValues) {
    const payload: Record<string, string> = {};
    if (values.first_name !== undefined) payload.first_name = values.first_name;
    if (values.last_name !== undefined) payload.last_name = values.last_name;
    if (values.email) payload.email = values.email;
    if (values.password) payload.password = values.password;
    updateMut.mutate(payload);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>

      {/* Profile info card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>{user?.first_name ?? ''} {user?.last_name ?? ''}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" {...register('first_name')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...register('last_name')} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-[var(--color-destructive)]">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" placeholder="Leave blank to keep current" {...register('password')} />
              {errors.password && <p className="text-xs text-[var(--color-destructive)]">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting || !isDirty || updateMut.isPending}>
              {updateMut.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-[var(--color-destructive)]/30">
        <CardHeader>
          <div className="flex items-center gap-2 text-[var(--color-destructive)]">
            <AlertTriangle className="h-4 w-4" />
            <CardTitle className="text-base">Danger zone</CardTitle>
          </div>
          <CardDescription>Permanently delete your account and all associated files.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            Delete account
          </Button>
        </CardContent>
      </Card>

      {/* Confirm delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all your files. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={() => deleteMut.mutate()}
            >
              {deleteMut.isPending ? 'Deleting…' : 'Yes, delete my account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
