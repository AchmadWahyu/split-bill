import { useFieldArray, useForm } from 'react-hook-form';
import { formatCurrencyIDR } from '../../utils/currency';
import { ExpenseType } from './types';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { EditEventContextType } from '../EventFormLayout';
import { normalizeEventData } from '../../utils/normalizer';
import { EventType } from '../EventForm/types';

type ExpenseListFormValues = {
  expense: ExpenseType;
};

const ExpenseListForm = ({
  handleUpdateEventById,
}: {
  handleUpdateEventById: (newData: EventType) => void;
}) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event, handleUpdateEvent } = useOutletContext<EditEventContextType>();

  const normalizedEventData = normalizeEventData(event);

  const { personList, expense } = normalizedEventData;

  const { register, handleSubmit, control, getValues, watch } =
    useForm<ExpenseListFormValues>({
      defaultValues: {
        expense,
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expense.items',
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const updatedEvent = {
          ...normalizedEventData,
          expense: data.expense,
        };

        handleUpdateEventById(updatedEvent);
        navigate(`/acara/${eventId}`);
      })}
    >
      <h2>Catat Pengeluaran</h2>

      {fields.map((field, expenseItemIndex) => (
        <div
          key={field.id}
          style={{
            border: '1px solid black',
            padding: '10px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              flexGrow: 1,
            }}
          >
            <label>Apa yang dibeli?</label>
            <input
              {...register(`expense.items.${expenseItemIndex}.title`)}
              placeholder="contoh: Bakso"
              style={{ display: 'block' }}
              defaultValue={field.title}
            />

            <label>Berapa harganya?</label>
            <input
              {...register(`expense.items.${expenseItemIndex}.price`)}
              placeholder="Contoh: 10000"
              style={{ display: 'block' }}
              type="number"
              defaultValue={field.price}
              onFocus={(e) => {
                e.target.select();
              }}
            />

            <label>Siapa yang bayarin?</label>
            <select
              {...register(`expense.items.${expenseItemIndex}.payer.name`)}
              defaultValue={personList?.[0]?.name}
              style={{ display: 'block' }}
            >
              {personList?.length &&
                personList.map((person, personIndex) => (
                  <option key={personIndex} value={person.name}>
                    {person.name}
                  </option>
                ))}
            </select>

            <label>Siapa aja yang ikutan?</label>
            {personList?.length &&
              personList.map((person, personIndex) => {
                const currentExpenseTotalPrice =
                  getValues('expense.items')?.[expenseItemIndex]?.price || 0;

                const currentReceivers =
                  watch('expense.items')?.[expenseItemIndex]?.receiver?.filter(
                    (r) => Boolean(r)
                  ) || [];

                const isChecked = currentReceivers?.includes(person.name);

                const averagePrice =
                  currentExpenseTotalPrice / currentReceivers.length || 0;

                return (
                  <label
                    key={personIndex}
                    style={{ display: 'flex', gap: '8px' }}
                  >
                    <input
                      {...register(
                        `expense.items.${expenseItemIndex}.receiver.${personIndex}`
                      )}
                      type="checkbox"
                      value={person.name}
                      key={personIndex}
                    />
                    {person.name}{' '}
                    {isChecked && <b> - {formatCurrencyIDR(averagePrice)}</b>}
                  </label>
                );
              })}
          </div>
          <div>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(expenseItemIndex)}>
                Hapus
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        style={{ display: 'block' }}
        onClick={() =>
          append({
            title: '',
            price: 0,
            payer: { name: '' },
            receiver: [''],
          })
        }
      >
        Tambah
      </button>

      <div
        style={{
          border: '1px solid black',
          padding: '10px',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <label>Pake pajak ngga?</label>
        <input
          {...register(`expense.tax`)}
          style={{ display: 'block' }}
          defaultValue={expense.tax}
          type="number"
          onFocus={(e) => {
            e.target.select();
          }}
        />
        %
      </div>

      <div
        style={{
          border: '1px solid black',
          padding: '10px',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <label>Ada diskonnya?</label>
        Rp.
        <input
          {...register(`expense.discount`)}
          style={{ display: 'block' }}
          defaultValue={expense.discount}
          type="number"
          onFocus={(e) => {
            e.target.select();
          }}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={handleSubmit((data) => {
            const updatedEvent = {
              ...normalizedEventData,
              expense: data.expense,
            };
            
            handleUpdateEvent(updatedEvent);
            navigate(`/acara/${eventId}/edit/anggota`);
          })}
        >
          Balik edit daftar anggota
        </button>

        <button type="submit">Selesai</button>
      </div>
    </form>
  );
};
export default ExpenseListForm;
