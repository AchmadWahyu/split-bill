import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import { EventType } from './types';
import { EditEventContextType } from '../EventFormLayout';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/BottomNav';

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
    <main className="p-8 max-w-lg mx-auto h-dvh flex flex-col">
      <div className="text-center mb-8 mt-40">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Kasih Nama Acaranya
        </h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          handleUpdateEvent(data);
          navigate(`/acara/${eventId}/edit/anggota`);
        })}
        className="w-full max-w-md"
      >
        <Input
          {...register('title')}
          placeholder="Contoh: Makan Siang Jumat, Arisan, Nonton Bareng"
          className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
        />

        <BottomNav
          fixedPosition
          primaryButtonText="Masukin Anggota"
          secondaryButtonText="Balik ke Home"
          onClickSecondaryButton={() => navigate('/')}
        />
      </form>
    </main>
  );
};

export default EventForm;
