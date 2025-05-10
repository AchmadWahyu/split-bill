import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { formatCurrencyIDR } from '../../utils/currency';
import { ExpenseType } from './types';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { EditEventContextType } from '../EventFormLayout';
import { normalizeEventData } from '../../utils/normalizer';
import { EventType } from '../EventForm/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { BottomNav } from '@/components/BottomNav';

type ExpenseListFormValues = {
  expense: ExpenseType;
};

const ExpenseListForm = ({
  handleUpdateEventById,
}: {
  handleUpdateEventById: (newData: EventType) => void;
}) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event, handleUpdateEvent } = useOutletContext<EditEventContextType>();

  const normalizedEventData = normalizeEventData(event);

  const { personList, expense } = normalizedEventData;

  const { register, handleSubmit, control, getValues, watch } =
    useForm<ExpenseListFormValues>({
      defaultValues: {
        expense,
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expense.items',
  });

  return (
    <main className="relative min-h-screen bg-slate-50 items-center justify-center p-8">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Catat Pengeluaran
        </h1>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          const updatedEvent = {
            ...normalizedEventData,
            expense: data.expense,
          };

          handleUpdateEventById(updatedEvent);
          navigate(`/acara/${eventId}`);
        })}
        className="w-full max-w-md"
      >
        {fields.map((field, expenseItemIndex) => (
          <Card
            key={field.id}
            className="bg-white border-slate-200 shadow-sm mt-4"
          >
            <CardContent>
              <div className="flex justify-between">
                <label className="text-slate-900 font-semibold">
                  Apa yang dibeli?
                </label>

                {fields.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 bg-white border-red-600 hover:bg-white hover:border-red-400 hover:text-red-400 ml-2"
                    onClick={() => remove(expenseItemIndex)}
                  >
                    <Trash2 className="h-4 w-4 " />
                    <span className="sr-only">Hapus</span>
                  </Button>
                )}
              </div>
              <Input
                {...register(`expense.items.${expenseItemIndex}.title`)}
                placeholder="contoh: Bakso"
                defaultValue={field.title}
                className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 mt-4"
                autoFocus
              />
            </CardContent>

            <CardContent>
              <label className="text-slate-900 font-semibold">
                Berapa Harganya?
              </label>
              <Input
                {...register(`expense.items.${expenseItemIndex}.price`)}
                placeholder="Contoh: 10000"
                type="number"
                defaultValue={field.price}
                onFocus={(e) => {
                  e.target.select();
                }}
                className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 mt-2"
              />
            </CardContent>

            <CardContent>
              <label className="text-slate-900 font-semibold">
                Siapa yang bayarin?
              </label>

              <Controller
                name={`expense.items.${expenseItemIndex}.payer.name`}
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={personList?.[0]?.name}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-900 w-full">
                      <SelectValue placeholder="Pilih anggota" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      {personList.map((person) => (
                        <SelectItem
                          key={person.name}
                          value={person.name}
                          className="hover:bg-slate-100"
                        >
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </CardContent>

            <CardContent>
              <label className="text-slate-900 font-semibold">
                Siapa aja yang ikutan?
              </label>

              <div className="mt-2 flex flex-col gap-2">
                {personList?.length &&
                  personList.map((person, personIndex) => {
                    const currentExpenseTotalPrice =
                      getValues('expense.items')?.[expenseItemIndex]?.price ||
                      0;

                    const currentReceivers =
                      watch('expense.items')?.[
                        expenseItemIndex
                      ]?.receiver?.filter((r) => Boolean(r)) || [];

                    const isChecked = currentReceivers?.includes(person.name);

                    const averagePrice =
                      currentExpenseTotalPrice / currentReceivers.length || 0;

                    return (
                      <label key={personIndex} className="flex items-center">
                        <Controller
                          name={`expense.items.${expenseItemIndex}.receiver.${personIndex}`}
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? person.name : '');
                              }}
                              defaultValue={field.value || ''}
                              value={field.value || ''}
                              className="border-slate-300 data-[state=checked]:bg-primary"
                            />
                          )}
                        />
                        <span className="mx-2">{person.name}</span>
                        {isChecked && (
                          <b> - {formatCurrencyIDR(averagePrice)}</b>
                        )}
                      </label>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          className="w-full bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white mt-4 h-12"
          type="button"
          onClick={() =>
            append({
              title: '',
              price: 0,
              payer: { name: '' },
              receiver: [''],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>

        <Card className="bg-white border-slate-200 shadow-sm mt-4">
          <CardContent className="flex items-center">
            <label className="text-slate-900 font-semibold shrink-0">
              Pake pajak ngga?
            </label>
            <Input
              className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 ml-4 mr-2"
              type="number"
              {...register('expense.tax')}
              onFocus={(e) => {
                e.target.select();
              }}
              defaultValue={expense.tax}
            />
            <span>%</span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm mt-4">
          <CardContent className="flex items-center gap-4">
            <label className="text-slate-900 font-semibold shrink-0">
              Ada diskonnya?
            </label>
            <span>Rp.</span>
            <Input
              className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              type="number"
              {...register('expense.discount')}
              onFocus={(e) => {
                e.target.select();
              }}
              defaultValue={expense.discount}
            />
          </CardContent>
        </Card>

        <BottomNav
          containerClassName="mt-4"
          primaryButtonText="Selesai"
          secondaryButtonText="Balik edit daftar anggota"
          onClickSecondaryButton={handleSubmit((data) => {
            const updatedEvent = {
              ...normalizedEventData,
              expense: data.expense,
            };

            handleUpdateEvent(updatedEvent);
            navigate(`/acara/${eventId}/edit/anggota`);
          })}
        />
      </form>
    </main>
  );
};
export default ExpenseListForm;
