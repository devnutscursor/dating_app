import { useState, useId } from 'react';
import { X, Image, Video, Lock, Globe, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiPatch, apiUploadFile } from '@/lib/api';

interface AddMediaModalProps {
  open: boolean;
  onClose: () => void;
  mediaType: 'photo' | 'video';
  isWoman?: boolean;
}

export default function AddMediaModal({ open, onClose, mediaType, isWoman = false }: AddMediaModalProps) {
  const inputId = useId();
  const { user, refreshUser } = useAuth();
  const [isPublic, setIsPublic] = useState(true);
  const [price, setPrice] = useState(100);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    setBusy(true);
    try {
      const path = mediaType === 'photo' ? '/uploads/image' : '/uploads/video';
      const data = await apiUploadFile<{ url: string; thumbnail?: string }>(path, selectedFile);
      if (mediaType === 'photo') {
        const next = {
          url: data.url,
          isPublic: isWoman ? isPublic : true,
          isUnlocked: false,
          status: 'approved' as const,
          ...(isWoman && !isPublic ? { unlockPrice: Math.max(10, Math.floor(price)) } : {}),
        };
        const photos = [...(user.photos ?? []), next];
        await apiPatch('/users/me', { photos });
      } else {
        const thumb = data.thumbnail || data.url;
        const next = {
          url: data.url,
          thumbnail: thumb,
          isPublic: isWoman ? isPublic : true,
          isUnlocked: false,
          status: 'approved' as const,
          ...(isWoman && !isPublic ? { unlockPrice: Math.max(10, Math.floor(price)) } : {}),
        };
        const videos = [...(user.videos ?? []), next];
        await apiPatch('/users/me', { videos });
      }
      await refreshUser();
      toast.success(mediaType === 'photo' ? 'Photo added' : 'Video added');
      setSelectedFile(null);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New {mediaType === 'photo' ? 'Photo' : 'Video'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              className="hidden"
              id={inputId}
            />
            <label htmlFor={inputId} className="cursor-pointer">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                {mediaType === 'photo' ? (
                  <Image className="h-8 w-8 text-gray-500" />
                ) : (
                  <Video className="h-8 w-8 text-gray-500" />
                )}
              </div>
              <p className="mb-1 font-medium text-gray-700">
                {selectedFile ? selectedFile.name : `Drop your ${mediaType} here`}
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </label>
          </div>

          {isWoman && (
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">Privacy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                    isPublic ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                    !isPublic ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Private</span>
                </button>
              </div>
            </div>
          )}

          {isWoman && !isPublic && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Unlock Price</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={10}
                    className="w-20 border-none bg-transparent text-sm font-medium outline-none"
                  />
                </div>
                <span className="text-sm text-gray-500">coins</span>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white p-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-green-500 hover:bg-green-600"
            disabled={!selectedFile || busy}
            onClick={() => void handleUpload()}
          >
            {busy ? 'Uploading…' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
