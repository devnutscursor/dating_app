import { useState } from 'react';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EMOJI_GRID = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '😉',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😜',
  '🤪',
  '😝',
  '🤑',
  '🤗',
  '🤭',
  '🤫',
  '🤔',
  '🤐',
  '🤨',
  '😐',
  '😑',
  '😶',
  '😏',
  '😒',
  '🙄',
  '😬',
  '🤥',
  '😌',
  '😔',
  '😪',
  '🤤',
  '😴',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🥵',
  '🥶',
  '🥴',
  '😵',
  '🤯',
  '🤠',
  '🥳',
  '😎',
  '🤓',
  '🧐',
  '👍',
  '👎',
  '👏',
  '🙌',
  '👋',
  '🤝',
  '🙏',
  '❤️',
  '🔥',
  '✨',
  '🎉',
  '💯',
];

type Props = {
  onPick: (emoji: string) => void;
  disabled?: boolean;
};

export function EmojiPickerButton({ onPick, disabled }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
          aria-label="Insert emoji"
        >
          <Smile className="h-5 w-5 text-gray-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start" side="top">
        <div className="grid max-h-48 grid-cols-8 gap-0.5 overflow-y-auto">
          {EMOJI_GRID.map((em) => (
            <button
              key={em}
              type="button"
              className="rounded p-1.5 text-lg leading-none hover:bg-gray-100"
              onClick={() => {
                onPick(em);
                setOpen(false);
              }}
            >
              {em}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
