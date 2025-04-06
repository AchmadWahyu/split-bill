import { Transaction } from '../components/TransactionListForm';

type Debt = {
  payer: string;
  totalAmount: number;
  surplus: number;
  transactions: {
    title: string;
    amount: number;
  }[];
};

type PersonWithDebt = {
  name: string;
  debt: Debt[];
};

function createArrOfDebts(
  arrTransaction: Transaction[],
  arrPerson: string[]
): PersonWithDebt[] {
  return arrPerson.map((person) => {
    let arrDebts: Debt[] = [];

    arrTransaction.forEach((transaction) => {
      // check if person is not payer but includes as receiver
      if (
        transaction.payer.name !== person &&
        transaction.receiver.includes(person)
      ) {
        const anotherTransactionWithTheSamePayer = arrDebts.find(
          (debt) => debt.payer === transaction.payer.name
        );

        const averageAmountForEachPerson =
          transaction.amount / transaction.receiver.length;

        // if there is another transaction with the same payer, update the total amount and add the transaction to the list
        if (anotherTransactionWithTheSamePayer) {
          const newArrDebts = arrDebts.filter(
            (debt) => debt.payer !== transaction.payer.name
          );

          const newUpdatedDebt = {
            ...anotherTransactionWithTheSamePayer,
            totalAmount:
              anotherTransactionWithTheSamePayer.totalAmount +
              averageAmountForEachPerson,
            transactions: [
              ...anotherTransactionWithTheSamePayer.transactions,
              {
                title: transaction.title,
                amount: averageAmountForEachPerson,
              },
            ],
          };

          arrDebts = [...newArrDebts, newUpdatedDebt];
        } else {
          // if not, create a new debt
          arrDebts.push({
            payer: transaction.payer.name,
            totalAmount: averageAmountForEachPerson,
            surplus: 0,
            transactions: [
              {
                title: transaction.title,
                amount: averageAmountForEachPerson,
              },
            ],
          });
        }
      }
    });

    return {
      name: person,
      debt: arrDebts,
    };
  });
}

function normalizeArrOfDebts(personWithDebts: PersonWithDebt[]) {
  return personWithDebts.map((person) => ({
    ...person,
    debt: person.debt.map((currentPersonDebt) => {
      // cek apakah pembayar di transaksi ini punya hutang juga
      const payerCurrentDebtData = personWithDebts.find(
        (p) => p.name === currentPersonDebt.payer
      );

      // cek apakah nama current person ada di list sebagai payer di list debts pembayar transaksi ini
      if (payerCurrentDebtData) {
        const currentPayerDebtData = payerCurrentDebtData?.debt?.find(
          (payerDebt) => payerDebt.payer === person.name
        );

        const currentPayerDebt = currentPayerDebtData?.totalAmount || 0;

        const surplusInPayerCurrentDebt =
          currentPayerDebt > currentPersonDebt.totalAmount;

        if (surplusInPayerCurrentDebt) {
          // hilangkan hutang dari current person ke payer
          return {
            ...currentPersonDebt,
            totalAmount: 0,
            transactions: [],
          };
        } else {
          // tambah surplus dari payer ke current person
          return {
            ...currentPersonDebt,
            totalAmount: currentPersonDebt.totalAmount - currentPayerDebt,
            surplus: currentPayerDebt,
          };
        }
      }
    }),
  }));
}

export { createArrOfDebts, normalizeArrOfDebts };
