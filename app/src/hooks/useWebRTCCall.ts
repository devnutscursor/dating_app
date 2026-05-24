import { useCallback, useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import type { CallType } from '@/lib/chatSocket';
export type { CallType };
import { apiGet } from '@/lib/api';
import {
  emitCallInitiate,
  emitCallAccepted,
  emitCallRejected,
  emitCallSignal,
  emitCallEnded,
  subscribeCallAccepted,
  subscribeCallRejected,
  subscribeCallSignal,
  subscribeCallEnded,
} from '@/lib/chatSocket';

export type CallStatus =
  | 'idle'
  | 'calling'       // outgoing – waiting for peer to accept
  | 'incoming'      // incoming – waiting for local user to accept
  | 'connecting'    // accepted – WebRTC handshake in progress
  | 'connected'     // live call
  | 'ended';

export interface UseWebRTCCallReturn {
  callStatus: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: CallType;
  peerUserId: string | null;
  chatId: string | null;
  micOn: boolean;
  cameraOn: boolean;
  startCall: (targetUserId: string, chatId: string, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  handleIncomingCall: (fromUserId: string, incomingChatId: string, type: CallType) => void;
}

// Public STUN servers (free, no signup). For users behind strict / symmetric
// NAT a TURN server is required — drop credentials in here when available.
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Example TURN (uncomment + replace when you have credentials):
    // {
    //   urls: 'turn:your-turn-host:3478',
    //   username: 'user',
    //   credential: 'pass',
    // },
  ],
};

