import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Props = { area: 'man' | 'woman' };

type Phase = 'loading' | 'redirect' | 'empty' | 'error';

export default function DefaultChatRedirect({ area }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [firstChatId, setFirstChatId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPhase('loading');
    setFirstChatId(null);
    try {
      const data = await apiGet<{ chats: { id: string }[] }>('/chats');
      const first = data.chats[0]?.id;
      if (first) {
        setFirstChatId(first);
        setPhase('redirect');
      } else {
        setPhase('empty');
      }
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Loading chats…</div>
    );
  }

  if (phase === 'redirect' && firstChatId) {
    return <Navigate to={`/${area}/chats/${firstChatId}`} replace />;
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-gray-700">We couldn&apos;t load your conversations.</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => void load()}>
          Try again
        </Button>
      </div>
    );
  }

  const homePath = `/${area}/home`;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <MessageCircle className="h-8 w-8" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">No conversations yet</h1>
      <p className="mt-2 text-sm text-gray-500">
        When you match and start chatting, your threads will show up here.
      </p>
      <Button asChild className="mt-8 bg-green-500 hover:bg-green-600">
        <Link to={homePath}>Discover people</Link>
      </Button>
    </div>
  );
}
