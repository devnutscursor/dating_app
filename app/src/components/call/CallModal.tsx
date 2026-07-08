import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Clock, Phone, Gift } from 'lucide-react';
import type { CallStatus, CallType } from '@/hooks/useWebRTCCall';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import CallGiftNotification, { type CallGiftNotificationData } from '@/components/call/CallGiftNotification';

interface CallModalProps {
  callStatus: CallStatus;
  callType: CallType;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerName: string;
  peerPicture?: string;
  micOn: boolean;
  cameraOn: boolean;
  duration: number;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  showGiftButton?: boolean;
  onOpenGift?: () => void;
  giftNotice?: CallGiftNotificationData | null;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Callback ref helper: assigns stream.srcObject as soon as the <video> mounts.
function useVideoStream(stream: MediaStream | null) {
  const ref = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el) el.srcObject = stream;
    },
    [stream]
  );
  return ref;
}

export default function CallModal({
  callStatus,
  callType,
  localStream,
  remoteStream,
  peerName,
  peerPicture,
  micOn,
  cameraOn,
  duration,
  onAccept,
  onReject,
  onEnd,
  onToggleMic,
  onToggleCamera,
  showGiftButton = false,
  onOpenGift,
  giftNotice = null,
}: CallModalProps) {
  // true  → remote is main / local is pip  (default, same as WhatsApp)
  // false → local is main / remote is pip
  const [remoteIsMain, setRemoteIsMain] = useState(true);

  const remoteVideoRef = useVideoStream(remoteStream);
  const localVideoRef = useVideoStream(localStream);

  // Also keep remote audio working for audio-only calls
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (audioRef.current && remoteStream) audioRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const name = peerName?.trim() || 'Member';

  if (callStatus === 'idle') return null;

  // ── Outgoing – waiting for peer to answer ────────────────────────────────
  if (callStatus === 'calling') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center p-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20 animate-pulse">
            <ProfileAvatar
              src={peerPicture}
              name={name}
              className="w-full h-full"
              textClassName="text-2xl"
              alt={name}
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
          <p className="text-white/70 mb-8">
            {callType === 'audio' ? 'Calling…' : 'Video calling…'}
          </p>
          <button
            onClick={onEnd}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors mx-auto"
            aria-label="Cancel call"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // ── Incoming – waiting for local user to answer ──────────────────────────
  if (callStatus === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center p-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20">
            <ProfileAvatar
              src={peerPicture}
              name={name}
              className="w-full h-full"
              textClassName="text-2xl"
              alt={name}
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
          <p className="text-white/70 mb-8">
            Incoming {callType === 'audio' ? 'audio' : 'video'} call…
          </p>
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={onReject}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Decline"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={onAccept}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              aria-label="Accept"
            >
              <Phone className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Connecting ────────────────────────────────────────────────────────────
  if (callStatus === 'connecting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center p-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20 animate-pulse">
            <ProfileAvatar
              src={peerPicture}
              name={name}
              className="w-full h-full"
              textClassName="text-2xl"
              alt={name}
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
          <p className="text-white/70 mb-8">Connecting…</p>
          <button
            onClick={onEnd}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors mx-auto"
            aria-label="Cancel"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // ── Call ended ────────────────────────────────────────────────────────────
  if (callStatus === 'ended') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center p-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20 opacity-60">
            <ProfileAvatar
              src={peerPicture}
              name={name}
              className="w-full h-full"
              textClassName="text-2xl"
              alt={name}
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
          <p className="text-white/70">Call ended · {formatDuration(duration)}</p>
        </div>
      </div>
    );
  }

  // ── Active / connected call ───────────────────────────────────────────────
  // mainRef   = the full-screen feed
  // pipRef    = the small pinned tile
  // Tapping the pip swaps them.
  const mainRef  = remoteIsMain ? remoteVideoRef : localVideoRef;
  const pipRef   = remoteIsMain ? localVideoRef  : remoteVideoRef;
  const pipLabel = remoteIsMain ? 'You' : name;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Audio-only: hidden audio element for remote stream */}
      {callType === 'audio' && <audio ref={audioRef} autoPlay className="hidden" />}

      {/* ── Main video ────────────────────────────────────────────── */}
      {callType === 'video' ? (
        <video
          ref={mainRef}
          autoPlay
          playsInline
          muted={!remoteIsMain} // mute when we're pinned to main (avoid echo)
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        /* Audio call main view */
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <ProfileAvatar
              src={peerPicture}
              name={name}
              className="w-28 h-28 rounded-full border-4 border-white/20"
              textClassName="text-3xl"
              alt={name}
            />
            <span className="text-white text-xl font-semibold">{name}</span>
          </div>
        </div>
      )}

      {/* ── PiP tile (tap to swap) ─────────────────────────────────── */}
      {callType === 'video' && (
        <button
          onClick={() => setRemoteIsMain((v) => !v)}
          className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-gray-800 cursor-pointer focus:outline-none group"
          aria-label="Swap view"
          type="button"
        >
          <video
            ref={pipRef}
            autoPlay
            playsInline
            muted={remoteIsMain} // pip is local → mute to avoid echo
            className="w-full h-full object-cover"
          />
          {/* Hover / tap hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs font-medium bg-black/60 rounded-full px-2 py-1">
              Tap to swap
            </span>
          </div>
          {/* Label */}
          <div className="absolute bottom-1 left-0 right-0 text-center">
            <span className="text-white/80 text-[11px] font-medium drop-shadow">{pipLabel}</span>
          </div>
        </button>
      )}

      {/* ── Header: peer name + timer ──────────────────────────────── */}
      <CallGiftNotification notice={giftNotice} />
      <div className="absolute top-4 left-4 right-36 flex items-center gap-2 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
          <ProfileAvatar
            src={peerPicture}
            name={name}
            className="h-7 w-7 rounded-full"
            alt={name}
          />
          <span className="text-white text-sm font-medium">{name}</span>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-white" />
          <span className="text-white font-mono text-sm">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* ── Controls ──────────────────────────────────────────────── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-5">
        <button
          onClick={onToggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            micOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
          }`}
          aria-label={micOn ? 'Mute mic' : 'Unmute mic'}
        >
          {micOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
        </button>

        {callType === 'video' && (
          <button
            onClick={onToggleCamera}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              cameraOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
            }`}
            aria-label={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? (
              <Camera className="w-6 h-6 text-white" />
            ) : (
              <CameraOff className="w-6 h-6 text-white" />
            )}
          </button>
        )}

        <button
          onClick={onEnd}
          className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          aria-label="End call"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>

        {showGiftButton && onOpenGift && (
          <button
            type="button"
            onClick={onOpenGift}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-pink-500 hover:bg-pink-600 transition-colors touch-manipulation"
            aria-label="Send gift"
          >
            <Gift className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
