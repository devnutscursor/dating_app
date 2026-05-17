import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useWebRTCCall, type UseWebRTCCallReturn, type CallType } from '@/hooks/useWebRTCCall';
import { subscribeCallIncoming } from '@/lib/chatSocket';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import type { User } from '@/types';

interface IncomingCallInfo {
  fromUserId: string;
  chatId: string;
  callType: CallType;
  callerName: string;
  callerPicture?: string;
}

interface CallContextValue extends UseWebRTCCallReturn {
  incomingCallInfo: IncomingCallInfo | null;
  callDuration: number;
  activePeerName: string;
  activePeerPicture: string | undefined;
  initiateCall: (
    targetUserId: string,
    chatId: string,
    type: CallType,
    peerName: string,
    peerPicture?: string
  ) => Promise<void>;
}

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const rtc = useWebRTCCall();

  const [incomingCallInfo, setIncomingCallInfo] = useState<IncomingCallInfo | null>(null);
  const [activePeerName, setActivePeerName] = useState('');
  const [activePeerPicture, setActivePeerPicture] = useState<string | undefined>(undefined);
  const [callDuration, setCallDuration] = useState(0);

  // Tick the duration counter while connected
  useEffect(() => {
    if (rtc.callStatus !== 'connected') {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [rtc.callStatus]);

  // Clear incoming info when the call moves past the incoming state
  useEffect(() => {
    if (rtc.callStatus !== 'incoming') {
      setIncomingCallInfo(null);
    }
  }, [rtc.callStatus]);

  // Subscribe to incoming call socket events
  useEffect(() => {
    if (!user) return;

    const unsub = subscribeCallIncoming(async ({ from, chatId, callType }) => {
      // Fetch caller info for display
      let callerName = 'Someone';
      let callerPicture: string | undefined;
      try {
        const data = await apiGet<{ user: User }>(`/users/${from}`);
        callerName = data.user.name;
        callerPicture = data.user.profilePicture;
      } catch {
        /* use defaults */
      }
      setIncomingCallInfo({ fromUserId: from, chatId, callType, callerName, callerPicture });
      rtc.handleIncomingCall(from, chatId, callType);
    });

    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Convenience wrapper that also stores peer display info
  const initiateCall = useCallback(
    async (
      targetUserId: string,
      chatId: string,
      type: CallType,
      peerName: string,
      peerPicture?: string
    ) => {
      setActivePeerName(peerName);
      setActivePeerPicture(peerPicture);
      await rtc.startCall(targetUserId, chatId, type);
    },
    [rtc]
  );

  const value = useMemo<CallContextValue>(
    () => ({
      ...rtc,
      incomingCallInfo,
      callDuration,
      activePeerName: incomingCallInfo ? incomingCallInfo.callerName : activePeerName,
      activePeerPicture: incomingCallInfo ? incomingCallInfo.callerPicture : activePeerPicture,
      initiateCall,
    }),
    [rtc, incomingCallInfo, callDuration, activePeerName, activePeerPicture, initiateCall]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
}
