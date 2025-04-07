import { useFieldArray, useForm } from 'react-hook-form';
import { PersonType } from './types';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { EditEventContextType } from '../EventFormLayout';
import { normalizeEventData } from '../../utils/normalizer';

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
    <form
      onSubmit={handleSubmit((data) => {
        const updatedEvent = {
          ...normalizedEventData,
          personList: data.personList,
        };

        handleUpdateEvent(updatedEvent);
        navigate(`/acara/${eventId}/edit/transaksi`);
      })}
    >
      <h2>Masukin Anggota</h2>

      <p>Siapa aja yang ikut?</p>

      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`personList.${index}.name`)}
            placeholder="Masukin nama temen kamu..."
            defaultValue={field.name}
          />

          {fields.length > 1 && (
            <button type="button" onClick={() => remove(index)}>
              Hapus
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={() => append({ name: '' })}>
        Tambah
      </button>

      <div>
        <button type="button" onClick={() => window.history.back()}>
          Balik edit nama acara
        </button>

        <button type="submit">Lanjut Tambah Pengeluaran</button>
      </div>
    </form>
  );
};

export default PersonListForm;
