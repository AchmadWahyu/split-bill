import { ExpenseType } from '../routes/ExpenseListForm/types';

type Debt = {
  payer: string;
  totalDebtAfterDiscountAndTax: number;
  surplus: number;
  transactions: {
    title: string;
    debtAfterDiscountAndTax: number;
  }[];
};

type PersonWithDebt = {
  name: string;
  debt: Debt[];
};

function createArrOfDebts(
  expenseData: ExpenseType,
  arrPerson: string[]
): PersonWithDebt[] {
  const { items, discount, tax } = expenseData;

  return arrPerson.map((person) => {
    let arrDebts: Debt[] = [];

    const expensesPrice = items.map((item) => item.price);
    const totalExpense = expensesPrice.reduce(
      (prev, curr) => Number(prev) + Number(curr)
    );

    items.forEach((transaction) => {
      // check if person is not payer but includes as receiver
      if (
        transaction.payer.name !== person &&
        transaction.receiver.includes(person)
      ) {
        const anotherTransactionWithTheSamePayer = arrDebts.find(
          (debt) => debt.payer === transaction.payer.name
        );

        const totalReceivers = transaction.receiver?.filter((r) =>
          Boolean(r)
        )?.length;

        // count the ratio of current transaction price to total expense (before discount & tax)
        const ratioTransactionPriceToTotalExpense =
          transaction.price / totalExpense;

        const discountToTransactionRatio =
          ratioTransactionPriceToTotalExpense * discount;

        const priceAfterDiscount =
          transaction.price - discountToTransactionRatio;

        const pricePerPersonAfterDiscount = priceAfterDiscount / totalReceivers;

        const debtAfterDiscountAndTax =
          pricePerPersonAfterDiscount +
          (pricePerPersonAfterDiscount * tax) / 100;

        // if there is another transaction with the same payer, update the total price and add the transaction to the list
        if (anotherTransactionWithTheSamePayer) {
          const newArrDebts = arrDebts.filter(
            (debt) => debt.payer !== transaction.payer.name
          );

          const newUpdatedDebt = {
            ...anotherTransactionWithTheSamePayer,
            totalDebtAfterDiscountAndTax:
              anotherTransactionWithTheSamePayer.totalDebtAfterDiscountAndTax +
              debtAfterDiscountAndTax,
            transactions: [
              ...anotherTransactionWithTheSamePayer.transactions,
              {
                title: transaction.title,
                debtAfterDiscountAndTax,
              },
            ],
          };

          arrDebts = [...newArrDebts, newUpdatedDebt];
        } else {
          // if not, create a new debt
          arrDebts.push({
            payer: transaction.payer.name,
            totalDebtAfterDiscountAndTax: debtAfterDiscountAndTax,
            surplus: 0,
            transactions: [
              {
                title: transaction.title,
                debtAfterDiscountAndTax,
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

        const currentPayerDebt =
          currentPayerDebtData?.totalDebtAfterDiscountAndTax || 0;

        const surplusInPayerCurrentDebt =
          currentPayerDebt > currentPersonDebt.totalDebtAfterDiscountAndTax;

        if (surplusInPayerCurrentDebt) {
          // hilangkan hutang dari current person ke payer
          return {
            ...currentPersonDebt,
            totalDebtAfterDiscountAndTax: 0,
            transactions: [],
          };
        } else {
          // tambah surplus dari payer ke current person
          return {
            ...currentPersonDebt,
            totalDebtAfterDiscountAndTax:
              currentPersonDebt.totalDebtAfterDiscountAndTax - currentPayerDebt,
            surplus: currentPayerDebt,
          };
        }
      }
    }),
  }));
}

export { createArrOfDebts, normalizeArrOfDebts };
