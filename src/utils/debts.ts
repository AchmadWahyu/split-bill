import { ExpenseType } from '../routes/ExpenseListForm/types';

type Debt = {
  payer: string;
  totalDebtAfterTax: number;
  surplus: number;
  transactions: {
    title: string;
    debtAfterTax: number;
  }[];
};

type PersonWithDebt = {
  name: string;
  debt: Debt[];
};

function createArrOfDebts(
  arrTransaction: ExpenseType[],
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

        const averagedebtAfterTaxForEachPerson =
          transaction.priceAfterTax /
          transaction.receiver?.filter((r) => Boolean(r))?.length;

        // if there is another transaction with the same payer, update the total price and add the transaction to the list
        if (anotherTransactionWithTheSamePayer) {
          const newArrDebts = arrDebts.filter(
            (debt) => debt.payer !== transaction.payer.name
          );

          const newUpdatedDebt = {
            ...anotherTransactionWithTheSamePayer,
            totalDebtAfterTax:
              anotherTransactionWithTheSamePayer.totalDebtAfterTax +
              averagedebtAfterTaxForEachPerson,
            transactions: [
              ...anotherTransactionWithTheSamePayer.transactions,
              {
                title: transaction.title,
                debtAfterTax: averagedebtAfterTaxForEachPerson,
              },
            ],
          };

          arrDebts = [...newArrDebts, newUpdatedDebt];
        } else {
          // if not, create a new debt
          arrDebts.push({
            payer: transaction.payer.name,
            totalDebtAfterTax: averagedebtAfterTaxForEachPerson,
            surplus: 0,
            transactions: [
              {
                title: transaction.title,
                debtAfterTax: averagedebtAfterTaxForEachPerson,
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

        const currentPayerDebt = currentPayerDebtData?.totalDebtAfterTax || 0;

        const surplusInPayerCurrentDebt =
          currentPayerDebt > currentPersonDebt.totalDebtAfterTax;

        if (surplusInPayerCurrentDebt) {
          // hilangkan hutang dari current person ke payer
          return {
            ...currentPersonDebt,
            totalDebtAfterTax: 0,
            transactions: [],
          };
        } else {
          // tambah surplus dari payer ke current person
          return {
            ...currentPersonDebt,
            totalDebtAfterTax:
              currentPersonDebt.totalDebtAfterTax - currentPayerDebt,
            surplus: currentPayerDebt,
          };
        }
      }
    }),
  }));
}

export { createArrOfDebts, normalizeArrOfDebts };
