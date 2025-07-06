import {
  creatDetailedTransactionsForEachPerson,
  createArrOfDebts,
  normalizeArrOfDebts,
  normalizeArrTransactionsForEachPerson,
} from '../../utils/debts';
import { useNavigate, useParams } from 'react-router';
import { EventType } from '../EventForm/types';
import { eventDefaultValues } from '../EventForm/defaultValues';
import { Button } from '@/components/ui/button';
import { Info, Pencil } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import NotFoundPage from '../NotFoundPage';
import { useState } from 'react';
import { TransactionCard } from './TransactionCard';
import {
  TransactionDebtCollapse,
  TransactionPayTo,
  TransactionSection,
  TransactionTitle,
} from './TransactionCard';
import { formatCurrencyIDR } from '@/utils/currency';

const EventDetailView = ({ eventList }: { eventList: EventType[] }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const currentEvent = eventList?.find((event) => event.id === eventId);

  const [activeTab, setActiveTab] = useState(0);

  const { title, personList, expense } = currentEvent || eventDefaultValues;

  if (!title) return <NotFoundPage />;

  const personListSToString = personList.map((person) => person.name);

  const arrOfDebts = createArrOfDebts(expense, personListSToString);

  const finalResults = normalizeArrOfDebts(arrOfDebts);

  const detailedTransactionsForEachPerson =
    creatDetailedTransactionsForEachPerson(expense, personListSToString);
  const normalizedArrTransactionsForEachPerson =
    normalizeArrTransactionsForEachPerson(detailedTransactionsForEachPerson);

  return (
    <main className="max-w-lg mx-auto py-8">
      <div className="text-left mb-4 flex gap-2 items-start justify-between mx-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        <Button
          type="button"
          onClick={() => navigate(`/acara/${eventId}/edit/transaksi`)}
          variant="outline"
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="p-2 rounded-lg flex gap-2 text-slate-800 text-sm items-center mx-8">
        <p>Datanya disimpan lokal di perangkat kamu</p>

        <Drawer>
          <DrawerTrigger>
            <Info className="size-4" />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                Datanya disimpan lokal di perangkat kamu
              </DrawerTitle>
              <DrawerDescription>
                <p className="text-slate-700">
                  Aplikasi ini menggunakan sistem local-first, artinya semua
                  data tagihan hanya tersimpan di browser kamu — bukan di server
                </p>
                <div className="border-1 p-4 rounded-md mt-4">
                  <p className="font-semibold text-lg text-slate-900">
                    Apa artinya buat kamu?
                  </p>

                  <ul className="list-disc ml-4 mt-2 text-slate-700">
                    <li>
                      Kalau kamu membagikan link tagihan ini, orang lain tidak
                      bisa melihat isinya
                    </li>
                    <li>Data hanya bisa diakses dari perangkat yang sama</li>
                  </ul>
                </div>
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose>
                <Button className="w-full h-12">Mengerti</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="flex border-b border-gray-200 px-6 justify-around">
        <button
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 0
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500'
          }`}
          onClick={() => setActiveTab(0)}
        >
          Ringkasan
        </button>
        <button
          className={`py-3 px-4 font-medium text-sm ${
            activeTab === 1
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-500'
          }`}
          onClick={() => setActiveTab(1)}
        >
          Rincian
        </button>
      </div>

      {activeTab === 0 && (
        <div className="flex flex-col gap-4 mt-4 mx-8">
          {finalResults.map((person) => {
            const filteredDebt = person.debts.filter(
              (d) => d?.totalDebtAfterDiscountAndTax
            );

            if (!filteredDebt?.length) return null;

            return (
              <TransactionCard key={person.name}>
                <TransactionTitle>{person.name}</TransactionTitle>
                <TransactionPayTo prefix="Bayar ke:">
                  {filteredDebt.map((debt, idx) => {
                    // Prepare adjustments and subtotals for TransactionSection
                    const debtAdjustments = {
                      tax: debt.transactions.reduce(
                        (prev, curr) => prev + curr.tax,
                        0
                      ),
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
                      tax: debt.surplus.reduce(
                        (prev, curr) => prev + curr.tax,
                        0
                      ),
                      service: debt.surplus.reduce(
                        (prev, curr) => prev + curr.serviceCharge,
                        0
                      ),
                      discount: debt.surplus.reduce(
                        (prev, curr) => prev + curr.discount,
                        0
                      ),
                    };
                    const debtSubtotal = debt.transactions.reduce(
                      (prev, curr) => prev + curr.debtAfterDiscountAndTax,
                      0
                    );
                    const surplusSubtotal = debt.surplus.reduce(
                      (prev, curr) => prev + curr.debtAfterDiscountAndTax,
                      0
                    );
                    const hasSurplus = debt.surplus.length > 0;

                    return (
                      <TransactionDebtCollapse
                        keyProp={debt.payer}
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
                              {formatCurrencyIDR(
                                debt.totalDebtAfterDiscountAndTax
                              )}
                            </p>
                          </div>
                        }
                        className={`mt-2 pb-4${
                          filteredDebt.length > 1 &&
                          idx !== filteredDebt.length - 1
                            ? ' border-b-1'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col gap-2 ml-8 pl-4 border-l-2 mt-4">
                          <TransactionSection
                            name={person.name}
                            payer={debt.payer}
                            items={debt.transactions.map((t) => ({
                              title: t.title,
                              basePrice: t.basePrice,
                            }))}
                            adjustments={debtAdjustments}
                            subtotal={debtSubtotal}
                            icon="🔻"
                            color="negative"
                            sign="-"
                            label="ditraktir"
                          />
                          {hasSurplus && (
                            <TransactionSection
                              name={person.name}
                              payer={debt.payer}
                              items={debt.surplus.map((s) => ({
                                title: s.title,
                                basePrice: s.basePrice,
                              }))}
                              adjustments={surplusAdjustments}
                              subtotal={surplusSubtotal}
                              icon="🟢"
                              color="positive"
                              sign="+"
                              label="mentraktir"
                            />
                          )}
                        </div>
                      </TransactionDebtCollapse>
                    );
                  })}
                </TransactionPayTo>
              </TransactionCard>
            );
          })}
        </div>
      )}

      {activeTab === 1 && (
        <div className="flex flex-col gap-4 mt-4 mx-8">
          {normalizedArrTransactionsForEachPerson.map((person) => {
            const { name, transactions } = person;

            if (!transactions?.length) return null;

            const totalDebtAfterDiscountAndTax = transactions.reduce(
              (acc, curr) => acc + curr.debtAfterDiscountAndTax,
              0
            );

            const debtAdjustments = {
              tax: transactions.reduce((prev, curr) => prev + curr.tax, 0),
              service: transactions.reduce(
                (prev, curr) => prev + curr.serviceCharge,
                0
              ),
              discount: transactions.reduce(
                (prev, curr) => prev + curr.discount,
                0
              ),
            };

            const debtSubtotal = transactions.reduce(
              (prev, curr) => prev + curr.debtAfterDiscountAndTax,
              0
            );

            return (
              <TransactionCard key={person.name}>
                <TransactionTitle>{person.name}</TransactionTitle>
                <TransactionPayTo>
                  <TransactionDebtCollapse
                    keyProp={name}
                    headerContent={
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-l font-semibold text-slate-900">
                            Rincian Transaksi:
                          </p>
                          <p className="text-sm text-slate-400">
                            Tap untuk lihat detail
                          </p>
                        </div>
                        <p className="text-xl font-semibold text-slate-900">
                          {formatCurrencyIDR(totalDebtAfterDiscountAndTax)}
                        </p>
                      </div>
                    }
                    className={`mt-2 pb-4${''}`}
                  >
                    <div className="flex flex-col gap-2 ml-8 pl-4 border-l-2 mt-4">
                      <TransactionSection
                        items={transactions.map((t) => ({
                          title: t.title,
                          basePrice: t.basePrice,
                        }))}
                        adjustments={debtAdjustments}
                        subtotal={debtSubtotal}
                        color="negative"
                        sign="-"
                        variant="transaction"
                      />
                    </div>
                  </TransactionDebtCollapse>
                </TransactionPayTo>
              </TransactionCard>
            );
          })}
        </div>
      )}

      <div className="mx-8">
        <Button
          onClick={() => navigate('/')}
          type="button"
          className="w-full bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white h-12 whitespace-normal mt-4"
        >
          Balik ke Home
        </Button>
      </div>
    </main>
  );
};

export default EventDetailView;
