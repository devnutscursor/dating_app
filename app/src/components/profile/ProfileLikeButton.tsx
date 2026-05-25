import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchLikes, sendLike } from '@/lib/social';

type ProfileLikeButtonProps = {
  userId: string;
  className?: string;
};

export default function ProfileLikeButton({ userId, className }: ProfileLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchLikes('sent')
      .then((res) => {
        if (!cancelled) {
          setLiked((res.users ?? []).some((u) => u.id === userId));
        }
      })
      .catch(() => {
        /* ignore — button still works */
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await sendLike(userId);
      setLiked(res.liked);
      toast.success(res.liked ? 'Like sent' : 'Like removed');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update like');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      disabled={busy}
      onClick={() => void handleToggle()}
      aria-label={liked ? 'Unlike profile' : 'Like profile'}
      aria-pressed={liked}
    >
      <Heart className={cn('h-5 w-5', liked && 'fill-rose-500 text-rose-500')} />
    </Button>
  );
}
