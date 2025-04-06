import { useFieldArray, useForm } from 'react-hook-form';
import { Person } from './PersonListForm';

export type Transaction = {
  title: string;
  amount: number;
  payer: Person;
  receiver: string[];
};

type TransactionListFormValues = {
  transactionList: Transaction[];
};

const TransactionListForm = ({
  personList,
  transactionList,
  handleTransactionList,
}: {
  personList: Person[];
  transactionList: Transaction[];
  handleTransactionList: (newTransactionList: Transaction[]) => void;
}) => {
  const { register, handleSubmit, control, getValues, watch } =
    useForm<TransactionListFormValues>({
      defaultValues: {
        transactionList,
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'transactionList',
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        handleTransactionList(data.transactionList);
      })}
    >
      <h2>Transaction List</h2>

      {fields.map((field, transactionIndex) => (
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
          <div>
            <label>Judul Transaksi</label>
            <input
              {...register(`transactionList.${transactionIndex}.title`)}
              placeholder="Eg: Pizza"
              style={{ display: 'block' }}
              defaultValue={field.title}
            />

            <label>Nominal Transaksi</label>
            <input
              {...register(`transactionList.${transactionIndex}.amount`)}
              placeholder="Eg: 10.000"
              style={{ display: 'block' }}
              type="number"
              defaultValue={field.amount}
            />

            <label>Pembayar</label>
            <select
              {...register(`transactionList.${transactionIndex}.payer.name`)}
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

            <label>Penerima</label>
            {personList?.length &&
              personList.map((person, personIndex) => {
                const currentTransactionAmout =
                  getValues('transactionList')?.[transactionIndex]?.amount || 0;

                const currentReceivers =
                  watch('transactionList')?.[
                    transactionIndex
                  ]?.receiver?.filter((r) => Boolean(r)) || [];

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
                        `transactionList.${transactionIndex}.receiver.${personIndex}`
                      )}
                      type="checkbox"
                      value={person.name}
                      key={personIndex}
                    />
                    {person.name} {isChecked && <b> - {averagePrice}</b>}
                  </label>
                );
              })}
          </div>
          <div>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(transactionIndex)}>
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
            amount: 0,
            payer: { name: '' },
            receiver: [''],
          })
        }
      >
        Tambah
      </button>

      <button type="submit">Simpan</button>
    </form>
  );
};
export default TransactionListForm;
