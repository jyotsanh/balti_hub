import { apiClient } from '@/lib/api';
import type { User, UserUpdatePayload } from '@/types';

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<User>('/user', payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/user/me');
  return data;
}

export async function updateMe(payload: UserUpdatePayload): Promise<User> {
  const { data } = await apiClient.patch<User>('/user/me', payload);
  return data;
}

export async function deleteMe(): Promise<void> {
  await apiClient.delete('/user/me');
}
