import { apiClient } from '@/lib/api';
import type { TokenResponse, User } from '@/types';

export async function login(email: string, password: string): Promise<TokenResponse> {
  const params = new URLSearchParams({ username: email, password });
  const { data } = await apiClient.post<TokenResponse>(
    '/login/access-token',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/user/me');
  return data;
}
