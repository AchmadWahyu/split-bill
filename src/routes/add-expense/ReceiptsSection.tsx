import { useState } from 'react';
import { Controller } from 'react-hook-form';
import type {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import type { ReceiptMetaType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatCurrencyIDR, formatThousandSeparator, unformatThousandSeparator } from '@/utils/currency';
import { getReceiptSubtotal } from '@/utils/receipts';
import { PersonAvatar } from '@/components/PersonAvatar';
import { ErrorMessageForm } from '@/components/ErrorMessageForm';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ReceiptText from 'lucide-react/dist/esm/icons/receipt-text';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Camera from 'lucide-react/dist/esm/icons/camera';
import Plus from 'lucide-react/dist/esm/icons/plus';
import X from 'lucide-react/dist/esm/icons/x';
import type { AddExpenseFormValues } from './types';

type ReceiptsSectionProps = {
  receipts: ReceiptMetaType[];
  fields: FieldArrayWithId<AddExpenseFormValues, 'expense.items', 'id'>[];
  watchedItems: AddExpenseFormValues['expense']['items'] | undefined;
  personList: string[];
  register: UseFormRegister<AddExpenseFormValues>;
  control: Control<AddExpenseFormValues>;
  errors: FieldErrors<AddExpenseFormValues>;
  onAddReceipt: () => void;
  onRename: (receiptId: string, newName: string) => void;
  onDelete: (receiptId: string) => void;
  onAppendItemToReceipt: (receiptId: string) => void;
  onRemoveItem: (index: number) => void;
  onToggleReceiver: (itemIndex: number, personName: string) => void;
};

const receiptIconBgColors = [
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
];

function ItemRow({
  itemIndex,
  field,
  watchedItems,
  personList,
  register,
  control,
  errors,
  canRemove,
  onRemove,
  onToggleReceiver,
}: {
  itemIndex: number;
  field: FieldArrayWithId<AddExpenseFormValues, 'expense.items', 'id'>;
  watchedItems: AddExpenseFormValues['expense']['items'] | undefined;
  personList: string[];
  register: UseFormRegister<AddExpenseFormValues>;
  control: Control<AddExpenseFormValues>;
  errors: FieldErrors<AddExpenseFormValues>;
  canRemove: boolean;
  onRemove: (index: number) => void;
  onToggleReceiver: (itemIndex: number, personName: string) => void;
}) {
  const watchedReceivers = watchedItems?.[itemIndex]?.receiver ?? [];
  const itemErrors = errors.expense?.items?.[itemIndex];
  const hasReceiverError = Boolean(itemErrors?.receiver as unknown);

  return (
    <div
      key={field.id}
      data-testid="receipt-item"
      className={cn(
        'py-3 flex flex-col gap-3 border-b border-slate-50 last:border-0',
        hasReceiverError && 'bg-red-50/50 -mx-4 px-4 rounded-lg',
      )}
    >
      <div className="flex gap-3 items-center">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <Input
            {...register(`expense.items.${itemIndex}.title`, {
              required: { value: true, message: 'Wajib diisi' },
            })}
            placeholder="Nama item"
            className="h-10 min-h-10 border-0 px-0.5 py-0 font-bold text-base shadow-none focus-visible:ring-0 placeholder:text-slate-300 bg-transparent"
          />
          {itemErrors?.title?.message ? (
            <ErrorMessageForm
              text={itemErrors.title.message}
              className="ml-0 mt-0"
            />
          ) : null}
        </div>

        <div className="w-28 flex flex-col gap-1">
          <div className="relative w-full">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              Rp
            </span>
            <Controller
              name={`expense.items.${itemIndex}.price`}
              control={control}
              rules={{
                required: { value: true, message: 'Wajib' },
                min: { value: 1, message: 'Min Rp 1' },
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
                  className="h-10 min-h-10 pl-7 bg-slate-50 rounded-xl border-0 text-right font-bold text-sm py-0 shadow-none focus-visible:ring-1"
                />
              )}
            />
          </div>
          {itemErrors?.price?.message ? (
            <ErrorMessageForm
              text={itemErrors.price.message}
              className="ml-0 mt-0 text-right"
            />
          ) : null}
        </div>

        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(itemIndex)}
            className="cursor-pointer text-slate-300 hover:text-red-500 transition-colors p-1"
          >
            <X className="size-3" />
          </button>
        ) : (
          <div className="w-5" />
        )}
      </div>

      {personList.length > 0 ? (
        <div className="flex items-center gap-2 flex-wrap">
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
                onClick={() => onToggleReceiver(itemIndex, name)}
              />
            );
          })}
        </div>
      ) : null}
      {hasReceiverError ? (
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
      ) : null}
    </div>
  );
}

