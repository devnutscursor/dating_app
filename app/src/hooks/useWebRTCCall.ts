import { useCallback, useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import type { CallType } from '@/lib/chatSocket';
export type { CallType };
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
  /** Caller initiates an outgoing call */
  startCall: (targetUserId: string, chatId: string, type: CallType) => Promise<void>;
  /** Callee accepts an incoming call */
  acceptCall: () => Promise<void>;
  /** Callee declines an incoming call */
  rejectCall: () => void;
  /** Either side hangs up */
  endCall: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  /** Called by CallContext when a call:incoming socket event arrives */
  handleIncomingCall: (fromUserId: string, incomingChatId: string, type: CallType) => void;
}

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
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

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
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
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: type === 'video' ? { width: 1280, height: 720, facingMode: 'user' } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const buildPeer = useCallback(
    (initiator: boolean, stream: MediaStream, targetUserId: string, activeChatId: string) => {
      const peer = new SimplePeer({ initiator, stream, trickle: true, config: STUN_SERVERS });

      peer.on('signal', (signal) => {
        emitCallSignal(targetUserId, activeChatId, signal);
      });

      peer.on('stream', (remStream: MediaStream) => {
        setRemoteStream(remStream);
        setCallStatus('connected');
      });

      peer.on('error', () => {
        cleanup();
      });

      peer.on('close', () => {
        cleanup();
      });

      peerRef.current = peer;
    },
    [cleanup]
  );

  // ── Outgoing call ─────────────────────────────────────────────────────────
  const startCall = useCallback(
    async (targetUserId: string, activeChatId: string, type: CallType) => {
      if (callStatus !== 'idle') return;
      try {
        const stream = await getMedia(type);
        setCallType(type);
        setPeerUserId(targetUserId);
        setChatId(activeChatId);
        setCallStatus('calling');
        emitCallInitiate(targetUserId, activeChatId, type);
        buildPeer(true, stream, targetUserId, activeChatId);
      } catch {
        stopLocalStream();
        setCallStatus('idle');
      }
    },
    [callStatus, getMedia, buildPeer, stopLocalStream]
  );

  // ── Incoming call (called by context) ────────────────────────────────────
  const handleIncomingCall = useCallback(
    (fromUserId: string, incomingChatId: string, type: CallType) => {
      if (callStatus !== 'idle') {
        // Busy – immediately reject
        emitCallRejected(fromUserId, incomingChatId);
        return;
      }
      setCallType(type);
      setPeerUserId(fromUserId);
      setChatId(incomingChatId);
      setCallStatus('incoming');
    },
    [callStatus]
  );

  // ── Accept incoming call ──────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (callStatus !== 'incoming' || !peerUserId || !chatId) return;
    try {
      const stream = await getMedia(callType);
      setCallStatus('connecting');
      emitCallAccepted(peerUserId, chatId);
      buildPeer(false, stream, peerUserId, chatId);
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

  // ── Socket event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    const unsubAccepted = subscribeCallAccepted(({ chatId: eid }) => {
      if (eid !== chatId) return;
      setCallStatus('connecting');
    });
    return unsubAccepted;
  }, [chatId]);

  useEffect(() => {
    const unsubRejected = subscribeCallRejected(({ chatId: eid }) => {
      if (eid !== chatId) return;
      setCallStatus('ended');
      setTimeout(cleanup, 2000);
    });
    return unsubRejected;
  }, [chatId, cleanup]);

  useEffect(() => {
    const unsubSignal = subscribeCallSignal(({ chatId: eid, signal }) => {
      if (eid !== chatId) return;
      try {
        peerRef.current?.signal(signal);
      } catch {
        /* ignore stale signals */
      }
    });
    return unsubSignal;
  }, [chatId]);

  useEffect(() => {
    const unsubEnded = subscribeCallEnded(({ chatId: eid }) => {
      if (eid !== chatId) return;
      setCallStatus('ended');
      setTimeout(cleanup, 1500);
    });
    return unsubEnded;
  }, [chatId, cleanup]);

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
