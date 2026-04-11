import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, Star, MapPin, ArrowLeft } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import HoverPhotoGallery from '@/components/HoverPhotoGallery';

export default function ManSwipes() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const womenUsers = mockUsers.filter(u => u.gender === 'female');
  const currentUser = womenUsers[currentIndex];

  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
      setDirection(null);
      if (currentIndex < womenUsers.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No more profiles</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/man/home" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className={`relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden transition-transform duration-300 ${
            direction === 'left' ? '-translate-x-full rotate-[-10deg] opacity-0' :
            direction === 'right' ? 'translate-x-full rotate-[10deg] opacity-0' : ''
          }`}
        >
          {/* Image */}
          <div className="relative aspect-[3/4]">
            <HoverPhotoGallery
              photos={[currentUser.profilePicture, ...currentUser.photos.map((photo) => photo.url)].filter(
                (photo): photo is string => Boolean(photo)
              )}
              alt={currentUser.name}
              className="h-full w-full"
            />
            
            {/* Gradient Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* Online Status */}
            {currentUser.isOnline && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-white font-medium">Online</span>
              </div>
            )}

            {/* Info */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-3xl font-bold mb-1">
                {currentUser.name}, {currentUser.age}
              </h2>
              <div className="flex items-center gap-1 text-white/80 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{currentUser.city}, {currentUser.country.toUpperCase()}</span>
              </div>
              <p className="text-white/70 text-sm line-clamp-2">{currentUser.aboutMe}</p>
              
              {/* Interests */}
              <div className="flex flex-wrap gap-2 mt-3">
                {currentUser.interests.slice(0, 3).map((interest, i) => (
                  <span key={i} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-6 p-6">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 bg-green-500 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <Heart className="w-10 h-10 text-white fill-white" />
        </button>

        <button className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
          <Star className="w-8 h-8 text-yellow-500" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1 pb-4">
        {womenUsers.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === currentIndex ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
