import { Link, useNavigate } from 'react-router';
import { EventType } from './EventForm/types';
import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrencyIDR } from '../utils/currency';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';

const Home = ({
  eventList: _eventList,
  handleDeleteEventById,
}: {
  eventList: EventType[];
  handleDeleteEventById: (eventId: string) => void;
}) => {
  const navigate = useNavigate();
  const eventId = crypto.randomUUID();
  const url = `/acara/${eventId}/edit/general`;

  const [showDialog, setShowDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const eventList = _eventList.filter((event) => Boolean(event.id));
  const hasNoTransacton = eventList.length === 0;

  return (
    <main className="p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Split Bareng
        </h1>

        {!hasNoTransacton && (
          <p className="text-muted-foreground mt-4 mb-6 max-w-md">
            Split bill simpel, cepet, bareng-bareng!
          </p>
        )}
      </div>
      {hasNoTransacton && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Belum ada acara nih</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md">
            Yuk, bikin acara patungan baru!
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {eventList.map((event) => {
          const expensesPrice = event.expense.items.map((item) => item.price);
          const totalExpense = expensesPrice.reduce(
            (prev, curr) => Number(prev) + Number(curr)
          );

          return (
            <Card
              onClick={() => {
                navigate(`/acara/${event.id}`);
              }}
              key={event.id}
              className="overflow-hidden hover:cursor-pointer"
            >
              <CardHeader className="">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2 text-xl">
                    {event.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4 h-8 w-8 p-0 text-red-600 bg-white border-red-600 hover:bg-white hover:border-red-400 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDialog(true);
                      setSelectedEventId(event.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Hapus</span>
                  </Button>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between border-t pt-3 text-sm">
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{event.personList.length} orang</span>
                </div>
                <div className="font-medium">
                  {formatCurrencyIDR(totalExpense)}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Link to={url} className="fixed bottom-6 right-6 z-10">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-14 w-14" size={14} />
          <span className="sr-only">New Event</span>
        </Button>
      </Link>

      <AlertDialog open={showDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus transaksi ini?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-between">
            <Button
              onClick={() => setShowDialog(false)}
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-900 hover:bg-slate-100 h-12 w-1/2 whitespace-normal"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                handleDeleteEventById(selectedEventId);
                setShowDialog(false);
              }}
              type="button"
              variant="destructive"
              className="h-12 w-1/2 whitespace-normal"
            >
              Ya, hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default Home;
