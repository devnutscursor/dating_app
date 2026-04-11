import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/data/mockData';

export default function WomanLikes() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  
  // Mock liked users
  const likedUsers = mockUsers.filter(u => u.gender === 'male').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Likes</h1>
        <p className="text-gray-500">See who liked your profile</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'received' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received
          {activeTab === 'received' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'sent' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent
          {activeTab === 'sent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'received' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {likedUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-square">
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{user.name}, {user.age}</h3>
                <p className="text-sm text-gray-500 mb-3">{user.city}</p>
                <Link to={`/woman/view-profile/${user.id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    View Profile
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No likes sent yet</h3>
          <p className="text-gray-500 mb-4">Start exploring and like profiles you find interesting!</p>
          <Link to="/woman/home">
            <Button className="bg-green-500 hover:bg-green-600">Discover People</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-3xl font-bold">42</p>
            <p className="text-white/80">Total likes received</p>
          </div>
        </div>
      </div>
    </div>
  );
}
