import { createContext, use } from 'react';
import type { EventType } from '@/types';
import type { PersonShareBreakdown } from '@/utils/calculations';

/**
 * React 19: `use()` reads Context the same way consumers did with `useContext()`, but the
 * API is a bit more flexible (e.g. can unwrap Promises). Here we use it so nested UI
 * pieces can read shared result state without threading many props.
 */
export const EventResultContext = createContext<EventResultContextValue | null>(
  null,
);

export type EventResultContextValue = {
  state: {
    migratedEvent: EventType | null;
    copied: boolean;
    expandedPersons: Set<string>;
    personNames: string[];
    shares: PersonShareBreakdown[];
    totalAmount: number;
    totalItems: number;
    itemSubtotal: number;
    taxTotal: number;
    serviceTotal: number;
    discountTotal: number;
    shareText: string;
  };
  actions: {
    navigateHome: () => void;
    navigateEdit: () => void;
    togglePerson: (name: string) => void;
    copyShare: () => void;
    shareWhatsApp: () => void;
  };
};

export function useEventResult() {
  const value = use(EventResultContext);
  if (!value) {
    throw new Error('useEventResult must be used within EventResultProvider');
  }
  return value;
}
