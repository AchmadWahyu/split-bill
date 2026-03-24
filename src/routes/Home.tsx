import { Link, useNavigate } from 'react-router';
import { EventType } from '@/types';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Camera from 'lucide-react/dist/esm/icons/camera';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Users from 'lucide-react/dist/esm/icons/users';
import { Button } from '@/components/ui/button';
import { formatCurrencyIDR, calculateTotalExpense } from '../utils/currency';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

const Home = ({
  eventList: _eventList,
  handleDeleteEventById,
}: {
  eventList: EventType[];
  handleDeleteEventById: (eventId: string) => void;
}) => {
  const navigate = useNavigate();
  const [newEventId] = useState(() => crypto.randomUUID());
  const url = `/acara/${newEventId}/edit`;

  const [showDialog, setShowDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const eventList = _eventList.filter((event) => Boolean(event.id));
  const hasNoTransaction = eventList.length === 0;

  return (
    <main className="bg-[#f6f8f6] min-h-dvh max-w-lg mx-auto flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-2">
        <div className="flex flex-col items-center text-center gap-1">
          <h1 className="text-4xl font-medium text-slate-900 tracking-[-0.9px]">
            Split Bareng
          </h1>
          <p className="text-base text-slate-600 leading-6">
            Patungan jadi gampang, cepet, dan adil.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 pt-2 pb-[150px] flex flex-col gap-4">

        {/* Empty state */}
        {hasNoTransaction && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-slate-100 p-6 mb-4">
              <Users className="size-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              Belum ada acara nih
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs">
              Yuk, bikin acara patungan baru!
            </p>
          </div>
        )}

        {/* Event cards */}
        <div className="flex flex-col gap-4">
          {eventList.map((event) => {
            const totalExpense = calculateTotalExpense(event.expense);
            const personCount = event.personList.filter((p) =>
              Boolean(p.name)
            ).length;

            return (
              <button
                type="button"
                key={event.id}
                onClick={() => navigate(`/acara/${event.id}`)}
                className="bg-white border border-slate-100 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-[21px] flex flex-col gap-4 cursor-pointer text-left hover:shadow-md transition-shadow"
              >
                {/* Title + delete */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-medium text-slate-900 line-clamp-1">
                    {event.title}
                  </span>
                  <button
                    aria-label="Hapus acara"
                    type="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDialog(true);
                      setSelectedEventId(event.id);
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Stats row */}
                <div className="border-t border-slate-50 pt-[9px] flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <Users className="size-3.5 text-slate-500" />
                    <span className="text-sm text-slate-500">
                      {personCount} orang
                    </span>
                  </div>
                  <span className="text-lg font-medium text-slate-900">
                    {formatCurrencyIDR(totalExpense)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback link */}
        {/* <button
          type="button"
          onClick={() => navigate('/feedback')}
          className="text-sm text-slate-400 cursor-pointer hover:text-slate-600 transition-colors py-4"
        >
          💬 Punya ide supaya Split Bareng lebih gampang dipakai?
        </button> */}
      </div>
      
      {/* FAB Scan Receipt */}
      <Link to={url} className="fixed bottom-28 right-8 z-10 max-w-lg">
        <div className="flex size-12 items-center justify-center rounded-full border border-slate-100 bg-white shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer">
          <Camera className="size-5 text-green-600" strokeWidth={2.5} />
        </div>
      </Link>

      {/* FAB Add Expense Manual */}
      <Link to={url} className="fixed bottom-8 right-6 z-10 max-w-lg">
        <div className="size-16 rounded-full bg-[#13ec5b] flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] hover:brightness-95 transition-all cursor-pointer">
          <Plus className="size-5 text-slate-900" strokeWidth={2.5} />
        </div>
      </Link>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDialog}>
        <AlertDialogContent className="max-w-xs rounded-2xl border-none shadow-2xl p-6">
          <AlertDialogHeader className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <Trash2 className="size-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-slate-900">
              Hapus Tagihan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 w-full mt-2">
            <Button
              onClick={() => setShowDialog(false)}
              type="button"
              variant="outline"
              className="flex-1 py-3 rounded-xl border-slate-200 text-slate-600 font-medium hover:bg-slate-50 text-sm h-auto"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                handleDeleteEventById(selectedEventId);
                setShowDialog(false);
              }}
              type="button"
              className="flex-1 py-3 rounded-xl bg-[#13ec5b] text-slate-900 font-semibold hover:bg-[#13ec5b]/90 text-sm h-auto"
            >
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default Home;
