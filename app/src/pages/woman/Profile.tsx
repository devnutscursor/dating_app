import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Edit, Image, Video, Lock, Settings, ChevronRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentWomanUser } from '@/data/mockData';
import AddMediaModal from '@/components/modals/AddMediaModal';

export default function WomanProfile() {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [addMediaModal, setAddMediaModal] = useState<{ open: boolean; type: 'photo' | 'video' }>({
    open: false,
    type: 'photo',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <Link to="/woman/profile/edit">
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-pink-400 to-rose-500" />
        
        {/* Info */}
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-sm">
              <img
                src={currentWomanUser.profilePicture}
                alt={currentWomanUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-3 left-[7rem] sm:left-[8rem] w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentWomanUser.name}, {currentWomanUser.age}</h2>
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{currentWomanUser.city}, {currentWomanUser.country.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentWomanUser.photos.length}</p>
              <p className="text-sm text-gray-500">Photos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{currentWomanUser.videos.length}</p>
              <p className="text-sm text-gray-500">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">42</p>
              <p className="text-sm text-gray-500">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{currentWomanUser.coins}</p>
              <p className="text-sm text-gray-500">Coins</p>
            </div>
          </div>

          {/* Media Section */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'photos' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Photos
                  {activeTab === 'photos' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'videos' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Videos
                  {activeTab === 'videos' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                  )}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddMediaModal({ open: true, type: activeTab === 'photos' ? 'photo' : 'video' })}
              >
                Add {activeTab === 'photos' ? 'Photo' : 'Video'}
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {activeTab === 'photos' ? (
                <>
                  {currentWomanUser.photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      {!photo.isPublic && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {currentWomanUser.videos.map((video) => (
                    <div key={video.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <Video className="w-5 h-5 text-gray-700" />
                        </div>
                      </div>
                      {!video.isPublic && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* About */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
            <p className="text-gray-600">{currentWomanUser.aboutMe}</p>
          </div>

          {/* Looking For */}
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Looking For</h3>
            <p className="text-gray-600">{currentWomanUser.lookingFor}</p>
          </div>

          {/* Interests */}
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {currentWomanUser.interests.map((interest, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Card */}
      <Link to="/woman/payouts">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">850 coins</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6" />
        </div>
      </Link>

      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Link to="/woman/profile/settings" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Account Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Add Media Modal */}
      <AddMediaModal
        open={addMediaModal.open}
        onClose={() => setAddMediaModal({ ...addMediaModal, open: false })}
        mediaType={addMediaModal.type}
        isWoman={true}
      />
    </div>
  );
}
