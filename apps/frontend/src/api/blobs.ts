import { apiClient } from '@/lib/api';
import type { BlobListResponse, BlobUploadResponse } from '@/types';

export async function listBlobs(): Promise<BlobListResponse> {
  const { data } = await apiClient.get<BlobListResponse>('/blob/');
  return data;
}

export async function uploadBlob(file: File, onProgress?: (pct: number) => void): Promise<BlobUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<BlobUploadResponse>('/blob/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}

export async function downloadBlob(blobId: string): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(`/blob/${blobId}`, {
    responseType: 'blob',
  });
  return data;
}

export async function deleteBlob(blobId: string): Promise<void> {
  await apiClient.delete(`/blob/${blobId}`);
}
