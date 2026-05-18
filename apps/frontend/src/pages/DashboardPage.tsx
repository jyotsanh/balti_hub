import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload, Download, Trash2, FileText, FileJson, File, RefreshCw,
} from 'lucide-react';
import { listBlobs, uploadBlob, downloadBlob, deleteBlob } from '@/api/blobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { extractBlobId } from '@/lib/utils';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const MAX_BLOBS = 5;
const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED_TYPES = ['text/plain', 'application/json', 'application/pdf'];

function fileIcon(url: string) {
  if (url.endsWith('.json') || url.includes('json')) return <FileJson className="h-5 w-5 text-yellow-500" />;
  if (url.endsWith('.pdf') || url.includes('pdf')) return <File className="h-5 w-5 text-red-500" />;
  return <FileText className="h-5 w-5 text-blue-500" />;
}

export function DashboardPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['blobs'],
    queryFn: listBlobs,
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => uploadBlob(file, setUploadProgress),
    onSuccess: (resp) => {
      qc.invalidateQueries({ queryKey: ['blobs'] });
      setUploadProgress(null);
      toast({ title: 'Uploaded!', description: resp.file_metadata.file_name });
    },
    onError: (err: AxiosError<ApiError>) => {
      setUploadProgress(null);
      const status = err.response?.status;
      let description = err.response?.data?.error ?? 'Upload failed';
      if (status === 403) description = 'You have reached the 5-file limit.';
      if (status === 413) description = 'File is too large (max 3 MB).';
      if (status === 415) description = 'File type not supported (TXT, JSON, PDF only).';
      if (status === 429) description = 'Too many requests. Please slow down.';
      toast({ title: 'Upload failed', description, variant: 'destructive' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteBlob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blobs'] });
      setDeleteTarget(null);
      toast({ title: 'File deleted' });
    },
    onError: (err: AxiosError<ApiError>) => {
      setDeleteTarget(null);
      toast({ title: 'Delete failed', description: err.response?.data?.error, variant: 'destructive' });
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Unsupported type', description: 'Only TXT, JSON, and PDF files are allowed.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: 'File too large', description: 'Maximum file size is 3 MB.', variant: 'destructive' });
      return;
    }

    uploadMut.mutate(file);
  }

  async function handleDownload(url: string) {
    const blobId = extractBlobId(url);
    try {
      const blob = await downloadBlob(blobId);
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = blobId;
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  }

  const total = data?.total ?? 0;
  const blobs = data?.blobs ?? [];
  const slotsLeft = MAX_BLOBS - total;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Files</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
            {total} / {MAX_BLOBS} files used
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={slotsLeft === 0 ? 'destructive' : slotsLeft <= 2 ? 'secondary' : 'default'}>
            {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left
          </Badge>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMut.isPending || slotsLeft === 0}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload file
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json,.pdf,text/plain,application/json,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="mb-4 flex flex-col gap-1">
          <p className="text-sm text-[var(--color-muted-foreground)]">Uploading… {uploadProgress}%</p>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-[var(--color-muted-foreground)]">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading files…
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-[var(--color-destructive)]">Failed to load files. Try refreshing.</p>
      )}

      {!isLoading && blobs.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius)] border border-dashed border-[var(--color-border)] py-20 text-[var(--color-muted-foreground)]">
          <Upload className="h-8 w-8" />
          <p className="text-sm">No files yet. Click "Upload file" to get started.</p>
        </div>
      )}

      {/* File grid */}
      {blobs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blobs.map((url) => {
            const blobId = extractBlobId(url);
            return (
              <Card key={url}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    {fileIcon(url)}
                    <CardTitle className="flex-1 truncate text-sm font-medium" title={blobId}>
                      {blobId}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleDownload(url)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-[var(--color-destructive)] hover:bg-[var(--color-destructive)] hover:text-white"
                    onClick={() => setDeleteTarget(blobId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The file will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget)}
            >
              {deleteMut.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
