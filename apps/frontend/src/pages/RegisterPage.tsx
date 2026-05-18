import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud } from 'lucide-react';
import { register as apiRegister } from '@/api/users';
import { login as apiLogin, getMe } from '@/api/auth';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const schema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await apiRegister(values);
      // Auto-login after registration
      const tokenResp = await apiLogin(values.email, values.password);
      localStorage.setItem('access_token', tokenResp.access_token);
      const user = await getMe();
      login(tokenResp.access_token, user);
      toast({ title: 'Account created!', description: 'Welcome to BaltiHub.' });
      navigate('/dashboard');
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      toast({
        title: 'Registration failed',
        description: e.response?.data?.error ?? 'Something went wrong',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Start storing files on BaltiHub</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" placeholder="Jane" {...register('first_name')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" placeholder="Doe" {...register('last_name')} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-[var(--color-destructive)]">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 8 characters" {...register('password')} />
              {errors.password && <p className="text-xs text-[var(--color-destructive)]">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-[var(--color-muted-foreground)]">
          Already have an account?&nbsp;
          <Link to="/login" className="text-[var(--color-primary)] hover:underline">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
