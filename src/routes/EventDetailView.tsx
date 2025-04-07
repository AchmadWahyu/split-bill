import { formatCurrencyIDR } from '../utils/currency';
import { createArrOfDebts, normalizeArrOfDebts } from '../utils/debts';
import { Link, useParams } from 'react-router';
import { EventType } from './EventForm/types';

const EventDetailView = ({ eventList }: { eventList: EventType[] }) => {
  const { eventId } = useParams();

  const currentEvent = eventList?.find((event) => event.id === eventId);

  const { personList, expenseList } = currentEvent || {
    personList: [],
    expenseList: [],
  };

  if (expenseList.length === 0 || personList.length === 0) {
    return <h2>Belum ada data</h2>;
  }
  const personListSToString = personList.map((person) => person.name);

  const arrOfDebts = createArrOfDebts(expenseList, personListSToString);

  const finalResults = normalizeArrOfDebts(arrOfDebts);
  
  return (
    <div>
      <h2>Hasil</h2>

      <ol style={{ paddingLeft: 0 }}>
        {finalResults.map((person, personIndex) => {
          const filteredDebt = person.debt.filter((d) => d?.totalDebtAfterTax);

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
                        {formatCurrencyIDR(debt.totalDebtAfterTax)}
                        <ul>
                          {debt.transactions.map(
                            (transaction, transactionIndex) => (
                              <li
                                key={transactionIndex}
                                style={{ color: '#737373' }}
                              >
                                {transaction.title} -{' '}
                                {formatCurrencyIDR(transaction.debtAfterTax)}
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
