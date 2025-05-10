import { useFieldArray, useForm } from 'react-hook-form';
import { PersonType } from './types';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { EditEventContextType } from '../EventFormLayout';
import { normalizeEventData } from '../../utils/normalizer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';

type PersonListFormValues = {
  personList: PersonType[];
};

const PersonListForm = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event, handleUpdateEvent } = useOutletContext<EditEventContextType>();

  const normalizedEventData = normalizeEventData(event);

  const { personList } = normalizedEventData;

  const { register, handleSubmit, control } = useForm<PersonListFormValues>({
    defaultValues: {
      personList,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'personList',
  });

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Masukin Anggota
        </h1>
        <h2 className="text-xl text-slate-600">Siapa aja yang ikut?</h2>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          const updatedEvent = {
            ...normalizedEventData,
            personList: data.personList,
          };

          handleUpdateEvent(updatedEvent);
          navigate(`/acara/${eventId}/edit/transaksi`);
        })}
        className="w-full max-w-md"
      >
        <div className="flex flex-col gap-2.5">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 w-full">
              <Input
                {...register(`personList.${index}.name`)}
                placeholder="Masukin nama temen kamu..."
                defaultValue={field.name}
                className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                autoFocus
              />

              {fields?.length > 1 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="grow-1 bg-rose-200 hover:bg-primary-variant text-rose-600"
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            onClick={() => append({ name: '' })}
            className="grow-1 bg-primary hover:bg-primary-variant text-white"
          >
            Tambah anggota baru
          </Button>
        </div>

        <BottomNav
          fixedPosition
          primaryButtonText="Lanjut tambah pengeluaran"
          secondaryButtonText="Balik edit nama acara"
          onClickSecondaryButton={handleSubmit((data) => {
            const updatedEvent = {
              ...normalizedEventData,
              personList: data.personList,
            };

            handleUpdateEvent(updatedEvent);
            navigate(`/acara/${eventId}/edit/general`);
          })}
        />
      </form>
    </main>
  );
};

export default PersonListForm;
