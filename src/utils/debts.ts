import {
  DynacicPercentageValue,
  ExpenseType,
} from '../routes/ExpenseListForm/types';

export type Transaction = {
  title: string;
  debtAfterDiscountAndTax: number;
  basePrice: number;
  discount: number;
  tax: number;
  serviceCharge: number;
};

export type Debt = {
  payer: string;
  totalDebtAfterDiscountAndTax: number;
  surplus: Transaction[];
  transactions: Transaction[];
};

export type PersonWithDebt = {
  name: string;
  debts: Debt[];
};

function getAmount(
  type: DynacicPercentageValue,
  percentageValue: string | number,
  total: number,
  pricePerPerson: number
): number {
  const formattedPercentageValue = Number(percentageValue);

  if (type === 'AMOUNT') return formattedPercentageValue * Number(total);
  if (!formattedPercentageValue) return 0;

  return (formattedPercentageValue / 100) * pricePerPerson;
}

function createArrOfDebts(
  expenseData: ExpenseType,
  arrPerson: string[]
): PersonWithDebt[] {
  const { items, discount, tax, serviceCharge } = expenseData;

  return arrPerson.map((person) => {
    let arrDebts: Debt[] = [];

    const expensesPrice = items.map((item) => Number(item.price));
    const totalExpense = expensesPrice.reduce((prev, curr) => prev + curr);

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
          Number(transaction.price) / totalReceivers / totalExpense;

        const pricePerPerson = Number(transaction.price) / totalReceivers;

        // normalize discount
        const discountAmount = getAmount(
          discount.type,
          discount.value,
          ratioTransactionPriceToTotalExpense,
          pricePerPerson
        );

        // normalize tax
        const taxAmount = getAmount(
          tax.type,
          tax.value,
          ratioTransactionPriceToTotalExpense,
          pricePerPerson
        );

        // normalize service charge
        const serviceChargeAmount = getAmount(
          serviceCharge.type,
          serviceCharge.value,
          ratioTransactionPriceToTotalExpense,
          pricePerPerson
        );

        // count the total price after discount, tax, and service charge
        const debtAfterDiscountTaxServiceCharge =
          pricePerPerson - discountAmount + taxAmount + serviceChargeAmount;

        // if there is another transaction with the same payer, update the total price and add the transaction to the list
        if (anotherTransactionWithTheSamePayer) {
          const newArrDebts = arrDebts.filter(
            (debt) => debt.payer !== transaction.payer.name
          );

          const newUpdatedDebt = {
            ...anotherTransactionWithTheSamePayer,
            totalDebtAfterDiscountAndTax:
              anotherTransactionWithTheSamePayer.totalDebtAfterDiscountAndTax +
              debtAfterDiscountTaxServiceCharge,
            transactions: [
              ...anotherTransactionWithTheSamePayer.transactions,
              {
                title: transaction.title,
                debtAfterDiscountAndTax: debtAfterDiscountTaxServiceCharge,
                basePrice: pricePerPerson,
                discount: discountAmount,
                tax: taxAmount,
                serviceCharge: serviceChargeAmount,
              },
            ],
          };

          arrDebts = [...newArrDebts, newUpdatedDebt];
        } else {
          // if not, create a new debt
          arrDebts.push({
            payer: transaction.payer.name,
            totalDebtAfterDiscountAndTax: debtAfterDiscountTaxServiceCharge,
            surplus: [],
            transactions: [
              {
                title: transaction.title,
                debtAfterDiscountAndTax: debtAfterDiscountTaxServiceCharge,
                basePrice: pricePerPerson,
                discount: discountAmount,
                tax: taxAmount,
                serviceCharge: serviceChargeAmount,
              },
            ],
          });
        }
      }
    });

    return {
      name: person,
      debts: arrDebts,
    };
  });
}

function normalizeArrOfDebts(
  personWithDebts: PersonWithDebt[]
): PersonWithDebt[] {
  return personWithDebts.map((person) => ({
    ...person,
    debts: person.debts
      .map((currentPersonDebt) => {
        // cek apakah pembayar di transaksi ini punya hutang juga
        const payerCurrentDebtData = personWithDebts.find(
          (p) => p.name === currentPersonDebt.payer
        );

        // cek apakah nama current person ada di list sebagai payer di list debts pembayar transaksi ini
        if (payerCurrentDebtData) {
          const currentPayerDebtData = payerCurrentDebtData?.debts?.find(
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
                currentPersonDebt.totalDebtAfterDiscountAndTax -
                currentPayerDebt,
              surplus: currentPayerDebtData?.transactions || [],
            };
          }
        }
      })
      .filter((debt) => debt !== undefined),
  }));
}

type ArrTransaction = {
  name: string;
  transactions: Transaction[];
};

function creatDetailedTransactionsForEachPerson(
  expense: ExpenseType,
  personListSToString: string[]
): ArrTransaction[] {
  const { items, discount, tax, serviceCharge } = expense;

  return personListSToString.map((person) => {
    const arrTransactions: Transaction[] = [];

    items.forEach((transaction) => {
      if (transaction.receiver.includes(person)) {
        const totalReceivers = transaction.receiver?.filter((r) =>
          Boolean(r)
        )?.length;

        const expensesPrice = items.map((item) => Number(item.price));
        const totalExpense = expensesPrice.reduce((prev, curr) => prev + curr);

        // count the ratio of current transaction price to total expense (before discount & tax)
        const ratioTransactionPriceToTotalExpense =
          Number(transaction.price) / totalReceivers / totalExpense;

        const pricePerPerson = Number(transaction.price) / totalReceivers;

        // normalize discount
        const discountAmount = getAmount(
          discount.type,
          discount.value,
          ratioTransactionPriceToTotalExpense,
          pricePerPerson
        );

        // normalize tax
        const taxAmount = getAmount(
          tax.type,
          tax.value,
          ratioTransactionPriceToTotalExpense,
          pricePerPerson
        );

        // normalize service charge
        const serviceChargeAmount = getAmount(
          serviceCharge.type,
          serviceCharge.value,
          ratioTransactionPriceToTotalExpense,
          pricePerPerson
        );

        // count the total price after discount, tax, and service charge
        const debtAfterDiscountTaxServiceCharge =
          pricePerPerson - discountAmount + taxAmount + serviceChargeAmount;

        arrTransactions.push({
          title: transaction.title,
          debtAfterDiscountAndTax: debtAfterDiscountTaxServiceCharge,
          basePrice: pricePerPerson,
          discount: discountAmount,
          tax: taxAmount,
          serviceCharge: serviceChargeAmount,
        });
      }
    });

    return {
      name: person,
      transactions: arrTransactions,
    };
  });
}

function normalizeArrTransactionsForEachPerson(
  arrTransaction: ArrTransaction[]
) {
  return arrTransaction.map((transaction) => {
    return {
      ...transaction,
      totalDiscount: transaction.transactions.reduce(
        (prev, curr) => prev + curr.discount,
        0
      ),
      totalTax: transaction.transactions.reduce(
        (prev, curr) => prev + curr.tax,
        0
      ),
      totalServiceCharge: transaction.transactions.reduce(
        (prev, curr) => prev + curr.serviceCharge,
        0
      ),
    };
  });
}

export {
  createArrOfDebts,
  normalizeArrOfDebts,
  creatDetailedTransactionsForEachPerson,
  normalizeArrTransactionsForEachPerson,
};
