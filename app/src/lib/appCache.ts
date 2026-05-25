import { clearChatCache } from '@/lib/chatCache';
import { clearLikesCache } from '@/lib/likesCache';
import { clearPageCache } from '@/lib/pageCache';

export function clearAllAppCaches(): void {
  clearChatCache();
  clearLikesCache();
  clearPageCache();
}
