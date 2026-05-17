import { useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Clock, Phone } from 'lucide-react';
import type { CallStatus, CallType } from '@/hooks/useWebRTCCall';

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
}

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
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
}: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const avatar = peerPicture?.trim() || FALLBACK_AVATAR;
  const name = peerName?.trim() || 'Member';

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callStatus === 'idle') return null;

  // ── Outgoing – waiting for peer to answer ────────────────────────────────
  if (callStatus === 'calling') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="text-center p-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20 animate-pulse">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
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
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
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
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
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
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
          <p className="text-white/70">Call ended · {formatDuration(duration)}</p>
        </div>
      </div>
    );
  }

  // ── Active / connected call ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Remote video / audio */}
      {callType === 'video' ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Audio-only: hidden remote audio element */}
      {callType === 'audio' && (
        <audio ref={remoteVideoRef as React.RefObject<HTMLAudioElement>} autoPlay />
      )}

      {/* Local video (picture-in-picture) */}
      {callType === 'video' && (
        <div className="absolute top-4 right-4 w-32 h-44 bg-gray-700 rounded-2xl overflow-hidden border-2 border-white/20">
          {cameraOn ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CameraOff className="w-8 h-8 text-white/40" />
            </div>
          )}
        </div>
      )}

      {/* Header – name + timer */}
      <div className="absolute top-4 left-4 right-40 flex items-center gap-3">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <img src={avatar} alt={name} className="h-8 w-8 rounded-full object-cover" />
          <span className="text-white font-medium">{name}</span>
        </div>
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-white font-mono">{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
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
      </div>
    </div>
  );
}
