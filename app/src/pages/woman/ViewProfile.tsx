import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, MessageCircle, Video, Lock, Image as ImageIcon, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';
import UnlockContentModal from '@/components/modals/UnlockContentModal';

export default function WomanViewProfile() {
  const { userId } = useParams();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; type: 'photo' | 'video'; price: number }>({
    open: false,
    type: 'photo',
    price: 100,
  });
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');

  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const allPhotos = [user.profilePicture, ...user.photos.map(p => p.url)];

  const nextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/woman/home" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        Back to Discover
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Photo Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={allPhotos[activePhotoIndex]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation */}
            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Online / offline status */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 backdrop-blur-sm">
              <div
                className={`h-2 w-2 rounded-full ${user.isOnline ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
              />
              <span className="text-xs font-medium text-white">{user.isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Photo Counter */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-xs text-white">
                {activePhotoIndex + 1} / {allPhotos.length}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-auto pb-2">
            {allPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhotoIndex(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ${
                  i === activePhotoIndex ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}, {user.age}</h1>
            <div className="flex items-center gap-1 text-gray-500 mt-2">
              <MapPin className="w-5 h-5" />
              <span>{user.city}, {user.country.toUpperCase()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-green-500 hover:bg-green-600 gap-2">
              <MessageCircle className="w-5 h-5" />
              Message
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Video className="w-5 h-5" />
              Video Call
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600">{user.aboutMe}</p>
          </div>

          {/* Looking For */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Looking For</h3>
            <p className="text-gray-600">{user.lookingFor}</p>
          </div>

          {/* Interests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Media Tabs */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'photos' ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Photos ({user.photos.length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'videos' ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Video className="w-4 h-4" />
                Videos ({user.videos.length})
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'photos' ? (
                <div className="grid grid-cols-3 gap-2">
                  {user.photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      {!photo.isPublic && (
                        <button
                          onClick={() => setUnlockModal({ open: true, type: 'photo', price: photo.unlockPrice || 100 })}
                          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white"
                        >
                          <Lock className="w-6 h-6 mb-1" />
                          <span className="text-xs flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {photo.unlockPrice}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {user.videos.map((video) => (
                    <div key={video.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <Video className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                      {!video.isPublic && (
                        <button
                          onClick={() => setUnlockModal({ open: true, type: 'video', price: video.unlockPrice || 500 })}
                          className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white"
                        >
                          <Lock className="w-6 h-6 mb-1" />
                          <span className="text-xs flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {video.unlockPrice}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      <UnlockContentModal
        open={unlockModal.open}
        onClose={() => setUnlockModal({ ...unlockModal, open: false })}
        contentType={unlockModal.type}
        price={unlockModal.price}
        userName={user.name}
      />
    </div>
  );
}
