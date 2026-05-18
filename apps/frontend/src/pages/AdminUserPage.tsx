import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { getUser, updateUser, deleteUser } from '@/api/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import type { AdminUserUpdatePayload } from '@/types';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export function AdminUserPage() {
  const { userid } = useParams<{ userid: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', userid],
    queryFn: () => getUser(userid!),
    enabled: !!userid,
  });

  const updateMut = useMutation({
    mutationFn: (payload: AdminUserUpdatePayload) => updateUser(userid!, payload),
    onSuccess: (updated) => {
      qc.setQueryData(['admin-user', userid], updated);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User updated' });
    },
    onError: (err: AxiosError<ApiError>) => {
      toast({ title: 'Update failed', description: err.response?.data?.error, variant: 'destructive' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteUser(userid!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      navigate('/admin');
      toast({ title: 'User deleted' });
    },
    onError: (err: AxiosError<ApiError>) => {
      toast({ title: 'Delete failed', description: err.response?.data?.error, variant: 'destructive' });
    },
  });

  if (isLoading) return <p className="mt-10 text-center text-sm">Loading…</p>;
  if (!user) return <p className="mt-10 text-center text-sm text-[var(--color-destructive)]">User not found.</p>;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate('/admin')}>
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Button>

      <h1 className="mb-6 text-2xl font-bold">Edit User</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{user.email}</CardTitle>
            <div className="flex gap-2">
              {user.is_superuser && <Badge>Admin</Badge>}
              <Badge variant={user.is_active ? 'secondary' : 'destructive'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <CardDescription>UUID: {user.uuid}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>First name</Label>
              <Input
                defaultValue={user.first_name ?? ''}
                onBlur={(e) => {
                  if (e.target.value !== (user.first_name ?? '')) {
                    updateMut.mutate({ first_name: e.target.value });
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Last name</Label>
              <Input
                defaultValue={user.last_name ?? ''}
                onBlur={(e) => {
                  if (e.target.value !== (user.last_name ?? '')) {
                    updateMut.mutate({ last_name: e.target.value });
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              defaultValue={user.email}
              onBlur={(e) => {
                if (e.target.value !== user.email) {
                  updateMut.mutate({ email: e.target.value });
                }
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateMut.mutate({ is_active: !user.is_active })}
              disabled={updateMut.isPending}
            >
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateMut.mutate({ is_superuser: !user.is_superuser })}
              disabled={updateMut.isPending}
            >
              {user.is_superuser ? 'Revoke admin' : 'Make admin'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-[var(--color-destructive)]/30">
        <CardHeader>
          <div className="flex items-center gap-2 text-[var(--color-destructive)]">
            <AlertTriangle className="h-4 w-4" />
            <CardTitle className="text-base">Danger zone</CardTitle>
          </div>
          <CardDescription>Permanently delete this user and all their files.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            Delete user
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{user.email}</strong> and all their files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate()}>
              {deleteMut.isPending ? 'Deleting…' : 'Delete user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
