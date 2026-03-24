import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Copy from 'lucide-react/dist/esm/icons/copy';
import HomeIcon from 'lucide-react/dist/esm/icons/home';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import ReceiptText from 'lucide-react/dist/esm/icons/receipt-text';
import Users from 'lucide-react/dist/esm/icons/users';
import { formatCurrencyIDR } from '@/utils/currency';
import { PersonAvatar } from '@/components/PersonAvatar';
import NotFoundPage from '../NotFoundPage';
import { cn } from '@/lib/utils';
import { TicketNotch } from './TicketNotch';
import { useEventResult } from './eventResultContext';

export function EventResultView() {
  const { state, actions } = useEventResult();
  const {
    migratedEvent,
    copied,
    expandedPersons,
    personNames,
    shares,
    totalAmount,
    totalItems,
    itemSubtotal,
    taxTotal,
    serviceTotal,
    discountTotal,
  } = state;

  if (!migratedEvent) return <NotFoundPage />;

  const { title } = migratedEvent;
  const hasFees = taxTotal > 0 || serviceTotal > 0 || discountTotal > 0;

  return (
    <main className="bg-[#f6f8f6] min-h-dvh max-w-lg mx-auto">
      <header className="sticky top-0 z-10 bg-[rgba(246,248,246,0.85)] backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={actions.navigateHome}
            className="size-10 rounded-full flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="size-4 text-slate-900" />
          </button>
          <div className="text-center flex-1 px-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-[-0.45px]">
              {title}
            </h1>
          </div>
          <button
            type="button"
            onClick={actions.navigateEdit}
            className="size-10 rounded-full flex items-center justify-center cursor-pointer"
          >
            <Pencil className="size-4 text-slate-900" />
          </button>
        </div>
      </header>

      <div className="mx-4 mb-4">
        <div className="bg-[#13ec5b] rounded-xl p-6 relative shadow-[0px_10px_15px_-3px_rgba(19,236,91,0.2),0px_4px_6px_-4px_rgba(19,236,91,0.2)]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium uppercase tracking-[0.7px] text-slate-900 opacity-80">
                Total Tagihan
              </p>
              <p className="text-4xl font-bold text-slate-900">
                {formatCurrencyIDR(totalAmount)}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-900/10 mt-4 pt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="size-3.5 text-slate-900" />
              <span className="text-sm font-semibold text-slate-900">
                {personNames.length} Anggota
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ReceiptText className="size-3.5 text-slate-900" />
              <span className="text-sm font-semibold text-slate-900">
                {totalItems} Item
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="bg-white border border-slate-100 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden p-4 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Ringkasan
          </p>

          <div className="flex justify-between items-baseline">
            <span className="text-sm font-mono text-slate-500">
              Subtotal ({totalItems} item)
            </span>
            <span className="text-sm font-mono font-medium text-slate-800">
              {formatCurrencyIDR(itemSubtotal)}
            </span>
          </div>

          {hasFees ? (
            <>
              {taxTotal > 0 ? (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-mono text-slate-500">
                    Pajak
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    + {formatCurrencyIDR(taxTotal)}
                  </span>
                </div>
              ) : null}
              {serviceTotal > 0 ? (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-mono text-slate-500">
                    Biaya Layanan
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    + {formatCurrencyIDR(serviceTotal)}
                  </span>
                </div>
              ) : null}
              {discountTotal > 0 ? (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-mono text-slate-500">
                    Diskon
                  </span>
                  <span className="text-[11px] font-mono text-green-600">
                    - {formatCurrencyIDR(discountTotal)}
                  </span>
                </div>
              ) : null}
            </>
          ) : null}

          <div className="border-t-2 border-dashed border-slate-200 pt-3 mt-1 flex justify-between items-baseline">
            <span className="text-sm font-mono font-bold uppercase text-slate-900">
              Total
            </span>
            <span className="text-base font-mono font-bold text-slate-900">
              {formatCurrencyIDR(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-3 pb-4">
        {shares.map((person) => {
          if (person.itemCount === 0) return null;

          const isExpanded = expandedPersons.has(person.name);
          const personColorIndex = personNames.indexOf(person.name);

          return (
            <div
              key={person.name}
              className="bg-white border border-slate-100 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => actions.togglePerson(person.name)}
                className="w-full flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <PersonAvatar
                    name={person.name}
                    colorIndex={personColorIndex}
                    size="sm"
                    className="size-10 text-base"
                  />
                  <div className="text-left">
                    <p className="text-base font-bold text-slate-900">
                      {person.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {person.itemCount} item
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrencyIDR(person.total)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-4 text-slate-400 transition-transform duration-200',
                      isExpanded && 'rotate-180',
                    )}
                  />
                </div>
              </button>

              {isExpanded ? (
                <>
                  <TicketNotch />

                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      {person.items.map((item) => (
                        <div key={item.title}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono text-slate-900 truncate mr-4">
                              {item.title}
                            </span>
                            <span className="text-sm font-mono font-bold text-slate-900 shrink-0">
                              {formatCurrencyIDR(item.pricePerPerson)}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">
                            {formatCurrencyIDR(item.totalPrice)} ÷{' '}
                            {item.totalReceivers} orang
                          </p>
                        </div>
                      ))}
                    </div>

                    {person.tax > 0 ||
                    person.serviceCharge > 0 ||
                    person.discount > 0 ? (
                      <div className="border-t border-dashed border-slate-100 pt-1 flex flex-col gap-[3px]">
                        {person.tax > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-slate-500">
                              Pajak (proporsional)
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              + {formatCurrencyIDR(person.tax)}
                            </span>
                          </div>
                        ) : null}
                        {person.serviceCharge > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-slate-500">
                              Biaya layanan (proporsional)
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              + {formatCurrencyIDR(person.serviceCharge)}
                            </span>
                          </div>
                        ) : null}
                        {person.discount > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-slate-500">
                              Diskon (proporsional)
                            </span>
                            <span className="text-[11px] font-mono text-green-700">
                              - {formatCurrencyIDR(person.discount)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="border-t-2 border-dashed border-slate-200 pt-3.5 flex items-center justify-between">
                      <span className="text-sm font-mono font-bold uppercase text-slate-900">
                        Total
                      </span>
                      <span className="text-base font-mono font-bold text-slate-900">
                        {formatCurrencyIDR(person.total)}
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-3 flex gap-3">
        <button
          type="button"
          onClick={actions.copyShare}
          className="flex-1 h-12 rounded-xl border border-slate-200 font-semibold text-slate-900 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="size-4" />
          {copied ? 'Tersalin!' : 'Salin Semua'}
        </button>
        <button
          type="button"
          onClick={actions.shareWhatsApp}
          className="flex-1 h-12 rounded-xl bg-[#13ec5b] font-semibold text-slate-900 cursor-pointer shadow-[0px_10px_15px_-3px_rgba(19,236,91,0.2),0px_4px_6px_-4px_rgba(19,236,91,0.2)] hover:brightness-95 transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="size-4" />
          WhatsApp
        </button>
      </div>

      <div className="px-4 pb-8">
        <button
          type="button"
          onClick={actions.navigateHome}
          className="w-full h-12 font-semibold text-slate-500 cursor-pointer hover:text-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <HomeIcon className="size-4" />
          Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}
