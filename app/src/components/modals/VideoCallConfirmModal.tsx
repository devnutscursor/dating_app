import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import type { CallType } from '@/lib/chatSocket';

interface VideoCallConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  peerName?: string;
  peerPicture?: string;
  busy?: boolean;
  callType?: CallType;
  audioRate?: number;
  videoRate?: number;
}

export default function VideoCallConfirmModal({
  open,
  onClose,
  onConfirm,
  peerName,
  peerPicture,
  busy = false,
  callType = 'video',
  audioRate = 5,
  videoRate = 10,
}: VideoCallConfirmModalProps) {
  if (!open) return null;

  const name = peerName?.trim() || 'Member';
  const isVideo = callType === 'video';
  const thisRate = isVideo ? videoRate : audioRate;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={busy ? undefined : onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full border-4 border-green-100">
          <ProfileAvatar
            src={peerPicture}
            name={name}
            className="h-full w-full"
            textClassName="text-2xl"
            alt={name}
          />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          <p className="mt-2 text-sm text-gray-500">
            {isVideo
              ? 'Video chat charges coins while you are connected.'
              : 'Voice calls charge coins while you are connected.'}
          </p>
          <p className="mt-3 text-lg font-semibold text-green-600">
            {thisRate} coins per minute for this {isVideo ? 'video chat' : 'voice call'}
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Call rates</p>
          <ul className="mt-2 space-y-1">
            <li>
              Voice call: <span className="font-medium">{audioRate} coins / minute</span>
            </li>
            <li>
              Video chat: <span className="font-medium">{videoRate} coins / minute</span>
            </li>
          </ul>
          <p className="mt-3 text-amber-800">Make sure you have enough balance before starting.</p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Starting…' : isVideo ? 'Start Video Chat' : 'Start Voice Call'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
