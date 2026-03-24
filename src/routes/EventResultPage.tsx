import { EventResultProvider } from './event-result/EventResultProvider';
import { EventResultView } from './event-result/EventResultView';
import type { EventResultPageProps } from './event-result/types';

export default function EventResultPage(props: EventResultPageProps) {
  return (
    <EventResultProvider {...props}>
      <EventResultView />
    </EventResultProvider>
  );
}
