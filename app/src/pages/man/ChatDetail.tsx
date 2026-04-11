import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Image, Gift, Smile, Lock, Flag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockChats } from '@/data/mockData';
import BlockUserModal from '@/components/modals/BlockUserModal';
import ReportUserModal from '@/components/modals/ReportUserModal';
import SendGiftModal from '@/components/modals/SendGiftModal';
import VideoCallModal from '@/components/modals/VideoCallModal';

export default function ManChatDetail() {
  const { chatId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockChats.find(c => c.id === chatId)?.messages || []);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = mockChats.find(c => c.id === chatId);
  const user = chat?.participant;

  useEffect(() => {
    setMessages(chat?.messages || []);
    setMessage('');
  }, [chatId, chat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: `m${Date.now()}`,
      senderId: '2398127', // Current user ID
      content: message,
      type: 'text' as const,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex -m-4 lg:-m-6 bg-white">
      <div className="hidden lg:flex w-80 xl:w-96 border-r border-gray-200 bg-white flex-col">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockChats.map((thread) => {
            const isActive = thread.id === chatId;
            return (
              <Link
                key={thread.id}
                to={`/man/chats/${thread.id}`}
                className={`flex items-center gap-3 border-b border-gray-100 px-4 py-4 transition-colors ${
                  isActive ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={thread.participant.profilePicture}
                    alt={thread.participant.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {thread.participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold text-gray-900">{thread.participant.name}</h3>
                    <span className="text-xs text-gray-400">{thread.lastMessage?.timestamp}</span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {thread.lastMessage?.type === 'text' ? thread.lastMessage.content : 'Shared media'}
                  </p>
                </div>

                {thread.unreadCount > 0 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white">
                    {thread.unreadCount}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link to="/man/chats" className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-xs text-gray-500">
                {user.isOnline ? 'Online' : `Last seen ${user.lastActive || 'recently'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setVideoCallOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <button 
                    onClick={() => { setBlockModalOpen(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Block User</span>
                  </button>
                  <button 
                    onClick={() => { setReportModalOpen(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <Flag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Report User</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isMe = msg.senderId === '2398127';
              const showAvatar = !isMe && (index === 0 || messages[index - 1]?.senderId !== msg.senderId);

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && showAvatar && (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    {!isMe && !showAvatar && <div className="w-8" />}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-xs mt-1 block ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Image className="w-5 h-5 text-gray-500" />
            </button>
            <button 
              onClick={() => setGiftModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Gift className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="icon"
              className="rounded-full bg-green-500 hover:bg-green-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BlockUserModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        userName={user.name}
        profilePicture={user.profilePicture}
      />
      <ReportUserModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        userName={user.name}
        profilePicture={user.profilePicture}
      />
      <SendGiftModal
        open={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        userName={user.name}
      />
      <VideoCallModal
        open={videoCallOpen}
        onClose={() => setVideoCallOpen(false)}
        userId={user.id}
      />
    </div>
  );
}
