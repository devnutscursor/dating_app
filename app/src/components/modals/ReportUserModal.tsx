import { useEffect, useState } from 'react';
import { X, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { reportTypes } from '@/config/design';
import { postReportChat } from '@/lib/chats';
import type { PostReportChatBody } from '@/lib/chats';

interface ReportUserModalProps {
  open: boolean;
  onClose: () => void;
  chatId: string;
  userName: string;
  profilePicture?: string;
  onSubmitted?: () => void;
}

export default function ReportUserModal({
  open,
  onClose,
  chatId,
  userName,
  profilePicture,
  onSubmitted,
}: ReportUserModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [topic, setTopic] = useState('');
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedType('');
      setTopic('');
      setComment('');
      setPending(false);
    }
  }, [open]);

  if (!open) return null;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const canSubmit =
    selectedType &&
    topic.trim() &&
    comment.trim() &&
    ['financial', 'profile', 'harassment'].includes(selectedType);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPending(true);
    try {
      await postReportChat(chatId, {
        type: selectedType as PostReportChatBody['type'],
        topic: topic.trim(),
        comment: comment.trim(),
      });
      toast.success('Report submitted. Our team will review it.');
      onSubmitted?.();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not submit report');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => !pending && onClose()} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-gray-900">Report User</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={pending}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            {profilePicture ? (
              <img src={profilePicture} alt={userName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Flag className="h-5 w-5 text-orange-500" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Reporting</p>
              <p className="font-medium text-gray-900">{userName}</p>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">Report Type</label>
            <div className="grid grid-cols-1 gap-2">
              {reportTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
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
                    className="h-4 w-4 text-green-500"
                    disabled={pending}
                  />
                  <span className={`rounded px-2 py-1 text-xs font-medium ${getColorClass(type.color)}`}>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              disabled={pending}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please provide more details about the issue…"
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              disabled={pending}
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white p-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || pending}
          >
            {pending ? 'Submitting…' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
