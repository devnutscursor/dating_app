type DiscoverOnlineBadgeProps = {
  isOnline: boolean;
};

/** Compact online/offline pill for discover & online cards (sits just under photo progress bars). */
export default function DiscoverOnlineBadge({ isOnline }: DiscoverOnlineBadgeProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-black/50 px-1.5 py-0.5 backdrop-blur-sm">
      <div
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${isOnline ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
      />
      <span className="text-[10px] font-medium leading-none text-white">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
