import { apiClient } from '@/lib/api';
import type { User, AdminUserUpdatePayload } from '@/types';

export interface UserListResponse {
  users: User[];
  total: number;
}

export async function listUsers(limit = 10, offset = 0): Promise<UserListResponse> {
  const { data } = await apiClient.get<UserListResponse>('/admin', {
    params: { limit, offset },
  });
  return data;
}

export async function getUser(userid: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/admin/${userid}`);
  return data;
}

export async function updateUser(userid: string, payload: AdminUserUpdatePayload): Promise<User> {
  const { data } = await apiClient.patch<User>(`/admin/${userid}`, payload);
  return data;
}

export async function deleteUser(userid: string): Promise<void> {
  await apiClient.delete(`/admin/${userid}`);
}
