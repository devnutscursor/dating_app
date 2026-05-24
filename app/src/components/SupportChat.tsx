import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { createOrGetSupportChat } from '@/lib/chats';

/** Floating support entry — opens the real moderator support chat thread. */
export default function SupportChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const isOnChatDetail = /\/(man|woman)\/chats\/[^/]+/.test(location.pathname);
  if (isOnChatDetail || !user) return null;

  const area = user.role === 'female' ? 'woman' : 'man';

  const openSupport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const chat = await createOrGetSupportChat();
      navigate(`/${area}/chats/${chat.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not open support chat');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void openSupport()}
      disabled={busy}
      aria-label="Contact support"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-colors hover:bg-green-600 disabled:opacity-60 max-lg:bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
