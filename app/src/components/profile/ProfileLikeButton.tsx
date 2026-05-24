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

  const handleLike = async () => {
    if (busy || liked) return;
    setBusy(true);
    try {
      const res = await sendLike(userId);
      setLiked(true);
      toast.success(res.alreadyLiked ? 'Already liked' : 'Like sent');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send like');
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
      disabled={busy || liked}
      onClick={() => void handleLike()}
      aria-label={liked ? 'Already liked' : 'Like profile'}
    >
      <Heart className={cn('h-5 w-5', liked && 'fill-rose-500 text-rose-500')} />
    </Button>
  );
}
