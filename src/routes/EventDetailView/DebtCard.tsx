import { Collapse } from '@/components/Collapse';
import { formatCurrencyIDR } from '@/utils/currency';
import { PersonWithDebt } from '@/utils/debts';
import clsx from 'clsx';
import { memo } from 'react';

const DebtCard = ({ name, debts }: PersonWithDebt) => {
  const hasMoreThanOneDebt = debts.length > 1;

  return (
    <div className="bg-card rounded-sm shadow-2xs">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold text-slate-800">{name}</h2>
      </div>
      <div className="p-4">
        <p className="text-l font-semibold text-slate-500">Bayar ke:</p>

        {debts.map((debt) => {
          const hasSurplus = debt.surplus.length > 0;
          const subTotalDebt = debt.transactions.reduce(
            (prev, curr) => prev + curr.debtAfterDiscountAndTax,
            0
          );
          const subTotalSurplus = debt.surplus.reduce(
            (prev, curr) => prev + curr.debtAfterDiscountAndTax,
            0
          );

          return (
            <div
              className={clsx('mt-2 pb-4', hasMoreThanOneDebt && 'border-b-1')}
              key={debt.payer}
            >
              <Collapse
                headerContent={
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-l font-semibold text-slate-900">
                        {debt.payer}
                      </p>
                      <p className="text-sm text-slate-400">
                        Tap untuk lihat detail
                      </p>
                    </div>

                    <p className="text-xl font-semibold text-slate-900">
                      {formatCurrencyIDR(debt.totalDebtAfterDiscountAndTax)}
                    </p>
                  </div>
                }
                collapsedContent={
                  <div className="flex flex-col gap-2 ml-8 pl-4 border-l-2 mt-4">
                    <div>
                      <p className="text-md">
                        🔻 {name} ditraktir {debt.payer}:
                      </p>

                      {debt.transactions.map((transaction) => (
                        <div
                          className="flex items-center justify-between"
                          key={transaction.title}
                        >
                          <p className="text-base text-red-600">
                            {transaction.title}
                          </p>

                          <p className="text-base font-semibold text-red-600 self-start">
                            -{' '}
                            {formatCurrencyIDR(
                              transaction.debtAfterDiscountAndTax
                            )}
                          </p>
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-2 mt-2 border-t">
                        <p className="text-md text-slate-500">Subtotal</p>

                        <p className="text-md text-slate-500 self-start">
                          {formatCurrencyIDR(subTotalDebt)}
                        </p>
                      </div>
                    </div>

                    {hasSurplus && (
                      <div className="mt-8">
                        <p className="text-md">
                          🟢 {name} mentraktir {debt.payer}:
                        </p>

                        {debt.surplus.map((s) => (
                          <div
                            className="flex items-center justify-between"
                            key={s.title}
                          >
                            <p className="text-base text-emerald-600">
                              {s.title}
                            </p>

                            <p className="text-base font-semibold text-emerald-600 self-start">
                              + {formatCurrencyIDR(s.debtAfterDiscountAndTax)}
                            </p>
                          </div>
                        ))}

                        <div className="flex items-center justify-between pt-2 mt-2 border-t">
                          <p className="text-md text-slate-500">Subtotal</p>

                          <p className="text-md text-slate-500 self-start">
                            {formatCurrencyIDR(subTotalSurplus)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MemoizedDebtCard = memo(DebtCard);
export { MemoizedDebtCard as DebtCard };
