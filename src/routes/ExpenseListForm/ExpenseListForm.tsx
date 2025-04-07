import { useFieldArray, useForm } from 'react-hook-form';
import { formatCurrencyIDR } from '../../utils/currency';
import { ExpenseType } from './types';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { EditEventContextType } from '../EventFormLayout';
import { normalizeEventData } from '../../utils/normalizer';
import { EventType } from '../EventForm/types';

type ExpenseListFormValues = {
  expenseList: ExpenseType[];
};

const ExpenseListForm = ({
  handleUpdateEventById,
}: {
  handleUpdateEventById: (newData: EventType) => void;
}) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event } = useOutletContext<EditEventContextType>();

  const normalizedEventData = normalizeEventData(event);

  const { personList, expenseList } = normalizedEventData;

  const { register, handleSubmit, control, getValues, watch, setValue } =
    useForm<ExpenseListFormValues>({
      defaultValues: {
        expenseList,
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expenseList',
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const updatedEvent = {
          ...normalizedEventData,
          expenseList: data.expenseList,
        };

        console.log("[TEST in ExpenseListForm] updatedEvent", updatedEvent)
        handleUpdateEventById(updatedEvent);
        navigate(`/acara/${eventId}`);
      })}
    >
      <h2>Catat Pengeluaran</h2>

      {fields.map((field, expenseIndex) => (
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
              {...register(`expenseList.${expenseIndex}.title`)}
              placeholder="contoh: Bakso"
              style={{ display: 'block' }}
              defaultValue={field.title}
            />

            <label>Berapa harganya?</label>
            <input
              {...register(`expenseList.${expenseIndex}.priceBeforeTax`)}
              placeholder="Contoh: 10000"
              style={{ display: 'block' }}
              type="number"
              defaultValue={field.priceBeforeTax}
              onChange={(e) => {
                const userInput = Number(e.target.value);
                const tax = watch('expenseList')?.[expenseIndex]?.tax || 0;

                const priceAfterTax = userInput + (userInput * tax) / 100;

                setValue(
                  `expenseList.${expenseIndex}.priceAfterTax`,
                  priceAfterTax
                );
              }}
              onFocus={(e) => {
                e.target.select();
              }}
            />

            <label>Pajak (opsional)</label>
            <div>
              <input
                {...register(`expenseList.${expenseIndex}.tax`)}
                placeholder="Eg: 11"
                type="number"
                defaultValue={field.tax}
                onChange={(e) => {
                  const userInput = Number(e.target.value ?? 0);
                  const priceBeforeTax =
                    watch('expenseList')?.[expenseIndex]?.priceBeforeTax || 0;

                  const priceAfterTax =
                    Number(priceBeforeTax) +
                    (Number(priceBeforeTax) * userInput) / 100;

                  setValue(
                    `expenseList.${expenseIndex}.priceAfterTax`,
                    priceAfterTax
                  );
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
              />
              %
            </div>

            <div>
              <i>
                Harga setelah pajak:{' '}
                {formatCurrencyIDR(
                  watch('expenseList')?.[expenseIndex]?.priceAfterTax
                )}
              </i>
            </div>

            <label>Siapa yang bayarin?</label>
            <select
              {...register(`expenseList.${expenseIndex}.payer.name`)}
              defaultValue=""
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
                const currentTransactionAmout =
                  getValues('expenseList')?.[expenseIndex]?.priceAfterTax || 0;

                const currentReceivers =
                  watch('expenseList')?.[expenseIndex]?.receiver?.filter((r) =>
                    Boolean(r)
                  ) || [];

                const isChecked = currentReceivers?.includes(person.name);

                const averagePrice =
                  currentTransactionAmout / currentReceivers.length || 0;

                return (
                  <label
                    key={personIndex}
                    style={{ display: 'flex', gap: '8px' }}
                  >
                    <input
                      {...register(
                        `expenseList.${expenseIndex}.receiver.${personIndex}`
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
              <button type="button" onClick={() => remove(expenseIndex)}>
                Hapus
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            title: '',
            priceBeforeTax: 0,
            priceAfterTax: 0,
            tax: 0,
            payer: { name: '' },
            receiver: [''],
          })
        }
      >
        Tambah
      </button>

      <div>
        <button type="button" onClick={() => window.history.back()}>
          Balik edit daftar anggota
        </button>

        <button type="submit">Selesai</button>
      </div>
    </form>
  );
};
export default ExpenseListForm;
