import { Collapse } from '@/components/Collapse';
import { formatCurrencyIDR } from '@/utils/currency';
import { PersonWithDebt } from '@/utils/debts';
import clsx from 'clsx';
import { memo } from 'react';

const AdjustmentRow = ({
  label,
  value,
  color = 'text-slate-500',
  prefix = '',
}: {
  label: string;
  value: number;
  color?: string;
  prefix?: string;
}) => (
  <div className="flex items-center justify-between">
    <p className={`text-base ${color}`}>{label}</p>
    <p className={`text-base ${color} self-start`}>
      {prefix}
      {formatCurrencyIDR(value)}
    </p>
  </div>
);

const SubtotalRow = ({
  label,
  value,
  color = 'text-slate-700',
}: {
  label: string;
  value: number;
  color?: string;
}) => (
  <div className="flex items-center justify-between pt-2 mt-2 border-t">
    <p className={`text-md font-semibold ${color}`}>{label}</p>
    <p className={`text-md self-start font-semibold ${color}`}>
      {formatCurrencyIDR(value)}
    </p>
  </div>
);

const TransactionSection = ({
  name,
  payer,
  items,
  adjustments,
  subtotal,
  icon,
  color,
  sign,
  label,
}: {
  name: string;
  payer: string;
  items: { title: string; basePrice: number }[];
  adjustments: { tax: number; service: number; discount: number };
  subtotal: number;
  icon: string;
  color: string;
  sign: string;
  label: string;
}) => (
  <div className={color === 'emerald' ? 'mt-8' : ''}>
    <p className="text-md mb-2">
      {icon} {name} {label} {payer}:
    </p>
    {items.map((item) => (
      <div className="flex items-center justify-between" key={item.title}>
        <p className={`text-base text-${color}-600`}>{item.title}</p>
        <p className={`text-base font-semibold text-${color}-600 self-start`}>
          {sign} {formatCurrencyIDR(item.basePrice)}
        </p>
      </div>
    ))}
    {(adjustments.tax > 0 ||
      adjustments.service > 0 ||
      adjustments.discount > 0) && (
      <div className="mt-2 pt-2 border-t">
        {adjustments.tax > 0 && (
          <AdjustmentRow label="Pajak" value={adjustments.tax} />
        )}
        {adjustments.service > 0 && (
          <AdjustmentRow label="Biaya Layanan" value={adjustments.service} />
        )}
        {adjustments.discount > 0 && (
          <AdjustmentRow
            label="Diskon"
            value={adjustments.discount}
            color="text-emerald-600"
            prefix="+ "
          />
        )}
      </div>
    )}
    <SubtotalRow label="Subtotal" value={subtotal} />
  </div>
);

// --- Main DebtCard ---
const DebtCard = ({ name, debts }: PersonWithDebt) => {
  const hasMoreThanOneDebt = debts.length > 1;

  // Preprocess all data for subcomponents
  const processedDebts = debts.map((debt, debtIndex) => {
    const debtAdjustments = {
      tax: debt.transactions.reduce((prev, curr) => prev + curr.tax, 0),
      service: debt.transactions.reduce(
        (prev, curr) => prev + curr.serviceCharge,
        0
      ),
      discount: debt.transactions.reduce(
        (prev, curr) => prev + curr.discount,
        0
      ),
    };
    const surplusAdjustments = {
      tax: debt.surplus.reduce((prev, curr) => prev + curr.tax, 0),
      service: debt.surplus.reduce(
        (prev, curr) => prev + curr.serviceCharge,
        0
      ),
      discount: debt.surplus.reduce((prev, curr) => prev + curr.discount, 0),
    };
    return {
      key: debt.payer,
      payer: debt.payer,
      transactions: debt.transactions.map((t) => ({
        title: t.title,
        basePrice: t.basePrice,
      })),
      debtAdjustments,
      debtSubtotal: debt.transactions.reduce(
        (prev, curr) => prev + curr.debtAfterDiscountAndTax,
        0
      ),
      surplus: debt.surplus.map((s) => ({
        title: s.title,
        basePrice: s.basePrice,
      })),
      surplusAdjustments,
      surplusSubtotal: debt.surplus.reduce(
        (prev, curr) => prev + curr.debtAfterDiscountAndTax,
        0
      ),
      total: debt.totalDebtAfterDiscountAndTax,
      hasSurplus: debt.surplus.length > 0,
      lastDebt: debtIndex === debts.length - 1,
    };
  });

  return (
    <div className="bg-card rounded-sm shadow-2xs">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold text-slate-800">{name}</h2>
      </div>
      <div className="p-4">
        <p className="text-l font-semibold text-slate-500">Bayar ke:</p>
        {processedDebts.map((d) => (
          <div
            className={clsx(
              'mt-2 pb-4',
              hasMoreThanOneDebt && !d.lastDebt && 'border-b-1'
            )}
            key={d.key}
          >
            <Collapse
              headerContent={
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-l font-semibold text-slate-900">
                      {d.payer}
                    </p>
                    <p className="text-sm text-slate-400">
                      Tap untuk lihat detail
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-slate-900">
                    {formatCurrencyIDR(d.total)}
                  </p>
                </div>
              }
              collapsedContent={
                <div className="flex flex-col gap-2 ml-8 pl-4 border-l-2 mt-4">
                  <TransactionSection
                    name={name}
                    payer={d.payer}
                    items={d.transactions}
                    adjustments={d.debtAdjustments}
                    subtotal={d.debtSubtotal}
                    icon="🔻"
                    color="red"
                    sign="-"
                    label="ditraktir"
                  />
                  {d.hasSurplus && (
                    <TransactionSection
                      name={name}
                      payer={d.payer}
                      items={d.surplus}
                      adjustments={d.surplusAdjustments}
                      subtotal={d.surplusSubtotal}
                      icon="🟢"
                      color="emerald"
                      sign="+"
                      label="mentraktir"
                    />
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
