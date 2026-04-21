import { Heart } from 'lucide-react';

interface BrandLogoProps {
  tone?: 'dark' | 'light' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    iconWrap: 'h-9 w-9 rounded-lg',
    icon: 'h-4 w-4',
    text: 'text-xl',
  },
  md: {
    iconWrap: 'h-11 w-11 rounded-xl',
    icon: 'h-5 w-5',
    text: 'text-3xl',
  },
  lg: {
    iconWrap: 'h-14 w-14 rounded-xl',
    icon: 'h-7 w-7',
    text: 'text-4xl',
  },
};

const toneClasses = {
  dark: {
    text: 'text-gray-900',
  },
  light: {
    text: 'text-white',
  },
  amber: {
    text: 'text-amber-100',
  },
};

export default function BrandLogo({ tone = 'dark', size = 'md', className = '' }: BrandLogoProps) {
  const palette = toneClasses[tone];
  const sizing = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`flex shrink-0 items-center justify-center bg-emerald-500 shadow-sm ring-1 ring-emerald-600/30 ${sizing.iconWrap}`}
        aria-hidden="true"
      >
        <Heart className={`${sizing.icon} text-white`} fill="none" strokeWidth={2.25} />
      </div>
      <span className={`select-none font-sans font-bold leading-none tracking-tight ${palette.text} ${sizing.text}`}>
        MemberDate
      </span>
    </div>
  );
}
