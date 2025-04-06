import { useFieldArray, useForm } from 'react-hook-form';
import { Person } from './PersonListForm';
import { formatCurrencyIDR } from '../utils/currency';

export type Transaction = {
  title: string;
  priceBeforeTax: number;
  priceAfterTax: number;
  tax: number;
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
  const { register, handleSubmit, control, getValues, watch, setValue } =
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
      <h2>Daftar Item</h2>

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
          <div
            style={{
              flexGrow: 1,
            }}
          >
            <label>Nama Item</label>
            <input
              {...register(`transactionList.${transactionIndex}.title`)}
              placeholder="Eg: Pizza"
              style={{ display: 'block' }}
              defaultValue={field.title}
            />

            <label>Total Harga Item</label>
            <input
              {...register(
                `transactionList.${transactionIndex}.priceBeforeTax`
              )}
              placeholder="Contoh: 10.000"
              style={{ display: 'block' }}
              type="number"
              defaultValue={field.priceBeforeTax}
              onChange={(e) => {
                const userInput = Number(e.target.value);
                const tax =
                  watch('transactionList')?.[transactionIndex]?.tax || 0;

                const priceAfterTax = userInput + (userInput * tax) / 100;

                setValue(
                  `transactionList.${transactionIndex}.priceAfterTax`,
                  priceAfterTax
                );
              }}
            />

            <label>Pajak (opsional)</label>
            <div>
              <input
                {...register(`transactionList.${transactionIndex}.tax`)}
                placeholder="Eg: 11"
                type="number"
                defaultValue={field.tax}
                onChange={(e) => {
                  const userInput = Number(e.target.value ?? 0);
                  const priceBeforeTax =
                    watch('transactionList')?.[transactionIndex]
                      ?.priceBeforeTax || 0;

                  const priceAfterTax =
                    Number(priceBeforeTax) +
                    (Number(priceBeforeTax) * userInput) / 100;

                  console.log('AAA ', {
                    priceBeforeTax,
                    priceAfterTax,
                  });

                  setValue(
                    `transactionList.${transactionIndex}.priceAfterTax`,
                    priceAfterTax
                  );
                }}
              />
              %
            </div>

            <div>
              <i>
                Harga setelah pajak:{' '}
                {formatCurrencyIDR(
                  watch('transactionList')?.[transactionIndex]?.priceAfterTax
                )}
              </i>
            </div>

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
                  getValues('transactionList')?.[transactionIndex]
                    ?.priceAfterTax || 0;

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
                    {person.name}{' '}
                    {isChecked && <b> - {formatCurrencyIDR(averagePrice)}</b>}
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

      <button type="submit">Simpan</button>
    </form>
  );
};
export default TransactionListForm;
