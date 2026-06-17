import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '@/contexts/CallContext';
import ProfileAvatar from '@/components/profile/ProfileAvatar';

export default function IncomingCallOverlay() {
  const { callStatus, incomingCallInfo, acceptCall, rejectCall } = useCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const visible = callStatus === 'incoming' && incomingCallInfo !== null;

  // Play a ringtone while the incoming call banner is visible
  useEffect(() => {
    if (visible) {
      // Use a simple repeating beep via the Web Audio API as a ringtone fallback
      const ctx = new AudioContext();
      let stopped = false;

      const beep = () => {
        if (stopped) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
        if (!stopped) setTimeout(beep, 1500);
      };
      beep();

      return () => {
        stopped = true;
        ctx.close();
      };
    }
  }, [visible]);

  if (!visible || !incomingCallInfo) return null;

  const name = incomingCallInfo.callerName?.trim() || 'Someone';
  const isVideo = incomingCallInfo.callType === 'video';

  return (
    <>
      {/* Hidden audio element fallback */}
      <audio ref={audioRef} loop className="hidden" />

      <div className="fixed bottom-6 right-6 z-[100] w-80 rounded-2xl bg-gray-900 shadow-2xl border border-white/10 overflow-hidden">
        {/* Animated gradient accent */}
        <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />

        <div className="p-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <ProfileAvatar
              src={incomingCallInfo.callerPicture}
              name={name}
              className="w-14 h-14 rounded-full border-2 border-white/20"
              textClassName="text-lg"
              alt={name}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-gray-900">
              {isVideo ? (
                <Video className="w-2.5 h-2.5 text-white" />
              ) : (
                <Phone className="w-2.5 h-2.5 text-white" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{name}</p>
            <p className="text-white/60 text-sm">
              Incoming {isVideo ? 'video' : 'audio'} call
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-3">
          <button
            onClick={rejectCall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium text-sm transition-colors"
            aria-label="Decline call"
          >
            <PhoneOff className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={() => void acceptCall()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors"
            aria-label="Accept call"
          >
            <Phone className="w-4 h-4" />
            Accept
          </button>
        </div>
      </div>
    </>
  );
}
