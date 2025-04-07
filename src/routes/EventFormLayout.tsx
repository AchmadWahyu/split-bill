import { Outlet, useParams } from 'react-router';
import { EventType } from './EventForm/types';
import { useState } from 'react';

export type EditEventContextType = {
  event?: EventType;
  handleUpdateEvent: (newData: EventType) => void;
};

const EventFormLayout = ({ eventList }: { eventList: EventType[] }) => {
  const { eventId } = useParams();

  const eventFoundedInParentData = eventList?.find(
    (event) => event.id === eventId
  );

  const [currentEvent, setCurrentEvent] = useState(eventFoundedInParentData);

  const handleUpdateEvent = (newData: EventType) => {
    const updatedEvent = {
      ...currentEvent,
      ...newData,
    };
    setCurrentEvent(updatedEvent);
  };

  return (
    <Outlet
      context={
        {
          event: currentEvent,
          handleUpdateEvent,
        } satisfies EditEventContextType
      }
    />
  );
};

export default EventFormLayout;
