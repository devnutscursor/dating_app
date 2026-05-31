import { clearChatCache } from '@/lib/chatCache';
import { clearFavoritesCache } from '@/lib/favoritesCache';
import { clearLikesCache } from '@/lib/likesCache';
import { clearPageCache } from '@/lib/pageCache';

export function clearAllAppCaches(): void {
  clearChatCache();
  clearLikesCache();
  clearFavoritesCache();
  clearPageCache();
}
