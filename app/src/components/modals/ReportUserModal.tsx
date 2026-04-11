import { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportTypes } from '@/config/design';

interface ReportUserModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  profilePicture?: string;
}

export default function ReportUserModal({ open, onClose, userName, profilePicture }: ReportUserModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [topic, setTopic] = useState('');
  const [comment, setComment] = useState('');

  if (!open) return null;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-600';
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Report User</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {profilePicture ? (
              <img src={profilePicture} alt={userName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-orange-500" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Reporting</p>
              <p className="font-medium text-gray-900">{userName}</p>
            </div>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
            <div className="grid grid-cols-1 gap-2">
              {reportTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedType === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-4 h-4 text-green-500"
                  />
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getColorClass(type.color)}`}>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please provide more details about the issue..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600" 
            onClick={onClose}
            disabled={!selectedType || !topic}
          >
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}
