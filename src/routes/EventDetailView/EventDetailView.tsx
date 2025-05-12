import { createArrOfDebts, normalizeArrOfDebts } from '../../utils/debts';
import { useNavigate, useParams } from 'react-router';
import { EventType } from '../EventForm/types';
import { eventDefaultValues } from '../EventForm/defaultValues';
import { DebtCard } from './DebtCard';
import { Button } from '@/components/ui/button';
import { Info, Pencil } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const EventDetailView = ({ eventList }: { eventList: EventType[] }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const currentEvent = eventList?.find((event) => event.id === eventId);

  const { title, personList, expense } = currentEvent || eventDefaultValues;

  const expenseItems = expense?.items;

  if (expenseItems?.length === 0 || personList?.length === 0) {
    return <h2>Belum ada data</h2>;
  }
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

        <TooltipProvider>
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
        </TooltipProvider>
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
