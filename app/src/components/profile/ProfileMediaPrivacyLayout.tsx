import type { ReactNode } from 'react';
import { Globe, Lock } from 'lucide-react';
import { partitionMediaByPrivacy } from '@/lib/profileMedia';
import { ProfileMediaEmptyState } from '@/components/profile/ProfileMediaEmptyState';

type PrivacyVariant = 'public' | 'private';

function PrivacySection({
  title,
  description,
  variant,
  empty,
  emptyLabel,
  children,
}: {
  title: string;
  description: string;
  variant: PrivacyVariant;
  empty: boolean;
  emptyLabel: string;
  children: ReactNode;
}) {
  const Icon = variant === 'public' ? Globe : Lock;
  const shell =
    variant === 'public'
      ? 'border-emerald-100 bg-emerald-50/50'
      : 'border-amber-100 bg-amber-50/50';
  const iconShell =
    variant === 'public' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800';

  return (
    <section className={`rounded-xl border p-4 ${shell}`}>
      <div className="mb-3 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconShell}`}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-xs leading-relaxed text-gray-600">{description}</p>
        </div>
      </div>
      {empty ? (
        <p className="text-sm italic text-gray-500">{emptyLabel}</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{children}</div>
      )}
    </section>
  );
}

export type ProfileMediaPrivacyLayoutProps<T extends { isPublic?: boolean }> = {
  items: T[];
  mediaKind: 'photo' | 'video';
  ownerMode?: boolean;
  /** When true, show an empty private section (e.g. woman managing her gallery). */
  showPrivateWhenEmpty?: boolean;
  renderItem: (item: T) => ReactNode;
};

export default function ProfileMediaPrivacyLayout<T extends { isPublic?: boolean }>({
  items,
  mediaKind,
  ownerMode = false,
  showPrivateWhenEmpty = false,
  renderItem,
}: ProfileMediaPrivacyLayoutProps<T>) {
  const { publicItems, privateItems } = partitionMediaByPrivacy(items);
  const label = mediaKind === 'photo' ? 'photo' : 'video';
  const labelPlural = mediaKind === 'photo' ? 'photos' : 'videos';

  if (items.length === 0) {
    return (
      <ProfileMediaEmptyState
        media={mediaKind}
        tone={ownerMode ? 'green' : 'neutral'}
        compact={!ownerMode}
      />
    );
  }

  const showPrivateSection = privateItems.length > 0 || (ownerMode && showPrivateWhenEmpty);

  return (
    <div className="space-y-4">
      <PrivacySection
        title={`Public ${labelPlural} (${publicItems.length})`}
        description={
          ownerMode
            ? `Visible to everyone on your profile and in Discover.`
            : `Free to view — no coins required.`
        }
        variant="public"
        empty={publicItems.length === 0}
        emptyLabel={`No public ${labelPlural} yet.`}
      >
        {publicItems.map(renderItem)}
      </PrivacySection>

      {showPrivateSection ? (
        <PrivacySection
          title={`Private ${labelPlural} (${privateItems.length})`}
          description={
            ownerMode
              ? `Hidden until a man pays coins to unlock each ${label}.`
              : `Locked — pay coins to unlock and view.`
          }
          variant="private"
          empty={privateItems.length === 0}
          emptyLabel={`No private ${labelPlural} yet.`}
        >
          {privateItems.map(renderItem)}
        </PrivacySection>
      ) : null}
    </div>
  );
}

/** Small badge for tiles inside a privacy section (optional extra cue). */
export function MediaPrivacyTileBadge({ isPublic }: { isPublic?: boolean }) {
  if (isPublic === false) {
    return (
      <span className="absolute bottom-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
        Private
      </span>
    );
  }
  return (
    <span className="absolute bottom-2 left-2 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
      Public
    </span>
  );
}
