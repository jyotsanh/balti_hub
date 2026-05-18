import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud } from 'lucide-react';
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
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const tokenResp = await apiLogin(values.email, values.password);
      // fetch user profile with the new token
      localStorage.setItem('access_token', tokenResp.access_token);
      const user = await getMe();
      login(tokenResp.access_token, user);
      navigate('/dashboard');
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      toast({
        title: 'Login failed',
        description: e.response?.data?.error ?? 'Invalid credentials',
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
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Log in to your BaltiHub account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-[var(--color-destructive)]">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-[var(--color-destructive)]">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-[var(--color-muted-foreground)]">
          Don't have an account?&nbsp;
          <Link to="/register" className="text-[var(--color-primary)] hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
