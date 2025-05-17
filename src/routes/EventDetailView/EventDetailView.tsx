import { createArrOfDebts, normalizeArrOfDebts } from '../../utils/debts';
import { useNavigate, useParams } from 'react-router';
import { EventType } from '../EventForm/types';
import { eventDefaultValues } from '../EventForm/defaultValues';
import { DebtCard } from './DebtCard';
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

const EventDetailView = ({ eventList }: { eventList: EventType[] }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const currentEvent = eventList?.find((event) => event.id === eventId);

  const { title, personList, expense } = currentEvent || eventDefaultValues;

  if (!title) return <NotFoundPage />;

  const personListSToString = personList.map((person) => person.name);

  const arrOfDebts = createArrOfDebts(expense, personListSToString);

  const finalResults = normalizeArrOfDebts(arrOfDebts);

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="text-left mb-8 flex gap-2 items-start justify-between">
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

      <div className="p-2 rounded-lg flex gap-2 text-slate-800 text-sm items-center">
        <p>Datanya disimpan lokal di perangkat kamu</p>

        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              <span>
                Kalau kamu bagikan link-nya, orang lain nggak bisa melihat
                datanya.
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

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

      <div className="flex flex-col gap-4 mt-4">
        {finalResults.map((person) => {
          const filteredDebt = person.debts.filter(
            (d) => d?.totalDebtAfterDiscountAndTax
          );

          if (!filteredDebt?.length) return null;

          return (
            <DebtCard
              key={person.name}
              debts={filteredDebt}
              name={person.name}
            />
          );
        })}
      </div>

      <Button
        onClick={() => navigate('/')}
        type="button"
        className="w-full bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white h-12 whitespace-normal mt-4"
      >
        Balik ke Home
      </Button>
    </main>
  );
};

export default EventDetailView;
