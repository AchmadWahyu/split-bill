import type { EventType } from '@/types';

export type EventResultPageProps = {
  eventList: EventType[];
  handleUpdateEventById: (data: EventType) => void;
};
