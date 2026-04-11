import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';
import VideoCallModal from '@/components/modals/VideoCallModal';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';

export default function ManOnline() {
  const [videoCallUserId, setVideoCallUserId] = useState<string | null>(null);
  const onlineUsers = mockUsers.filter(u => u.gender === 'female' && u.isOnline);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Online Now</h1>
        <p className="text-gray-500">{onlineUsers.length} people are online</p>
      </div>

      {/* Online Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {onlineUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[3/4]">
              <HoverPhotoGallery
                photos={[user.profilePicture, ...user.photos.map((photo) => photo.url)].filter(
                  (photo): photo is string => Boolean(photo)
                )}
                alt={user.name}
                className="h-full w-full"
              />
              
              {/* Online Indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500 rounded-full px-2 py-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs text-white font-medium">Online</span>
              </div>

              {/* Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <Link to={`/man/chats`}>
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </button>
                  </Link>
                  <button
                    onClick={() => setVideoCallUserId(user.id)}
                    className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <Video className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <Link to={`/man/view-profile/${user.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                  {user.name}, {user.age}
                </h3>
              </Link>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{user.city}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {onlineUsers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 bg-gray-400 rounded-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No one is online</h3>
          <p className="text-gray-500">Check back later or browse all profiles</p>
          <Link to="/man/home" className="mt-4 inline-block">
            <Button className="bg-green-500 hover:bg-green-600">Browse All</Button>
          </Link>
        </div>
      )}
      <VideoCallModal
        open={Boolean(videoCallUserId)}
        onClose={() => setVideoCallUserId(null)}
        userId={videoCallUserId || onlineUsers[0]?.id || ''}
      />
    </div>
  );
}
