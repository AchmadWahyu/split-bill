import { Collapse } from '@/components/Collapse';
import { formatCurrencyIDR } from '@/utils/currency';
import { PersonWithDebt } from '@/utils/debts';
import { memo } from 'react';

const DebtCard = ({ name, debts }: PersonWithDebt) => {
  return (
    <div className="bg-card rounded-sm shadow-2xs">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold text-slate-800">{name}</h2>
      </div>
      <div className="p-4">
        <p className="text-l font-semibold text-slate-500">Bayar ke:</p>

        {debts.map((debt) => (
          <div className="mt-2 pb-4 border-b-1" key={debt.payer}>
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
                  {debt.transactions.map((transaction) => (
                    <div
                      className="flex items-center justify-between gap-2"
                      key={transaction.title}
                    >
                      <p className="text-base text-slate-600">
                        {transaction.title}
                      </p>

                      <p className="text-base font-semibold text-red-500 self-start">
                        -{' '}
                        {formatCurrencyIDR(transaction.debtAfterDiscountAndTax)}
                      </p>
                    </div>
                  ))}

                  {debt.surplus > 0 && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base text-slate-600">surplus</p>

                      <p className="text-base font-semibold text-emerald-500 self-start">
                        {formatCurrencyIDR(debt.surplus)}
                      </p>
                    </div>
                  )}
                </div>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const MemoizedDebtCard = memo(DebtCard);
export { MemoizedDebtCard as DebtCard };
