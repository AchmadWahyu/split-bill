import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
 Controller,
 SubmitHandler,
 useFieldArray,
 useForm,
} from 'react-hook-form';
import { ArrowLeft, Plus, Store, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventType } from '@/types';
import {
 normalizeEventData,
 migrateEventData,
 eventDefaultValues,
} from '@/utils/normalizer';
import {
 formatCurrencyIDR,
 formatThousandSeparator,
 unformatThousandSeparator,
} from '@/utils/currency';
import { Input } from '@/components/ui/input';

import { ErrorMessageForm } from '@/components/ErrorMessageForm';
import { PersonAvatar } from '@/components/PersonAvatar';
import { AddPersonDialog } from '@/components/AddPersonDialog';
import {
 ERROR_MESSAGE_REQUIRED,
 ERROR_MESSAGE_MIN_RP_1,
 ERROR_MESSAGE_MIN_RP_0,
} from '@/constants/forms';

type AddExpenseFormValues = {
 title: string;
 /** Synthetic field for person-strip validation errors only */
 personList?: string;
 expense: {
  items: {
   title: string;
   price: string;
   receiver: string[];
  }[];
  tax: string;
  discount: string;
  serviceCharge: string;
 };
};

type AddExpensePageProps = {
 eventList: EventType[];
 handleUpdateEventById: (data: EventType) => void;
};

