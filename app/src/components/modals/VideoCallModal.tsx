import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Clock, Coins, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400';

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  peerName?: string;
  peerPicture?: string;
  isIncoming?: boolean;
}

export default function VideoCallModal({
  open,
  onClose,
  userId,
  peerName,
  peerPicture,
  isIncoming = false,
}: VideoCallModalProps) {
  const [callState, setCallState] = useState<'confirm' | 'connecting' | 'ongoing' | 'ended'>(isIncoming ? 'connecting' : 'confirm');
  const [duration, setDuration] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [showGiftModal, setShowGiftModal] = useState(false);

  const avatar = peerPicture?.trim() || FALLBACK_AVATAR;
  const name = peerName?.trim() || 'Member';

  useEffect(() => {
    if (open) {
      setCallState(isIncoming ? 'connecting' : 'confirm');
      setDuration(0);
      setMicOn(true);
      setCameraOn(true);
      setShowGiftModal(false);
    }
  }, [open, isIncoming, userId]);

  useEffect(() => {
    if (open && callState === 'connecting') {
      const timer = setTimeout(() => {
        setCallState('ongoing');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, callState]);

  useEffect(() => {
    if (callState === 'ongoing') {
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!open) return null;

  if (!isIncoming && callState === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full border-4 border-green-100">
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
            <p className="mt-2 text-sm text-gray-500">Video chat will charge coins for communication.</p>
            <p className="mt-3 text-lg font-semibold text-green-600">10 coins per minute</p>
          </div>
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Make sure you have enough balance before starting the call.
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => setCallState('connecting')}>
              Start Video Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Incoming Call Screen
  if (isIncoming && callState === 'connecting') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative text-center p-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20">
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
          <p className="text-white/70 mb-8">Incoming video call...</p>
          
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={onClose}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
            <button 
              onClick={() => setCallState('ongoing')}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <Phone className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ongoing Call Screen
  if (callState === 'ongoing') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900">
        {/* Main Video Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <img src={avatar} alt={name} className="h-full w-full object-cover opacity-50" />
          </div>
        </div>

        {/* Self View */}
        <div className="absolute top-4 right-4 w-32 h-44 bg-gray-700 rounded-2xl overflow-hidden border-2 border-white/20">
          <div className="w-full h-full bg-gray-600 flex items-center justify-center">
            <span className="text-white/50 text-sm">You</span>
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-4 left-4 right-40 flex items-center gap-3">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <img src={avatar} alt={name} className="h-8 w-8 rounded-full object-cover" />
            <span className="text-white font-medium">{name}</span>
          </div>
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white font-mono">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Earnings (for woman view) */}
        <div className="absolute top-20 left-4 bg-green-500/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <Coins className="w-4 h-4 text-white" />
          <span className="text-white font-medium">+{(duration * 10 / 60).toFixed(0)} coins</span>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <button 
            onClick={() => setMicOn(!micOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              micOn ? 'bg-white/20' : 'bg-red-500'
            }`}
          >
            {micOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
          </button>
          
          <button 
            onClick={() => setCameraOn(!cameraOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              cameraOn ? 'bg-white/20' : 'bg-red-500'
            }`}
          >
            {cameraOn ? <Camera className="w-6 h-6 text-white" /> : <CameraOff className="w-6 h-6 text-white" />}
          </button>

          <button 
            onClick={() => setShowGiftModal(true)}
            className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors"
          >
            <Gift className="w-6 h-6 text-white" />
          </button>
          
          <button 
            onClick={() => {
              setCallState('ended');
              setTimeout(onClose, 3000);
            }}
            className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Gift Modal */}
        {showGiftModal && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Send a Gift</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <span>Rose</span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Coins className="w-4 h-4" /> 50
                  </span>
                </button>
                <button className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <span>Heart</span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Coins className="w-4 h-4" /> 100
                  </span>
                </button>
              </div>
              <Button className="w-full mt-4" onClick={() => setShowGiftModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Connecting Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative text-center p-8">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white/20 animate-pulse">
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
        <p className="text-white/70">Connecting...</p>
      </div>
    </div>
  );
}
