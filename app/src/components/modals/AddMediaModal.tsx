import { useState } from 'react';
import { X, Image, Video, Lock, Globe, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddMediaModalProps {
  open: boolean;
  onClose: () => void;
  mediaType: 'photo' | 'video';
  isWoman?: boolean;
}

export default function AddMediaModal({ open, onClose, mediaType, isWoman = false }: AddMediaModalProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [price, setPrice] = useState(100);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!open) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New {mediaType === 'photo' ? 'Photo' : 'Video'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
              onChange={handleFileChange}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {mediaType === 'photo' ? (
                  <Image className="w-8 h-8 text-gray-500" />
                ) : (
                  <Video className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <p className="text-gray-700 font-medium mb-1">
                {selectedFile ? selectedFile.name : `Drop your ${mediaType} here`}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse
              </p>
            </label>
          </div>

          {/* Privacy Settings */}
          {isWoman && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Privacy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    isPublic ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Public</span>
                </button>
                <button
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    !isPublic ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Private</span>
                </button>
              </div>
            </div>
          )}

          {/* Price (for private content) */}
          {isWoman && !isPublic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unlock Price
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    min={10}
                    className="w-20 bg-transparent border-none outline-none text-sm font-medium"
                  />
                </div>
                <span className="text-sm text-gray-500">coins</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600" 
            onClick={onClose}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