function ReceiptGroup({
  index,
  receipt,
  itemIndices,
  fields,
  watchedItems,
  personList,
  register,
  control,
  errors,
  canRemoveAnyItem,
  onRename,
  onDelete,
  onAppendItem,
  onRemoveItem,
  onToggleReceiver,
}: {
  index: number;
  receipt: ReceiptMetaType;
  itemIndices: number[];
  fields: FieldArrayWithId<AddExpenseFormValues, 'expense.items', 'id'>[];
  watchedItems: AddExpenseFormValues['expense']['items'] | undefined;
  personList: string[];
  register: UseFormRegister<AddExpenseFormValues>;
  control: Control<AddExpenseFormValues>;
  errors: FieldErrors<AddExpenseFormValues>;
  canRemoveAnyItem: boolean;
  onRename: (receiptId: string, newName: string) => void;
  onDelete: (receiptId: string) => void;
  onAppendItem: (receiptId: string) => void;
  onRemoveItem: (index: number) => void;
  onToggleReceiver: (itemIndex: number, personName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(receipt.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const subtotal = getReceiptSubtotal(receipt.id, watchedItems || []);
  const iconColorClass = receiptIconBgColors[index % receiptIconBgColors.length];

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed) {
      onRename(receipt.id, trimmed);
    } else {
      setEditName(receipt.name);
    }
    setIsEditing(false);
  };

  return (
    <>
      <div
        className="bg-white border border-slate-100 rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden"
        data-testid="receipt-card"
        data-receipt-name={receipt.name}
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div
            className={cn(
              'size-11 rounded-xl flex items-center justify-center shrink-0',
              iconColorClass,
            )}
          >
            <ReceiptText className="size-5" />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setEditName(receipt.name);
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className="h-8 min-h-8 px-2 py-0 text-sm font-bold bg-slate-50 border-0 rounded-lg"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-left w-full"
              >
                <p className="text-sm font-bold text-slate-900 truncate">
                  Struk {index + 1} <span className="text-slate-400 mx-1">•</span> {receipt.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {itemIndices.length} Item <span className="text-slate-300 mx-1">•</span> {formatCurrencyIDR(subtotal)}
                </p>
              </button>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Ubah nama receipt"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Hapus receipt"
            >
              <Trash2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={expanded ? 'Ciutkan' : 'Kembangkan'}
            >
              <ChevronDown
                className={cn(
                  'size-4 transition-transform duration-200',
                  !expanded && 'rotate-180',
                )}
              />
            </button>
          </div>
        </div>

        {/* Items */}
        {expanded ? (
          <div className="px-4 pb-2">
            {itemIndices.map((itemIndex) => (
              <ItemRow
                key={fields[itemIndex].id}
                itemIndex={itemIndex}
                field={fields[itemIndex]}
                watchedItems={watchedItems}
                personList={personList}
                register={register}
                control={control}
                errors={errors}
                canRemove={canRemoveAnyItem}
                onRemove={onRemoveItem}
                onToggleReceiver={onToggleReceiver}
              />
            ))}

            <button
              type="button"
              onClick={() => onAppendItem(receipt.id)}
              data-testid="add-item-to-receipt"
              className="w-full border border-dashed border-slate-300 rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer hover:border-slate-400 transition-colors mb-3"
            >
              <Plus className="size-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-500">
                Tambah Item di {receipt.name}
              </span>
            </button>
          </div>
        ) : null}
      </div>

      {showDeleteDialog ? (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="max-w-xs rounded-2xl border-none shadow-2xl p-6">
            <AlertDialogHeader className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <Trash2 className="size-5 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-slate-900">
                Hapus Receipt?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-slate-500">
                Semua item di receipt "{receipt.name}" akan dihapus. Tindakan ini tidak bisa dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3 w-full mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 py-3 rounded-xl border-slate-200 text-slate-600 font-medium hover:bg-slate-50 text-sm h-auto"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onDelete(receipt.id);
                  setShowDeleteDialog(false);
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 text-sm h-auto"
              >
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}

export function ReceiptsSection({
  receipts,
  fields,
  watchedItems,
  personList,
  register,
  control,
  errors,
  onAddReceipt,
  onRename,
  onDelete,
  onAppendItemToReceipt,
  onRemoveItem,
  onToggleReceiver,
}: ReceiptsSectionProps) {
  // Group item indices by receiptId, preserving field array order within each receipt.
  const indicesByReceipt = new Map<string, number[]>();
  const orphanIndices: number[] = [];

  for (let i = 0; i < fields.length; i++) {
    const receiptId = fields[i].receiptId;
    if (receiptId && indicesByReceipt.has(receiptId)) {
      indicesByReceipt.get(receiptId)!.push(i);
    } else if (receiptId) {
      indicesByReceipt.set(receiptId, [i]);
    } else {
      orphanIndices.push(i);
    }
  }

  const canRemoveAnyItem = fields.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight px-1">
        Daftar Struk
      </label>

      <div className="flex flex-col gap-3">
        {receipts.map((receipt, index) => (
          <ReceiptGroup
            key={receipt.id}
            index={index}
            receipt={receipt}
            itemIndices={indicesByReceipt.get(receipt.id) ?? []}
            fields={fields}
            watchedItems={watchedItems}
            personList={personList}
            register={register}
            control={control}
            errors={errors}
            canRemoveAnyItem={canRemoveAnyItem}
            onRename={onRename}
            onDelete={onDelete}
            onAppendItem={onAppendItemToReceipt}
            onRemoveItem={onRemoveItem}
            onToggleReceiver={onToggleReceiver}
          />
        ))}

        {orphanIndices.length > 0 ? (
          <div
            className="bg-white border border-slate-100 rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden p-4"
            data-testid="orphan-items-card"
          >
            <p className="text-sm font-bold text-slate-900 mb-3">Item Lainnya</p>
            {orphanIndices.map((itemIndex) => (
              <ItemRow
                key={fields[itemIndex].id}
                itemIndex={itemIndex}
                field={fields[itemIndex]}
                watchedItems={watchedItems}
                personList={personList}
                register={register}
                control={control}
                errors={errors}
                canRemove={canRemoveAnyItem}
                onRemove={onRemoveItem}
                onToggleReceiver={onToggleReceiver}
              />
            ))}

            <button
              type="button"
              onClick={() => onAppendItemToReceipt('')}
              data-testid="add-orphan-item"
              className="w-full border border-dashed border-slate-300 rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer hover:border-slate-400 transition-colors mt-2"
            >
              <Plus className="size-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-500">Tambah Item</span>
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAddReceipt}
        data-testid="scan-new-receipt"
        className="w-full border-2 border-dashed border-[#13ec5b] rounded-xl py-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-green-50/50 transition-colors"
      >
        <Camera className="size-5 text-green-600" />
        <span className="text-sm font-bold text-green-700">+ Scan / Upload Struk Baru</span>
      </button>
    </div>
  );
}
