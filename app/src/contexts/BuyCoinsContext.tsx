import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import BuyCoinsModal from '@/components/modals/BuyCoinsModal';
import { getErrorMessage, isInsufficientCoinsError } from '@/lib/coinErrors';

type OpenBuyCoinsOptions = {
  reason?: string;
};

type BuyCoinsContextValue = {
  openBuyCoins: (options?: OpenBuyCoinsOptions) => void;
  /** Returns true when a buy-coins prompt was shown instead of a generic error. */
  promptBuyCoinsIfNeeded: (error: unknown, fallbackReason?: string) => boolean;
};

const BuyCoinsContext = createContext<BuyCoinsContextValue | null>(null);

export function BuyCoinsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>();

  const openBuyCoins = useCallback((options?: OpenBuyCoinsOptions) => {
    setReason(options?.reason);
    setOpen(true);
  }, []);

  const promptBuyCoinsIfNeeded = useCallback(
    (error: unknown, fallbackReason?: string) => {
      const message = getErrorMessage(error) || fallbackReason || '';
      if (!isInsufficientCoinsError(message)) return false;
      openBuyCoins({ reason: message });
      return true;
    },
    [openBuyCoins]
  );

  const value = useMemo(
    () => ({ openBuyCoins, promptBuyCoinsIfNeeded }),
    [openBuyCoins, promptBuyCoinsIfNeeded]
  );

  return (
    <BuyCoinsContext.Provider value={value}>
      {children}
      <BuyCoinsModal open={open} onClose={() => setOpen(false)} reason={reason} />
    </BuyCoinsContext.Provider>
  );
}

export function useBuyCoins() {
  const ctx = useContext(BuyCoinsContext);
  if (!ctx) {
    throw new Error('useBuyCoins must be used within BuyCoinsProvider');
  }
  return ctx;
}

/** Safe for shared contexts (e.g. calls) that may render outside man layout. */
export function useBuyCoinsOptional() {
  return useContext(BuyCoinsContext);
}
