import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, MessageCircle, Video, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';
import UnlockContentModal from '@/components/modals/UnlockContentModal';
import VideoCallModal from '@/components/modals/VideoCallModal';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';

export default function ManHome() {
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; userId: string; type: 'photo' | 'video'; price: number }>({
    open: false,
    userId: '',
    type: 'photo',
    price: 100,
  });
  const [videoCallUserId, setVideoCallUserId] = useState<string | null>(null);

  const womenUsers = mockUsers.filter(u => u.gender === 'female');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <Link to="/man/swipes">
          <Button variant="outline" className="gap-2">
            <Heart className="w-4 h-4" />
            Swipe Mode
          </Button>
        </Link>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {womenUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Photo */}
            <div className="relative aspect-[3/4]">
              <HoverPhotoGallery
                photos={[user.profilePicture, ...user.photos.map((photo) => photo.url)].filter(
                  (photo): photo is string => Boolean(photo)
                )}
                alt={user.name}
                className="h-full w-full"
              />
              
              {/* Online / offline status */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
                <div
                  className={`h-2 w-2 rounded-full ${user.isOnline ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
                />
                <span className="text-xs font-medium text-white">{user.isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Private Content Indicator */}
              {user.photos.some(p => !p.isPublic) && (
                <button
                  onClick={() => setUnlockModal({ open: true, userId: user.id, type: 'photo', price: 100 })}
                  className="absolute top-3 right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors"
                >
                  <Lock className="w-4 h-4 text-white" />
                </button>
              )}

              {/* Actions Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Heart className="w-5 h-5 text-white" />
                    </button>
                    <Link to={`/man/chats`}>
                      <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </button>
                    </Link>
                  </div>
                  <button
                    onClick={() => setVideoCallUserId(user.id)}
                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <Video className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Link to={`/man/view-profile/${user.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                    {user.name}, {user.age}
                  </h3>
                </Link>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{user.city}, {user.country.toUpperCase()}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{user.aboutMe}</p>
              
              {/* Interests */}
              <div className="flex flex-wrap gap-1 mt-3">
                {user.interests.slice(0, 3).map((interest, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {interest}
                  </span>
                ))}
                {user.interests.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    +{user.interests.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Unlock Modal */}
      <UnlockContentModal
        open={unlockModal.open}
        onClose={() => setUnlockModal({ ...unlockModal, open: false })}
        contentType={unlockModal.type}
        price={unlockModal.price}
        userName={mockUsers.find(u => u.id === unlockModal.userId)?.name || ''}
      />
      <VideoCallModal
        open={Boolean(videoCallUserId)}
        onClose={() => setVideoCallUserId(null)}
        userId={videoCallUserId || womenUsers[0]?.id || ''}
      />
    </div>
  );
}
