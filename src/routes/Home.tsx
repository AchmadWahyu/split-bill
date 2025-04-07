import { Link } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { EventType } from './EventForm/types';

const Home = ({ eventList }: { eventList: EventType[] }) => {
  const eventId = uuidv4();
  const url = `/acara/${eventId}/edit/general`;

  return (
    <div>
      <h1>Acara Kamu</h1>

      {!eventList?.length && <p>Belum ada Acara nih</p>}

      {eventList?.map((event) => (
        <div key={event.id}>
          <Link to={`/acara/${event.id}`}>{event.title}</Link>
        </div>
      ))}

      <Link to={url}>+ Bikin Acara Baru</Link>
    </div>
  );
};

export default Home;