export default function AddExpensePage({
 eventList,
 handleUpdateEventById,
}: AddExpensePageProps) {
 const navigate = useNavigate();
 const { eventId } = useParams();

 const existingEvent = eventList.find((e) => e.id === eventId);
 const normalizedEvent = normalizeEventData(existingEvent);
 const isEditing = Boolean(existingEvent?.title);

 const migratedExpense = isEditing
  ? migrateEventData(normalizedEvent).expense
  : eventDefaultValues.expense;

 const [personList, setPersonList] = useState<string[]>(
  normalizedEvent.personList.map((p) => p.name).filter((n) => Boolean(n)),
 );
 const [showPersonDialog, setShowPersonDialog] = useState(false);

 const recentNames = useMemo(() => {
  const names = new Set<string>();
  for (const event of [...eventList].reverse()) {
   if (!event.id) continue;
   for (const person of event.personList) {
    if (person.name && names.size < 10) {
     names.add(person.name);
    }
   }
  }
  return Array.from(names);
 }, [eventList]);

 const {
  register,
  handleSubmit,
  control,
  getValues,
  setValue,
  watch,
  setError,
  clearErrors,
  formState: { errors },
 } = useForm<AddExpenseFormValues>({
  defaultValues: {
   title: normalizedEvent.title,
   expense: {
    items: migratedExpense.items.map((item) => ({
     title: item.title,
     price: item.price,
     receiver: item.receiver.filter((r) => Boolean(r)),
    })),
    tax: migratedExpense.tax.value,
    discount: migratedExpense.discount.value,
    serviceCharge: migratedExpense.serviceCharge.value,
   },
  },
 });

 const { fields, append, remove } = useFieldArray({
  control,
  name: 'expense.items',
 });

 const watchedItems = watch('expense.items');
 const watchedTax = watch('expense.tax');
 const watchedService = watch('expense.serviceCharge');
 const watchedDiscount = watch('expense.discount');

 const subtotal = (watchedItems || []).reduce(
  (sum, item) => sum + Number(item?.price || 0),
  0,
 );
 const liveTotal =
  subtotal +
  Number(watchedTax || 0) +
  Number(watchedService || 0) -
  Number(watchedDiscount || 0);

 useEffect(() => {
  if (personList.length > 0) {
   clearErrors('personList');
  }
 }, [personList, clearErrors]);

 const handleAddPerson = useCallback((name: string) => {
  setPersonList((prev) => [...prev, name]);
 }, []);

 const handleRemovePerson = useCallback(
  (name: string) => {
   setPersonList((prev) => prev.filter((p) => p !== name));
   const items = getValues('expense.items');
   items.forEach((_, index) => {
    const current = getValues(`expense.items.${index}.receiver`);
    setValue(
     `expense.items.${index}.receiver`,
     current.filter((r) => r !== name),
    );
   });
  },
  [getValues, setValue],
 );

 const toggleReceiver = useCallback(
  (itemIndex: number, personName: string) => {
   const currentReceivers = getValues(`expense.items.${itemIndex}.receiver`);
   if (currentReceivers.includes(personName)) {
    const updated = currentReceivers.filter((r) => r !== personName);
    setValue(`expense.items.${itemIndex}.receiver`, updated);
   } else {
    setValue(`expense.items.${itemIndex}.receiver`, [
     ...currentReceivers,
     personName,
    ]);
    clearErrors(`expense.items.${itemIndex}.receiver`);
   }
  },
  [getValues, setValue, clearErrors],
 );

 const onSubmit: SubmitHandler<AddExpenseFormValues> = useCallback(
  (data) => {
   if (personList.length === 0) {
    setError('personList', {
     type: 'manual',
     message: 'Tambah minimal 1 orang terlebih dahulu',
    });
    return;
   }

   let hasUnassigned = false;
   data.expense.items.forEach((item, index) => {
    if (item.receiver.length === 0) {
     setError(`expense.items.${index}.receiver`, {
      type: 'manual',
      message: 'Pilih minimal 1 orang',
     });
     hasUnassigned = true;
    }
   });
   if (hasUnassigned) return;

   const eventData: EventType = {
    id: eventId || crypto.randomUUID(),
    title: data.title,
    personList: personList.map((name) => ({ name })),
    expense: {
     items: data.expense.items.map((item) => ({
      title: item.title,
      price: item.price,
      receiver: item.receiver,
     })),
     tax: { value: data.expense.tax, type: 'AMOUNT' as const },
     discount: { value: data.expense.discount, type: 'AMOUNT' as const },
     serviceCharge: {
      value: data.expense.serviceCharge,
      type: 'AMOUNT' as const,
     },
    },
   };

   handleUpdateEventById(eventData);
   navigate(`/acara/${eventData.id}`);
  },
  [eventId, personList, handleUpdateEventById, navigate, setError],
 );

 return (
  <main className="bg-[#f6f8f6] min-h-dvh flex flex-col">
   {/* Header */}
   <header className="sticky top-0 z-10 bg-[rgba(246,248,246,0.85)] backdrop-blur-md border-b border-slate-100 w-full max-w-lg mx-auto">
    <div className="flex items-center justify-between px-4 py-4">
     <button
      type="button"
      onClick={() => navigate('/')}
      className="size-10 rounded-full flex items-center justify-center cursor-pointer"
     >
      <ArrowLeft className="size-4 text-slate-900" />
     </button>
     <h1 className="text-lg font-bold text-slate-900 tracking-[-0.45px]">
      {isEditing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
     </h1>
     <div className="w-10" />
    </div>

    {/* Person strip */}
    <div className="px-5 py-4 overflow-x-auto">
     <div className="flex items-start gap-4">
      {/* Add button */}
      <div className="flex flex-col gap-1 items-center shrink-0">
       <button
        type="button"
        onClick={() => setShowPersonDialog(true)}
        className="size-12 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors"
       >
        <Plus className="size-3.5 text-slate-400" />
       </button>
       <span className="text-[12px] text-slate-500 font-medium tracking-tight">
        Tambah
       </span>
      </div>

      {/* Person avatars */}
      {personList.map((name, index) => (
       <div
        key={name}
        className="flex flex-col gap-1 items-center relative group shrink-0"
       >
        <PersonAvatar name={name} colorIndex={index} size="md" />
        <span className="text-[12px] text-slate-700 font-medium max-w-[48px] truncate tracking-tight">
         {name}
        </span>
        <button
         type="button"
         onClick={() => handleRemovePerson(name)}
         className="absolute -top-1 -right-1 size-5 rounded-full bg-slate-400 text-white flex items-center justify-center cursor-pointer hover:bg-red-500 transition-all"
        >
         <X className="size-2.5" />
        </button>
       </div>
      ))}
     </div>
     {errors.personList?.message && (
      <ErrorMessageForm
       text={errors.personList.message}
       className="ml-0 mt-2"
      />
     )}
    </div>
   </header>

   {/* Form body */}
   <form
    onSubmit={handleSubmit(onSubmit)}
    className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4 max-w-lg mx-auto w-full"
   >
    {/* Store / Title */}
    <div className="flex flex-col gap-1">
     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight px-1">
      Nama Acara
     </label>
     <div className="relative">
      <Store className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      <Input
       {...register('title', {
        required: { value: true, message: ERROR_MESSAGE_REQUIRED },
       })}
       placeholder="contoh: Starbucks, Makan Siang"
       className="pl-10 bg-white border-0 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold text-base py-3.5 h-auto placeholder:text-slate-300 placeholder:font-semibold"
      />
     </div>
     {errors.title?.message && <ErrorMessageForm text={errors.title.message} />}
    </div>

    {/* Items section */}
    <div className="flex flex-col gap-3">

     {fields.map((field, itemIndex) => {
      const watchedReceivers =
       watch(`expense.items.${itemIndex}.receiver`) || [];
      const itemErrors = errors.expense?.items?.[itemIndex];
      const hasReceiverError = Boolean(itemErrors?.receiver as unknown);

      return (
       <div
        key={field.id}
        className={cn(
         'bg-white border rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3',
         hasReceiverError ? 'border-red-300' : 'border-slate-100',
        )}
       >
        {/* Item name + price + remove */}
        <div className="flex gap-3 items-start">
         <div className="flex-1 self-start flex flex-col gap-1 min-w-0">
          <Input
           {...register(`expense.items.${itemIndex}.title`, {
            required: {
             value: true,
             message: ERROR_MESSAGE_REQUIRED,
            },
           })}
           placeholder="Nama item"
           className="border-0 p-0 font-bold text-base h-auto shadow-none focus-visible:ring-0 placeholder:text-slate-300"
          />
          {itemErrors?.title?.message && (
           <ErrorMessageForm
            text={itemErrors.title.message}
            className="ml-0 mt-0"
           />
          )}
         </div>

         <div className="w-32 flex flex-col gap-1">
          <div className="relative w-full">
           <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            Rp
           </span>
           <Controller
            name={`expense.items.${itemIndex}.price`}
            control={control}
            rules={{
             required: {
              value: true,
              message: ERROR_MESSAGE_REQUIRED,
             },
             min: { value: 1, message: ERROR_MESSAGE_MIN_RP_1 },
            }}
            render={({ field: { onChange, value, ...rest } }) => (
             <Input
              {...rest}
              inputMode="numeric"
              value={formatThousandSeparator(value ?? '')}
              onChange={(e) =>
               onChange(unformatThousandSeparator(e.target.value))
              }
              onFocus={(e) => e.target.select()}
              className="pl-7 bg-slate-50 rounded-xl border-0 text-right font-bold text-sm py-1.5 h-auto shadow-none focus-visible:ring-1"
             />
            )}
           />
          </div>
          {itemErrors?.price?.message && (
           <ErrorMessageForm
            text={itemErrors.price.message}
            className="ml-0 mt-0 text-right"
           />
          )}
         </div>

         {fields.length > 1 && (
          <button
           type="button"
           onClick={() => remove(itemIndex)}
           className="cursor-pointer text-slate-300 hover:text-red-500 transition-colors"
          >
           <X className="size-3" />
          </button>
         )}
        </div>

        {/* Person assignment avatars */}
        {personList.length > 0 && (
         <div className="flex items-center gap-1.5 flex-wrap">
          {personList.map((name, personIndex) => {
           const isAssigned = watchedReceivers.includes(name);
           return (
            <PersonAvatar
             key={name}
             name={name}
             colorIndex={personIndex}
             size="sm"
             selected={isAssigned}
             faded={!isAssigned}
             onClick={() => toggleReceiver(itemIndex, name)}
            />
           );
          })}
         </div>
        )}
        {hasReceiverError && (
         <ErrorMessageForm
          text={
           (
            itemErrors?.receiver as unknown as {
             message?: string;
            }
           )?.message ?? 'Pilih minimal 1 orang'
          }
          className="ml-0 mt-0"
         />
        )}
       </div>
      );
     })}

     {/* Add new item */}
     <button
      type="button"
      onClick={() => append({ title: '', price: '0', receiver: [] })}
      className="border-2 border-dashed border-slate-300 rounded-xl py-4 flex items-center justify-center gap-2 cursor-pointer hover:border-slate-400 transition-colors"
     >
      <Plus className="size-4 text-slate-500" />
      <span className="text-sm font-bold text-slate-500">Tambah Item Baru</span>
     </button>
    </div>

    {/* Fees & Tax */}
    <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3.5">
     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
      Biaya & Pajak
     </label>

     {/* Tax */}
     <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
       <span className="text-base">💰</span>
       <span className="text-sm font-medium text-slate-700">Pajak</span>
      </div>
      <div className="w-32 relative">
       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
        Rp
       </span>
       <Controller
        name="expense.tax"
        control={control}
        rules={{
         min: { value: 0, message: ERROR_MESSAGE_MIN_RP_0 },
        }}
        render={({ field: { onChange, value, ...rest } }) => (
         <Input
          {...rest}
          inputMode="numeric"
          value={formatThousandSeparator(value ?? '')}
          onChange={(e) => onChange(unformatThousandSeparator(e.target.value))}
          onFocus={(e) => e.target.select()}
          className="pl-7 bg-slate-50 rounded-lg border-0 text-right font-bold text-sm py-1 h-auto shadow-none focus-visible:ring-1"
         />
        )}
       />
      </div>
     </div>

     {/* Service Charge */}
     <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
       <span className="text-base">🍽️</span>
       <span className="text-sm font-medium text-slate-700">Biaya Layanan</span>
      </div>
      <div className="w-32 relative">
       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
        Rp
       </span>
       <Controller
        name="expense.serviceCharge"
        control={control}
        rules={{
         min: { value: 0, message: ERROR_MESSAGE_MIN_RP_0 },
        }}
        render={({ field: { onChange, value, ...rest } }) => (
         <Input
          {...rest}
          inputMode="numeric"
          value={formatThousandSeparator(value ?? '')}
          onChange={(e) => onChange(unformatThousandSeparator(e.target.value))}
          onFocus={(e) => e.target.select()}
          className="pl-7 bg-slate-50 rounded-lg border-0 text-right font-bold text-sm py-1 h-auto shadow-none focus-visible:ring-1"
         />
        )}
       />
      </div>
     </div>

     {/* Discount */}
     <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
       <span className="text-base">🏷️</span>
       <span className="text-sm font-medium text-slate-700">Diskon</span>
      </div>
      <div className="w-32 relative">
       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
        Rp
       </span>
       <Controller
        name="expense.discount"
        control={control}
        rules={{
         min: { value: 0, message: ERROR_MESSAGE_MIN_RP_0 },
        }}
        render={({ field: { onChange, value, ...rest } }) => (
         <Input
          {...rest}
          inputMode="numeric"
          value={formatThousandSeparator(value ?? '')}
          onChange={(e) => onChange(unformatThousandSeparator(e.target.value))}
          onFocus={(e) => e.target.select()}
          className="pl-7 bg-slate-50 rounded-lg border-0 text-right font-bold text-sm py-1 h-auto shadow-none focus-visible:ring-1"
         />
        )}
       />
      </div>
     </div>

     {errors.expense?.tax?.message && (
      <ErrorMessageForm text={errors.expense.tax.message} />
     )}
     {errors.expense?.serviceCharge?.message && (
      <ErrorMessageForm text={errors.expense.serviceCharge.message} />
     )}
     {errors.expense?.discount?.message && (
      <ErrorMessageForm text={errors.expense.discount.message} />
     )}

     {/* Live total */}
     <div className="border-t border-dashed border-slate-200 pt-3 mt-0.5 flex items-center justify-between">
      <span className="text-sm font-bold text-slate-700">
       Total Pengeluaran
      </span>
      <span className="text-base font-mono font-bold text-green-600">
       {formatCurrencyIDR(Math.max(liveTotal, 0))}
      </span>
     </div>
    </div>

    {/* Submit button */}
    <button
     type="submit"
     className="w-full py-4 rounded-xl bg-[#13ec5b] text-lg font-bold text-slate-900 cursor-pointer shadow-[0px_10px_15px_-3px_rgba(19,236,91,0.2),0px_4px_6px_-4px_rgba(19,236,91,0.2)] hover:brightness-95 transition-all mt-2"
    >
     Simpan
    </button>
   </form>

   {/* Person dialog */}
   <AddPersonDialog
    open={showPersonDialog}
    onClose={() => setShowPersonDialog(false)}
    onAdd={handleAddPerson}
    recentNames={recentNames}
    existingNames={personList}
   />
  </main>
 );
}
