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
import {
  subscribeCallIncoming,
  subscribeCallBillingFailed,
  subscribeCallCoinsUpdated,
} from '@/lib/chatSocket';
import { useAuth } from '@/contexts/AuthContext';
import { useBuyCoinsOptional } from '@/contexts/BuyCoinsContext';
import { toast } from 'sonner';
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
  const { user, setCoins, refreshUser } = useAuth();
  const buyCoins = useBuyCoinsOptional();
  const rtc = useWebRTCCall();

  const [incomingCallInfo, setIncomingCallInfo] = useState<IncomingCallInfo | null>(null);
  const [activePeerName, setActivePeerName] = useState('');
  const [activePeerPicture, setActivePeerPicture] = useState<string | undefined>(undefined);
  const [callDuration, setCallDuration] = useState(0);

  // Tick the duration counter while connected; keep value on the brief "ended" screen
  useEffect(() => {
    if (rtc.callStatus === 'connected') {
      const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
      return () => clearInterval(interval);
    }
    if (rtc.callStatus === 'idle') {
      setCallDuration(0);
    }
  }, [rtc.callStatus]);

  // Clear incoming info when the call moves past the incoming state
  useEffect(() => {
    if (rtc.callStatus !== 'incoming') {
      setIncomingCallInfo(null);
    }
    if (rtc.callStatus === 'idle') {
      setActivePeerName('');
      setActivePeerPicture(undefined);
    }
  }, [rtc.callStatus]);

  // Per-minute billing: update balance or end call when coins run out
  useEffect(() => {
    if (!user) return;

    const unsubBilling = subscribeCallBillingFailed(({ chatId, message, reason }) => {
      if (rtc.chatId && chatId !== rtc.chatId) return;
      if (!rtc.chatId && rtc.callStatus === 'idle') return;
      const text =
        message ||
        (reason === 'insufficient'
          ? 'Insufficient coins to continue this call.'
          : 'Could not bill this call.');
      if (!buyCoins?.promptBuyCoinsIfNeeded(new Error(text))) {
        toast.error(text);
      }
      rtc.endCall();
    });

    const unsubCoins = subscribeCallCoinsUpdated(({ chatId, coins, earned }) => {
      if (chatId !== rtc.chatId) return;
      if (!earned) {
        setCoins(coins);
      } else {
        void refreshUser();
      }
    });

    return () => {
      unsubBilling();
      unsubCoins();
    };
  }, [user, rtc.chatId, rtc.callStatus, rtc.endCall, setCoins, refreshUser, buyCoins]);

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
      // Also store into the persistent active-peer fields so the name/avatar
      // remain visible once the call transitions past the 'incoming' state.
      setActivePeerName(callerName);
      setActivePeerPicture(callerPicture);
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
