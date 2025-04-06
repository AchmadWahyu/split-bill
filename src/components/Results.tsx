import { formatCurrencyIDR } from '../utils/currency';
import { createArrOfDebts, normalizeArrOfDebts } from '../utils/debts';
import { Person } from './PersonListForm';
import { Transaction } from './TransactionListForm';

const Results = ({
  personList,
  transactionList,
}: {
  personList: Person[];
  transactionList: Transaction[];
}) => {
  const personListSToString = personList.map((person) => person.name);

  const arrOfDebts = createArrOfDebts(transactionList, personListSToString);

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
    </div>
  );
};

export default Results;
