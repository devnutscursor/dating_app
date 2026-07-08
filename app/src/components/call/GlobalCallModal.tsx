import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCall } from '@/contexts/CallContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBuyCoins } from '@/contexts/BuyCoinsContext';
import CallModal from '@/components/call/CallModal';
import type { CallGiftNotificationData } from '@/components/call/CallGiftNotification';
import SendGiftModal from '@/components/modals/SendGiftModal';
import { postChatMessage } from '@/lib/chats';
import { subscribeChatUpdate } from '@/lib/chatSocket';
import type { GiftSendPayload } from '@/lib/gifts';

/**
 * Renders the full-screen call overlay globally so it persists even when the
 * user navigates away from ChatDetail while a call is in progress.
 */
export default function GlobalCallModal() {
  const { user, refreshUser } = useAuth();
  const { promptBuyCoinsIfNeeded } = useBuyCoins();
  const {
    callStatus,
    callType,
    localStream,
    remoteStream,
    activePeerName,
    activePeerPicture,
    micOn,
    cameraOn,
    callDuration,
    chatId,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useCall();

  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [giftNotice, setGiftNotice] = useState<CallGiftNotificationData | null>(null);
  const lastGiftNoticeIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (callStatus === 'idle') {
      lastGiftNoticeIdRef.current = null;
      setGiftNotice(null);
    }
  }, [callStatus]);

  useEffect(() => {
    if (user?.role !== 'female' || callStatus !== 'connected' || !chatId || !user.id) {
      return;
    }

    const unsub = subscribeChatUpdate((payload) => {
      if (payload.chatId !== chatId) return;
      const lm = payload.chat.lastMessage;
      if (!lm?.id || lm.type !== 'gift' || lm.senderId === user.id) return;
      if (lastGiftNoticeIdRef.current === lm.id) return;
      lastGiftNoticeIdRef.current = lm.id;

      setGiftNotice({
        key: lm.id,
        giftName: lm.content?.trim() || 'Gift',
        coins: lm.giftAmount ?? 0,
        fromName: activePeerName || payload.chat.participant?.name || 'Someone',
      });
      void refreshUser();
    });

    return unsub;
  }, [user?.role, user?.id, callStatus, chatId, activePeerName, refreshUser]);

  useEffect(() => {
    if (!giftNotice) return;
    const timer = window.setTimeout(() => setGiftNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [giftNotice?.key]);

  if (callStatus === 'idle') return null;

  const canSendGift =
    user?.role === 'male' &&
    callStatus === 'connected' &&
    Boolean(chatId) &&
    callType === 'video';

  const handleGiftSend = async (gift: GiftSendPayload) => {
    if (!chatId) return;
    try {
      await postChatMessage(chatId, {
        type: 'gift',
        content: gift.name,
        giftAmount: gift.coins,
        ...(gift.comment ? { giftComment: gift.comment } : {}),
      });
      await refreshUser();
      toast.success('Gift sent');
    } catch (e) {
      if (promptBuyCoinsIfNeeded(e)) return;
      throw e instanceof Error ? e : new Error('Could not send gift');
    }
  };

  return (
    <>
      <CallModal
        callStatus={callStatus}
        callType={callType}
        localStream={localStream}
        remoteStream={remoteStream}
        peerName={activePeerName}
        peerPicture={activePeerPicture}
        micOn={micOn}
        cameraOn={cameraOn}
        duration={callDuration}
        onAccept={() => void acceptCall()}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        showGiftButton={canSendGift}
        onOpenGift={() => setGiftModalOpen(true)}
        giftNotice={user?.role === 'female' ? giftNotice : null}
      />

      <SendGiftModal
        open={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        userName={activePeerName}
        onSendGift={handleGiftSend}
        overlayClassName="z-[60]"
      />
    </>
  );
}
