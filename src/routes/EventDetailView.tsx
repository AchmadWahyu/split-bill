import { formatCurrencyIDR } from '../utils/currency';
import { createArrOfDebts, normalizeArrOfDebts } from '../utils/debts';
import { Link, useNavigate, useParams } from 'react-router';
import { EventType } from './EventForm/types';
import { eventDefaultValues } from './EventForm/defaultValues';

const EventDetailView = ({ eventList }: { eventList: EventType[] }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const currentEvent = eventList?.find((event) => event.id === eventId);

  const { title, personList, expense } = currentEvent || eventDefaultValues;

  const expenseItems = expense?.items;

  if (expenseItems?.length === 0 || personList?.length === 0) {
    return <h2>Belum ada data</h2>;
  }
  const personListSToString = personList.map((person) => person.name);

  const arrOfDebts = createArrOfDebts(expense, personListSToString);

  const finalResults = normalizeArrOfDebts(arrOfDebts);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            flexGrow: '1',
          }}
        >
          {title}
        </h2>
        <button
          style={{
            maxHeight: 'fit-content',
            margin: '0 auto',
          }}
          onClick={() => {
            navigate(`/acara/${eventId}/edit/transaksi`);
          }}
        >
          Edit
        </button>
      </div>

      <ol style={{ paddingLeft: 0 }}>
        {finalResults.map((person, personIndex) => {
          const filteredDebt = person.debt.filter(
            (d) => d?.totalDebtAfterDiscountAndTax
          );

          if (!filteredDebt?.length) return null;

          return (
            <li
              key={personIndex}
              style={{
                border: '1px solid black',
                padding: '10px',
                marginBottom: '10px',
              }}
            >
              <b>{person.name}</b>

              <p>Bayar ke: </p>

              <ul>
                {filteredDebt.map((debt) => {
                  if (debt) {
                    return (
                      <li key={debt.payer}>
                        <b>{debt.payer}</b>:{' '}
                        {formatCurrencyIDR(debt.totalDebtAfterDiscountAndTax)}
                        <ul>
                          {debt.transactions.map(
                            (transaction, transactionIndex) => (
                              <li
                                key={transactionIndex}
                                style={{ color: '#737373' }}
                              >
                                {transaction.title} -{' '}
                                {formatCurrencyIDR(
                                  transaction.debtAfterDiscountAndTax
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      </li>
                    );
                  }
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      <Link to="/">kembali ke home</Link>
    </div>
  );
};

export default EventDetailView;