export function useWebRTCCall(): UseWebRTCCallReturn {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType>('video');
  const [peerUserId, setPeerUserId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  // Buffer for signals that arrive before the peer instance has been created.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingSignalsRef = useRef<any[]>([]);
  // Stable refs of state we need to read from socket subscribers.
  const peerUserIdRef = useRef<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const callTypeRef = useRef<CallType>('video');
  const callStatusRef = useRef<CallStatus>('idle');

  useEffect(() => { peerUserIdRef.current = peerUserId; }, [peerUserId]);
  useEffect(() => { chatIdRef.current = chatId; }, [chatId]);
  useEffect(() => { callTypeRef.current = callType; }, [callType]);
  useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch { /* ignore */ }
      peerRef.current = null;
    }
    pendingSignalsRef.current = [];
  }, []);

  const cleanup = useCallback(() => {
    destroyPeer();
    stopLocalStream();
    setRemoteStream(null);
    setCallStatus('idle');
    setPeerUserId(null);
    setChatId(null);
    setMicOn(true);
    setCameraOn(true);
  }, [destroyPeer, stopLocalStream]);

  const getMedia = useCallback(async (type: CallType): Promise<MediaStream> => {
    let videoConstraints: boolean | MediaTrackConstraints = false;
    if (type === 'video') {
      let quality = 'hd';
      try {
        const data = await apiGet<{ videoCall?: { quality?: string } }>('/settings/public');
        quality = data.videoCall?.quality ?? 'hd';
      } catch {
        /* use default */
      }
      const resolutions: Record<string, { width: number; height: number }> = {
        sd: { width: 854, height: 480 },
        hd: { width: 1280, height: 720 },
        fhd: { width: 1920, height: 1080 },
      };
      const res = resolutions[quality] ?? resolutions.hd;
      videoConstraints = { ...res, facingMode: 'user' };
    }
    const constraints: MediaStreamConstraints = { audio: true, video: videoConstraints };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const buildPeer = useCallback(
    (initiator: boolean, stream: MediaStream, targetUserId: string, activeChatId: string) => {
      const peer = new SimplePeer({ initiator, stream, trickle: true, config: ICE_SERVERS });

      peer.on('signal', (signal) => {
        emitCallSignal(targetUserId, activeChatId, signal);
      });

      peer.on('stream', (remStream: MediaStream) => {
        setRemoteStream(remStream);
        setCallStatus('connected');
      });

      peer.on('connect', () => {
        // datachannel ready – useful debugging aid
        // eslint-disable-next-line no-console
        console.log('[WebRTC] peer connected');
      });

      peer.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.warn('[WebRTC] peer error', err);
        cleanup();
      });

      peer.on('close', () => {
        cleanup();
      });

      peerRef.current = peer;

      // Flush any signals that arrived before the peer existed.
      if (pendingSignalsRef.current.length > 0) {
        for (const s of pendingSignalsRef.current) {
          try { peer.signal(s); } catch { /* ignore stale */ }
        }
        pendingSignalsRef.current = [];
      }
    },
    [cleanup]
  );

  // ── Outgoing call ─────────────────────────────────────────────────────────
  // IMPORTANT: do NOT create the initiator peer here. Wait for the callee to
  // accept (call:accepted) — otherwise the offer is generated and broadcast
  // before the callee has a peer to receive it, causing both sides to hang at
  // "Connecting…" forever.
  const startCall = useCallback(
    async (targetUserId: string, activeChatId: string, type: CallType) => {
      if (callStatus !== 'idle') return;
      try {
        await getMedia(type);
        setCallType(type);
        setPeerUserId(targetUserId);
        setChatId(activeChatId);
        setCallStatus('calling');
        emitCallInitiate(targetUserId, activeChatId, type);
      } catch {
        stopLocalStream();
        setCallStatus('idle');
      }
    },
    [callStatus, getMedia, stopLocalStream]
  );

  // ── Incoming call (called by context) ────────────────────────────────────
  const handleIncomingCall = useCallback(
    (fromUserId: string, incomingChatId: string, type: CallType) => {
      if (callStatusRef.current !== 'idle') {
        emitCallRejected(fromUserId, incomingChatId);
        return;
      }
      setCallType(type);
      setPeerUserId(fromUserId);
      setChatId(incomingChatId);
      setCallStatus('incoming');
    },
    []
  );

  // ── Accept incoming call ──────────────────────────────────────────────────
  // Build the receiver peer FIRST, then emit accepted. That way by the time the
  // caller receives accepted and creates its initiator peer + offer, our peer
  // is already listening.
  const acceptCall = useCallback(async () => {
    if (callStatus !== 'incoming' || !peerUserId || !chatId) return;
    try {
      const stream = await getMedia(callType);
      buildPeer(false, stream, peerUserId, chatId);
      setCallStatus('connecting');
      emitCallAccepted(peerUserId, chatId);
    } catch {
      stopLocalStream();
      setCallStatus('idle');
    }
  }, [callStatus, peerUserId, chatId, callType, getMedia, buildPeer, stopLocalStream]);

  // ── Reject incoming call ──────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (callStatus !== 'incoming' || !peerUserId || !chatId) return;
    emitCallRejected(peerUserId, chatId);
    cleanup();
  }, [callStatus, peerUserId, chatId, cleanup]);

  // ── End / hang up ─────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    if (peerUserId && chatId) {
      emitCallEnded(peerUserId, chatId);
    }
    setCallStatus('ended');
    setTimeout(cleanup, 1500);
  }, [peerUserId, chatId, cleanup]);

  // ── Mic / camera toggles ──────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicOn((v) => !v);
  }, []);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setCameraOn((v) => !v);
  }, []);

  // ── Socket: caller receives "accepted" → now build the initiator peer ────
  useEffect(() => {
    const unsubAccepted = subscribeCallAccepted(({ chatId: eid }) => {
      if (eid !== chatIdRef.current) return;
      if (callStatusRef.current !== 'calling') return;
      const stream = localStreamRef.current;
      const target = peerUserIdRef.current;
      const activeChatId = chatIdRef.current;
      if (!stream || !target || !activeChatId) return;
      setCallStatus('connecting');
      buildPeer(true, stream, target, activeChatId);
    });
    return unsubAccepted;
  }, [buildPeer]);

  // ── Socket: rejected ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsubRejected = subscribeCallRejected(({ chatId: eid }) => {
      if (eid !== chatIdRef.current) return;
      setCallStatus('ended');
      setTimeout(cleanup, 2000);
    });
    return unsubRejected;
  }, [cleanup]);

  // ── Socket: WebRTC signal (offer / answer / ICE) ──────────────────────────
  // Buffer signals until the peer exists, then apply.
  useEffect(() => {
    const unsubSignal = subscribeCallSignal(({ chatId: eid, signal }) => {
      if (eid !== chatIdRef.current) return;
      if (peerRef.current) {
        try { peerRef.current.signal(signal); } catch { /* ignore */ }
      } else {
        pendingSignalsRef.current.push(signal);
      }
    });
    return unsubSignal;
  }, []);

  // ── Socket: peer ended the call ──────────────────────────────────────────
  useEffect(() => {
    const unsubEnded = subscribeCallEnded(({ chatId: eid }) => {
      if (eid !== chatIdRef.current) return;
      setCallStatus('ended');
      setTimeout(cleanup, 1500);
    });
    return unsubEnded;
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPeer();
      stopLocalStream();
    };
  }, [destroyPeer, stopLocalStream]);

  return {
    callStatus,
    localStream,
    remoteStream,
    callType,
    peerUserId,
    chatId,
    micOn,
    cameraOn,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
    handleIncomingCall,
  };
}
