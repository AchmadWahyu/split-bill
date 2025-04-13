import { Link } from 'react-router';
import { EventType } from './EventForm/types';

const Home = ({
  eventList,
  handleDeleteEventById,
}: {
  eventList: EventType[];
  handleDeleteEventById: (eventId: string) => void;
}) => {
  const eventId = crypto.randomUUID();
  const url = `/acara/${eventId}/edit/general`;

  return (
    <div>
      <h1>Acara Kamu</h1>

      {!eventList.filter((e) => e.id)?.length && <p>Belum ada Acara nih</p>}

      {eventList.map((event) => (
        <div key={event.id}>
          <Link to={`/acara/${event.id}`}>{event.title}</Link>{' '}
          <button onClick={() => handleDeleteEventById(event.id)}>Hapus</button>
        </div>
      ))}

      <Link to={url}>+ Bikin Acara Baru</Link>
    </div>
  );
};

export default Home;
