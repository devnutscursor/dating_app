interface BrandLogoProps {
  tone?: 'dark' | 'light' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    wrap: 'gap-2',
    mark: 'text-3xl',
    text: 'text-2xl',
  },
  md: {
    wrap: 'gap-3',
    mark: 'text-4xl',
    text: 'text-4xl',
  },
  lg: {
    wrap: 'gap-3',
    mark: 'text-5xl',
    text: 'text-5xl',
  },
};

const toneClasses = {
  dark: {
    mark: 'text-gray-900',
    text: 'text-gray-900',
  },
  light: {
    mark: 'text-white',
    text: 'text-white',
  },
  amber: {
    mark: 'text-amber-200',
    text: 'text-amber-200',
  },
};

export default function BrandLogo({ tone = 'dark', size = 'md', className = '' }: BrandLogoProps) {
  const palette = toneClasses[tone];
  const sizing = sizeClasses[size];

  return (
    <div className={`inline-flex items-center ${sizing.wrap} ${className}`}>
      <span
        className={`select-none font-black italic leading-none tracking-[-0.08em] ${palette.mark} ${sizing.mark}`}
        aria-hidden="true"
      >
        Mb
      </span>
      <span className={`font-serif leading-none tracking-tight ${palette.text} ${sizing.text}`}>
        MemberDate
      </span>
    </div>
  );
}
