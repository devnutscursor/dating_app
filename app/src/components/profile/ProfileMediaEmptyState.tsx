import { Image, Video } from 'lucide-react';

type Tone = 'green' | 'rose' | 'neutral';

type Props = {
  media: 'photo' | 'video';
  tone?: Tone;
  /** Tighter layout for edit page subsections */
  compact?: boolean;
};

const toneStyles: Record<
  Tone,
  { border: string; bg: string; iconWrap: string; icon: string; title: string }
> = {
  green: {
    border: 'border-green-200/80',
    bg: 'from-green-50/90 via-white to-gray-50/40',
    iconWrap: 'bg-green-100 text-green-700',
    icon: 'text-green-600',
    title: 'text-gray-900',
  },
  rose: {
    border: 'border-rose-200/80',
    bg: 'from-rose-50/90 via-white to-gray-50/40',
    iconWrap: 'bg-rose-100 text-rose-700',
    icon: 'text-rose-600',
    title: 'text-gray-900',
  },
  neutral: {
    border: 'border-gray-200',
    bg: 'from-gray-50 via-white to-gray-50/30',
    iconWrap: 'bg-gray-100 text-gray-600',
    icon: 'text-gray-500',
    title: 'text-gray-900',
  },
};

export function ProfileMediaEmptyState({ media, tone = 'green', compact }: Props) {
  const isPhoto = media === 'photo';
  const Icon = isPhoto ? Image : Video;
  const t = toneStyles[tone];
  const title = isPhoto ? 'No photos yet' : 'No videos yet';
  const body = isPhoto
    ? 'Add a few clear photos so people can recognize you and feel comfortable starting a conversation.'
    : 'Short clips go a long way. Add a video when you are ready so matches can get a better sense of you.';

  return (
    <div
      className={`col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed ${t.border} bg-gradient-to-b ${t.bg} text-center ${compact ? 'py-8 px-4' : 'py-12 px-6'}`}
      role="status"
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${t.iconWrap}`}
        aria-hidden
      >
        <Icon className={`h-7 w-7 ${t.icon}`} strokeWidth={1.75} />
      </div>
      <h3 className={`text-base font-semibold ${t.title}`}>{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-600">{body}</p>
    </div>
  );
}
