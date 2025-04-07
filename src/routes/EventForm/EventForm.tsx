import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import { EventType } from './types';
import { EditEventContextType } from '../EventFormLayout';

const EventForm = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event, handleUpdateEvent } = useOutletContext<EditEventContextType>();

  const { register, handleSubmit } = useForm<EventType>({
    defaultValues: {
      ...event,
      id: eventId,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        handleUpdateEvent(data);
        navigate(`/acara/${eventId}/edit/anggota`);
      })}
    >
      <h2>Kasih Nama Acaranya</h2>

      <div>
        <input
          {...register('title')}
          placeholder="Contoh: Makan Siang Jumat, Arisan, Nonton Bareng"
        />
      </div>

      <button type="submit">Lanjut Masukin Anggota</button>
    </form>
  );
};

export default EventForm;
