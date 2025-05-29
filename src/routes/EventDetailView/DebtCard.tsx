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

        {debts.map((debt, debtIndex) => {
          const hasSurplus = debt.surplus.length > 0;
          const subTotalDebt = debt.transactions.reduce(
            (prev, curr) => prev + curr.debtAfterDiscountAndTax,
            0
          );
          const subTotalSurplus = debt.surplus.reduce(
            (prev, curr) => prev + curr.debtAfterDiscountAndTax,
            0
          );

          const lastDebt = debtIndex === debts.length - 1;

          const totalDebtDiscountAmount = debt.transactions.reduce(
            (prev, curr) => prev + curr.discount,
            0
          );

          const totalDebtTaxAmount = debt.transactions.reduce(
            (prev, curr) => prev + curr.tax,
            0
          );

          const totalDebtServiceChargeAmount = debt.transactions.reduce(
            (prev, curr) => prev + curr.serviceCharge,
            0
          );

          const hasDebtDiscountOrAdditionalCharge =
            totalDebtDiscountAmount > 0 ||
            totalDebtTaxAmount > 0 ||
            totalDebtServiceChargeAmount > 0;

          const totalSurplusDiscountAmount = debt.surplus.reduce(
            (prev, curr) => prev + curr.discount,
            0
          );

          const totalSurplusTaxAmount = debt.surplus.reduce(
            (prev, curr) => prev + curr.tax,
            0
          );

          const totalSurplusServiceChargeAmount = debt.surplus.reduce(
            (prev, curr) => prev + curr.serviceCharge,
            0
          );

          const hasSurplusDiscountOrAdditionalCharge =
            totalSurplusDiscountAmount > 0 ||
            totalSurplusTaxAmount > 0 ||
            totalSurplusServiceChargeAmount > 0;

          return (
            <div
              className={clsx(
                'mt-2 pb-4',
                hasMoreThanOneDebt && !lastDebt && 'border-b-1'
              )}
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
                      <p className="text-md mb-2">
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
                            - {formatCurrencyIDR(transaction.basePrice)}
                          </p>
                        </div>
                      ))}

                      <div
                        className={clsx(
                          hasDebtDiscountOrAdditionalCharge &&
                            'mt-2 pt-2 border-t'
                        )}
                      >
                        {totalDebtTaxAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <p className="text-base text-slate-500">Pajak</p>

                            <p className="text-base text-slate-500 self-start">
                              {formatCurrencyIDR(totalDebtTaxAmount)}
                            </p>
                          </div>
                        )}

                        {totalDebtServiceChargeAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <p className="text-base text-slate-500">
                              Biaya Layanan
                            </p>

                            <p className="text-base text-slate-500 self-start">
                              {formatCurrencyIDR(totalDebtServiceChargeAmount)}
                            </p>
                          </div>
                        )}

                        {totalDebtDiscountAmount > 0 && (
                          <div className="flex items-center justify-between">
                            <p className="text-base text-emerald-600">Diskon</p>

                            <p className="text-base text-emerald-600 self-start">
                              + {formatCurrencyIDR(totalDebtDiscountAmount)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t">
                        <p className="text-md text-slate-700 font-semibold">
                          Subtotal
                        </p>

                        <p className="text-md text-slate-700 self-start font-semibold">
                          {formatCurrencyIDR(subTotalDebt)}
                        </p>
                      </div>
                    </div>

                    {hasSurplus && (
                      <div className="mt-8">
                        <p className="text-md mb-2">
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
                              + {formatCurrencyIDR(s.basePrice)}
                            </p>
                          </div>
                        ))}

                        <div
                          className={clsx(
                            hasSurplusDiscountOrAdditionalCharge &&
                              'mt-2 pt-2 border-t'
                          )}
                        >
                          {totalSurplusTaxAmount > 0 && (
                            <div className="flex items-center justify-between">
                              <p className="text-base text-slate-500">Pajak</p>

                              <p className="text-base text-slate-500 self-start">
                                {formatCurrencyIDR(totalSurplusTaxAmount)}
                              </p>
                            </div>
                          )}

                          {totalSurplusServiceChargeAmount > 0 && (
                            <div className="flex items-center justify-between">
                              <p className="text-base text-slate-500">
                                Biaya Layanan
                              </p>

                              <p className="text-base text-slate-500 self-start">
                                {formatCurrencyIDR(
                                  totalSurplusServiceChargeAmount
                                )}
                              </p>
                            </div>
                          )}

                          {totalSurplusDiscountAmount > 0 && (
                            <div className="flex items-center justify-between">
                              <p className="text-base text-emerald-600">
                                Diskon
                              </p>

                              <p className="text-base text-emerald-600 self-start">
                                +{' '}
                                {formatCurrencyIDR(totalSurplusDiscountAmount)}
                              </p>
                            </div>
                          )}
                        </div>

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
