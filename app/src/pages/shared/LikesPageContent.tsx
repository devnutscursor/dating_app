import { Link, useLocation } from 'react-router-dom';
import { Heart, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatProfileLocation } from '@/lib/formatProfileLocation';
import { profileReturnState } from '@/lib/profileNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLikesPage } from '@/hooks/useLikesPage';

import ProfileAvatar from '@/components/profile/ProfileAvatar';

type LikesPageContentProps = {
  area: 'man' | 'woman';
};

export default function LikesPageContent({ area }: LikesPageContentProps) {
  const location = useLocation();
  const { user: me } = useAuth();
  const profileNavState = profileReturnState(location.pathname + location.search);
  const { activeTab, setActiveTab, users, receivedCount, sentCount, showInitialLoading } = useLikesPage(me?.id);
  const homePath = `/${area}/home`;
  const profilePrefix = `/${area}/view-profile`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Likes</h1>
        <p className="text-gray-500">See who liked your profile</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('received')}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            activeTab === 'received' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received
          {activeTab === 'received' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            activeTab === 'sent' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent
          {activeTab === 'sent' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
        </button>
      </div>

      {showInitialLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-gray-500">Loading…</div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <Heart className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTab === 'received' ? 'No likes received yet' : 'No likes sent yet'}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {activeTab === 'received'
              ? 'When someone likes you, they will show up here.'
              : 'Like people from Discover or Swipe mode—they will appear here.'}
          </p>
          <Link to={homePath} className="mt-6 inline-block">
            <Button className="bg-green-500 hover:bg-green-600">Discover people</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative aspect-square">
                <ProfileAvatar
                  src={user.profilePicture}
                  name={user.name}
                  gender={user.gender}
                  role={user.role}
                  className="h-full w-full"
                  textClassName="text-3xl"
                  alt={user.name}
                />
                <div className="pointer-events-none absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-pink-500">
                  <Heart className="h-5 w-5 fill-white text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {user.name}, {user.age}
                </h3>
                <p className="mb-3 text-sm text-gray-500">
                  {formatProfileLocation(user.city, user.country) || 'Location not set'}
                </p>
                <Link to={`${profilePrefix}/${user.id}`} state={profileNavState.state}>
                  <Button variant="outline" className="w-full gap-2">
                    View profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-3xl font-bold">{receivedCount}</p>
            <p className="text-white/80">Total likes received</p>
            <p className="mt-1 text-sm text-white/70">
              You have sent {sentCount} like{sentCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
