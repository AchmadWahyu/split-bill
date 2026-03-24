import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { normalizeEventData, migrateEventData } from '@/utils/normalizer';
import {
  calculatePersonShares,
  calculateTotalFromShares,
} from '@/utils/calculations';
import {
  formatShareText,
  shareToWhatsApp,
  copyToClipboard,
} from '@/utils/share';
import { EventResultContext } from './eventResultContext';
import type { EventResultPageProps } from './types';

export function EventResultProvider({
  eventList,
  handleUpdateEventById,
  children,
}: EventResultPageProps & { children: ReactNode }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const hasMigrated = useRef(false);
  const [expandedPersons, setExpandedPersons] = useState<Set<string>>(
    new Set(),
  );

  const currentEvent = eventList.find((e) => e.id === eventId);

  const migratedEvent = useMemo(() => {
    if (!currentEvent?.title) return null;
    return migrateEventData(normalizeEventData(currentEvent));
  }, [currentEvent]);

  useEffect(() => {
    if (
      migratedEvent &&
      currentEvent &&
      !hasMigrated.current &&
      JSON.stringify(migratedEvent) !== JSON.stringify(currentEvent)
    ) {
      hasMigrated.current = true;
      handleUpdateEventById(migratedEvent);
    }
  }, [migratedEvent, currentEvent, handleUpdateEventById]);

  const personNames = useMemo(() => {
    if (!migratedEvent) return [];
    return migratedEvent.personList.map((p) => p.name).filter(Boolean);
  }, [migratedEvent]);

  const shares = useMemo(() => {
    if (!migratedEvent) return [];
    return calculatePersonShares(migratedEvent.expense, personNames);
  }, [migratedEvent, personNames]);

  const totalAmount = useMemo(
    () => calculateTotalFromShares(shares),
    [shares],
  );

  const totalItems = useMemo(() => {
    if (!migratedEvent) return 0;
    return migratedEvent.expense.items.filter((i) => i.title).length;
  }, [migratedEvent]);

  const itemSubtotal = useMemo(() => {
    if (!migratedEvent) return 0;
    return migratedEvent.expense.items.reduce(
      (sum, item) => sum + Number(item.price),
      0,
    );
  }, [migratedEvent]);

  const taxTotal = useMemo(
    () => (migratedEvent ? Number(migratedEvent.expense.tax.value) : 0),
    [migratedEvent],
  );
  const serviceTotal = useMemo(
    () =>
      migratedEvent ? Number(migratedEvent.expense.serviceCharge.value) : 0,
    [migratedEvent],
  );
  const discountTotal = useMemo(
    () => (migratedEvent ? Number(migratedEvent.expense.discount.value) : 0),
    [migratedEvent],
  );

  const shareText = useMemo(() => {
    if (!migratedEvent) return '';
    return formatShareText(
      migratedEvent.title,
      personNames.length,
      totalItems,
      totalAmount,
      shares,
    );
  }, [migratedEvent, personNames.length, totalItems, totalAmount, shares]);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareText]);

  const handleWhatsApp = useCallback(() => {
    shareToWhatsApp(shareText);
  }, [shareText]);

  const togglePerson = useCallback((name: string) => {
    setExpandedPersons((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const navigateHome = useCallback(() => navigate('/'), [navigate]);
  const navigateEdit = useCallback(
    () => navigate(`/acara/${eventId}/edit`),
    [navigate, eventId],
  );

  const value = useMemo(
    () => ({
      state: {
        migratedEvent,
        copied,
        expandedPersons,
        personNames,
        shares,
        totalAmount,
        totalItems,
        itemSubtotal,
        taxTotal,
        serviceTotal,
        discountTotal,
        shareText,
      },
      actions: {
        navigateHome,
        navigateEdit,
        togglePerson,
        copyShare: handleCopy,
        shareWhatsApp: handleWhatsApp,
      },
    }),
    [
      migratedEvent,
      copied,
      expandedPersons,
      personNames,
      shares,
      totalAmount,
      totalItems,
      itemSubtotal,
      taxTotal,
      serviceTotal,
      discountTotal,
      shareText,
      navigateHome,
      navigateEdit,
      togglePerson,
      handleCopy,
      handleWhatsApp,
    ],
  );

  return (
    <EventResultContext.Provider value={value}>
      {children}
    </EventResultContext.Provider>
  );
}
