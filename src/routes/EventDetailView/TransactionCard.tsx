import { Collapse } from '@/components/Collapse';
import { cn } from '@/lib/utils';
import { formatCurrencyIDR } from '@/utils/currency';

// --- Transaction Components ---
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
  variant = 'debt',
}: {
  items: { title: string; basePrice: number }[];
  adjustments: { tax: number; service: number; discount: number };
  subtotal: number;
  color: 'positive' | 'negative';
  sign: string;
  icon?: string;
  label?: string;
  payer?: string;
  name?: string;
  variant?: 'debt' | 'transaction';
}) => {
  const isPositiveColor = color === 'positive';

  return (
    <div className={isPositiveColor ? 'mt-8' : ''}>
      {variant === 'debt' && (
        <p className="text-md mb-2">
          {icon} {name} {label} {payer}:
        </p>
      )}
      {items.map((item) => (
        <div className="flex items-center justify-between" key={item.title}>
          <p
            className={cn(
              `text-base`,
              isPositiveColor ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {item.title}
          </p>
          <p
            className={cn(
              'text-base font-semibold self-start',
              isPositiveColor ? 'text-emerald-600' : 'text-red-600'
            )}
          >
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
};

// --- Composable Components ---
const TransactionCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-card rounded-sm shadow-2xs ${className}`}>{children}</div>
);

const TransactionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b p-4">
    <h2 className="text-xl font-bold text-slate-800">{children}</h2>
  </div>
);

const TransactionPayTo = ({
  prefix,
  children,
}: {
  prefix?: string;
  children: React.ReactNode;
}) => (
  <div className="p-4">
    {prefix && <p className="text-l font-semibold text-slate-500">{prefix}</p>}
    {children}
  </div>
);

const TransactionDebtCollapse = ({
  headerContent,
  children,
  className = '',
  keyProp,
}: {
  headerContent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  keyProp: string;
}) => (
  <div className={className} key={keyProp}>
    <Collapse headerContent={headerContent} collapsedContent={children} />
  </div>
);

// --- Export all as named exports for composability ---
export {
  TransactionCard,
  TransactionTitle,
  TransactionPayTo,
  TransactionDebtCollapse,
  TransactionSection,
  AdjustmentRow,
  SubtotalRow,
};
