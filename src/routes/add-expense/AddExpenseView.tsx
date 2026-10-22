import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useLocation } from 'react-router';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Store from 'lucide-react/dist/esm/icons/store';
import X from 'lucide-react/dist/esm/icons/x';
import {
  isAddMemberCoachmarkSuppressed,
  suppressAddMemberCoachmark,
} from '@/utils/addMemberCoachmark';
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
  ERROR_MESSAGE_MIN_RP_0,
} from '@/constants/forms';
import { useAddExpense } from './addExpenseContext';
import { ReceiptsSection } from './ReceiptsSection';

export function AddExpenseView() {
 const { state, actions, meta } = useAddExpense();
 const { register, control, errors, fields } = meta;
 const { receipts } = state;

/** Subscribes this component to item rows (including `receiver`) so chips re-render when toggling. Passing `watch` from context does not reliably subscribe here. */
  const watchedItems = useWatch({ control, name: 'expense.items' });

  const addMemberButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const isFromScan = Boolean(
    (location.state as { fromScan?: boolean } | null)?.fromScan,
  );
  const [coachmarkDismissed, setCoachmarkDismissed] = useState(false);
  const showAddMemberCoachmark =
    isFromScan &&
    state.personList.length === 0 &&
    !coachmarkDismissed &&
    !isAddMemberCoachmarkSuppressed();

  const dismissAddMemberCoachmark = useCallback(() => {
    suppressAddMemberCoachmark();
    setCoachmarkDismissed(true);
  }, []);

  const handleOpenAddPersonDialog = () => {
    if (showAddMemberCoachmark) dismissAddMemberCoachmark();
    actions.openAddPersonDialog();
  };

  useEffect(() => {
    if (!showAddMemberCoachmark || !addMemberButtonRef.current) return;

    const driverRef: { current: ReturnType<typeof driver> | null } = {
      current: null,
    };

    driverRef.current = driver({
      animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: 300,
      overlayColor: '#0f172a',
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 9999,
      popoverClass: 'coachmark-add-member-popover',
      allowKeyboardControl: false,
      overlayClickBehavior: () => {
        dismissAddMemberCoachmark();
        driverRef.current?.destroy();
      },
      onCloseClick: () => {
        dismissAddMemberCoachmark();
        driverRef.current?.destroy();
      },
      onPopoverRender: (popover) => {
        const doneButton = document.createElement('button');
        doneButton.type = 'button';
        doneButton.className =
          'driver-popover-footer-btn coachmark-add-member-done';
        doneButton.innerText = 'Oke, paham';
        doneButton.addEventListener('click', () => {
          dismissAddMemberCoachmark();
          driverRef.current?.destroy();
        });
        popover.footerButtons.appendChild(doneButton);
      },
    });

    driverRef.current.highlight({
      element: addMemberButtonRef.current,
      popover: {
        title: 'Pilih anggota',
        description: 'Tambah anggota yang ikut patungan disini ya',
        side: 'left',
        align: 'center',
        showButtons: ['close'],
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && driverRef.current?.isActive()) {
        dismissAddMemberCoachmark();
        driverRef.current?.destroy();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      if (driverRef.current?.isActive()) driverRef.current.destroy();
    };
  }, [showAddMemberCoachmark, dismissAddMemberCoachmark]);

 return (
  <main className="bg-[#f6f8f6] min-h-dvh flex flex-col">
   <header className="sticky top-0 z-10 bg-[rgba(246,248,246,0.85)] backdrop-blur-md border-b border-slate-100 w-full max-w-lg mx-auto">
    <div className="flex items-center justify-between px-4 py-4">
     <button
      type="button"
      onClick={actions.navigateHome}
      className="size-10 rounded-full flex items-center justify-center cursor-pointer"
     >
      <ArrowLeft className="size-4 text-slate-900" />
     </button>
     <h1 className="text-lg font-bold text-slate-900 tracking-[-0.45px]">
      {state.isEditing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
     </h1>
     <div className="w-10" />
    </div>

    <div className="px-5 py-4 flex flex-col gap-2">
     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight px-1">
      Anggota
     </label>
     <div className="flex items-start gap-0 min-h-[72px]">
      <div className="flex-1 min-w-0 overflow-x-auto [scrollbar-width:thin]">
       <div className="flex items-start gap-4 pr-3 mt-2">
        {state.personList.map((name, index) => (
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
           onClick={() => actions.removePerson(name)}
           className="absolute -top-1 -right-1 size-5 rounded-full bg-slate-400 text-white flex items-center justify-center cursor-pointer hover:bg-red-500 transition-all"
          >
           <X className="size-2.5" />
          </button>
         </div>
        ))}
       </div>
      </div>

      <div className="shrink-0 flex flex-col gap-1 items-center self-stretch justify-center pl-3 border-l border-slate-200/90 bg-[rgba(246,248,246,0.98)] shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)]">
        <button
         ref={addMemberButtonRef}
         type="button"
         data-testid="add-member-button"
         onClick={handleOpenAddPersonDialog}
         className="size-12 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors"
        >
        <Plus className="size-3.5 text-slate-400" />
       </button>
       <span className="text-[12px] text-slate-500 font-medium tracking-tight">
        Tambah
       </span>
      </div>
     </div>
     {errors.personList?.message ? (
      <ErrorMessageForm
       text={errors.personList.message}
       className="ml-0 mt-0"
      />
     ) : null}
    </div>
   </header>

   <form
    onSubmit={meta.handleFormSubmit}
    className="flex-1 flex flex-col px-4 pt-4 pb-6 gap-4 max-w-lg mx-auto w-full"
   >
     <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight px-1">
       Nama Acara
      </label>
      <div className="relative">
       <Store className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
       <Controller
        name="title"
        control={control}
        rules={{ required: { value: true, message: ERROR_MESSAGE_REQUIRED } }}
        render={({ field }) => (
         <Input
          {...field}
          placeholder="contoh: Starbucks, Makan Siang"
          onChange={(e) => {
           field.onChange(e);
           actions.markTitleManuallyEdited();
          }}
          className="h-12 min-h-12 pl-10 bg-white border-0 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] font-semibold text-base py-0 placeholder:text-slate-300 placeholder:font-semibold"
         />
        )}
       />
      </div>
      {errors.title?.message ? (
       <ErrorMessageForm text={errors.title.message} />
      ) : null}
     </div>

      <ReceiptsSection
       receipts={receipts}
       fields={fields}
       watchedItems={watchedItems}
       personList={state.personList}
       register={register}
       control={control}
       errors={errors}
       onAddReceipt={actions.navigateAddReceipt}
       onRename={actions.renameReceipt}
       onDelete={actions.deleteReceipt}
       onAppendItemToReceipt={actions.appendItemToReceipt}
       onRemoveItem={actions.removeItem}
       onToggleReceiver={actions.toggleReceiver}
      />

     <div className="bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] p-4 flex flex-col gap-3.5">
     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
      Biaya & Pajak
     </label>

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
           data-testid="tax-input"
           value={formatThousandSeparator(value ?? '')}
           onChange={(e) => onChange(unformatThousandSeparator(e.target.value))}
           onFocus={(e) => e.target.select()}
           className="h-12 min-h-12 pl-7 bg-slate-50 rounded-lg border-0 text-right font-bold text-sm py-0 shadow-none focus-visible:ring-1"
          />
         )}
        />
      </div>
     </div>

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
           data-testid="service-input"
           value={formatThousandSeparator(value ?? '')}
           onChange={(e) => onChange(unformatThousandSeparator(e.target.value))}
           onFocus={(e) => e.target.select()}
           className="h-12 min-h-12 pl-7 bg-slate-50 rounded-lg border-0 text-right font-bold text-sm py-0 shadow-none focus-visible:ring-1"
          />
         )}
        />
      </div>
     </div>

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
           data-testid="discount-input"
           value={formatThousandSeparator(value ?? '')}
           onChange={(e) => onChange(unformatThousandSeparator(e.target.value))}
           onFocus={(e) => e.target.select()}
           className="h-12 min-h-12 pl-7 bg-slate-50 rounded-lg border-0 text-right font-bold text-sm py-0 shadow-none focus-visible:ring-1"
          />
         )}
        />
      </div>
     </div>

     {errors.expense?.tax?.message ? (
      <ErrorMessageForm text={errors.expense.tax.message} />
     ) : null}
     {errors.expense?.serviceCharge?.message ? (
      <ErrorMessageForm text={errors.expense.serviceCharge.message} />
     ) : null}
     {errors.expense?.discount?.message ? (
      <ErrorMessageForm text={errors.expense.discount.message} />
     ) : null}

     <div className="border-t border-dashed border-slate-200 pt-3 mt-0.5 flex items-center justify-between">
      <span className="text-sm font-bold text-slate-700">
       Total Pengeluaran
      </span>
      <span className="text-base font-mono font-bold text-green-600">
       {formatCurrencyIDR(Math.max(state.liveTotal, 0))}
      </span>
     </div>
    </div>

     <button
      type="submit"
      className="w-full py-4 rounded-xl bg-[#13ec5b] text-lg font-bold text-slate-900 cursor-pointer shadow-[0px_10px_15px_-3px_rgba(19,236,91,0.2),0px_4px_6px_-4px_rgba(19,236,91,0.2)] hover:brightness-95 transition-all mt-2"
     >
      Bagi Tagihan
     </button>
   </form>

   <AddPersonDialog
    open={state.showPersonDialog}
    onClose={actions.closeAddPersonDialog}
    onAdd={actions.addPerson}
    recentNames={state.recentNames}
    existingNames={state.personList}
   />
  </main>
 );
}
