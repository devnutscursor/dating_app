import { Link } from 'react-router-dom';
import { Search, MoreVertical, Image, Video, Coins } from 'lucide-react';
import { mockChats } from '@/data/mockData';

export default function WomanChats() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-auto space-y-2">
        {mockChats.map((chat) => (
          <Link
            key={chat.id}
            to={`/woman/chats/${chat.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={chat.participant.profilePicture}
                alt={chat.participant.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {chat.participant.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{chat.participant.name}</h3>
                <span className="text-xs text-gray-400">{chat.lastMessage?.timestamp}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {chat.lastMessage?.type === 'image' && (
                  <span className="flex items-center gap-1">
                    <Image className="w-3 h-3" /> Photo
                  </span>
                )}
                {chat.lastMessage?.type === 'video' && (
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3" /> Video
                  </span>
                )}
                {chat.lastMessage?.type === 'gift' && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Coins className="w-3 h-3" /> Sent a gift
                  </span>
                )}
                {chat.lastMessage?.type === 'text' && chat.lastMessage.content}
              </p>
            </div>

            {/* Unread Badge */}
            {chat.unreadCount > 0 && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{chat.unreadCount}</span>
              </div>
            )}

            {/* Menu */}
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </Link>
        ))}

        {mockChats.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-500">Start a conversation with someone you like!</p>
          </div>
        )}
      </div>
    </div>
  );
}
