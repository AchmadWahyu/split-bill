import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  useFieldArray,
  useForm,
  type SubmitHandler,
} from 'react-hook-form';
import { EventType, ReceiptMetaType } from '@/types';
import {
  normalizeEventData,
  migrateEventData,
  eventDefaultValues,
} from '@/utils/normalizer';
import {
  generateEventTitle,
  removeReceiptFromEvent,
  renameReceiptInEvent,
} from '@/utils/receipts';
import { AddExpenseContext } from './addExpenseContext';
import type { AddExpenseFormValues, AddExpensePageProps } from './types';

export type { AddExpenseFormValues } from './types';

export function AddExpenseProvider({
  eventList,
  handleUpdateEventById,
  children,
}: AddExpensePageProps & { children: ReactNode }) {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const existingEvent = eventList.find((e) => e.id === eventId);
  const normalizedEvent = useMemo(
    () => normalizeEventData(existingEvent),
    [existingEvent],
  );
  const isEditing = Boolean(existingEvent?.title);

  const migratedExpense = isEditing
    ? migrateEventData(normalizedEvent).expense
    : eventDefaultValues.expense;

  const [personList, setPersonList] = useState<string[]>(
    normalizedEvent.personList.map((p) => p.name).filter((n) => Boolean(n)),
  );
  const [receipts, setReceipts] = useState<ReceiptMetaType[]>(
    normalizedEvent.receipts || [],
  );
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
  const [showPersonDialog, setShowPersonDialog] = useState(false);

  useEffect(() => {
    setReceipts(normalizedEvent.receipts || []);
  }, [normalizedEvent.receipts]);

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
          receiptId: item.receiptId,
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
      const currentReceivers =
        getValues(`expense.items.${itemIndex}.receiver`) ?? [];
      if (currentReceivers.includes(personName)) {
        const updated = currentReceivers.filter((r) => r !== personName);
        setValue(`expense.items.${itemIndex}.receiver`, updated, {
          shouldDirty: true,
          shouldTouch: true,
        });
      } else {
        setValue(
          `expense.items.${itemIndex}.receiver`,
          [...currentReceivers, personName],
          { shouldDirty: true, shouldTouch: true },
        );
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
            receiptId: item.receiptId,
          })),
          tax: { value: data.expense.tax, type: 'AMOUNT' as const },
          discount: { value: data.expense.discount, type: 'AMOUNT' as const },
          serviceCharge: {
            value: data.expense.serviceCharge,
            type: 'AMOUNT' as const,
          },
        },
        receipts,
      };

      handleUpdateEventById(eventData);
      navigate(`/acara/${eventData.id}`);
    },
    [eventId, personList, receipts, handleUpdateEventById, navigate, setError],
  );

  const navigateHome = useCallback(() => navigate('/'), [navigate]);
  const navigateAddReceipt = useCallback(() => {
    // Persist the current in-progress event so that members/items are not lost
    // when the user leaves to scan another receipt and comes back.
    const currentData = getValues();
    const partialEvent: EventType = {
      id: eventId || crypto.randomUUID(),
      title: currentData.title,
      personList: personList.map((name) => ({ name })),
      expense: {
        items: currentData.expense.items.map((item) => ({
          title: item.title,
          price: item.price,
          receiver: item.receiver,
          receiptId: item.receiptId,
        })),
        tax: { value: currentData.expense.tax, type: 'AMOUNT' as const },
        discount: { value: currentData.expense.discount, type: 'AMOUNT' as const },
        serviceCharge: {
          value: currentData.expense.serviceCharge,
          type: 'AMOUNT' as const,
        },
      },
      receipts,
    };
    handleUpdateEventById(partialEvent);
    navigate(`/acara/${eventId}/scan`);
  }, [navigate, eventId, personList, receipts, getValues, handleUpdateEventById]);

  const handleRenameReceipt = useCallback(
    (receiptId: string, newName: string) => {
      setReceipts((prev) => {
        const updated = renameReceiptInEvent(
          { receipts: prev } as EventType,
          receiptId,
          newName,
        ).receipts;
        if (!titleManuallyEdited) {
          setValue('title', generateEventTitle(updated));
        }
        return updated;
      });
    },
    [setValue, titleManuallyEdited],
  );

  const handleDeleteReceipt = useCallback(
    (receiptId: string) => {
      const currentItems = getValues('expense.items');
      const indicesToRemove = currentItems
        .map((item, index) =>
          item.receiptId === receiptId ? index : -1,
        )
        .filter((index) => index >= 0);

      const updatedEvent = removeReceiptFromEvent(
        {
          ...normalizedEvent,
          receipts,
          expense: {
            ...normalizedEvent.expense,
            items: currentItems,
          },
        },
        receiptId,
      );

      setReceipts(updatedEvent.receipts);

      // Remove from highest index to keep indices valid
      remove([...indicesToRemove].reverse());

      setValue('expense.tax', updatedEvent.expense.tax.value);
      setValue('expense.serviceCharge', updatedEvent.expense.serviceCharge.value);
      setValue('expense.discount', updatedEvent.expense.discount.value);

      if (!titleManuallyEdited) {
        setValue('title', updatedEvent.title);
      }
    },
    [
      getValues,
      normalizedEvent,
      receipts,
      remove,
      setValue,
      titleManuallyEdited,
    ],
  );

  const value = useMemo(
    () => ({
      state: {
        personList,
        showPersonDialog,
        isEditing,
        liveTotal,
        recentNames,
        receipts,
      },
      actions: {
        navigateHome,
        navigateAddReceipt,
        openAddPersonDialog: () => setShowPersonDialog(true),
        closeAddPersonDialog: () => setShowPersonDialog(false),
        addPerson: handleAddPerson,
        removePerson: handleRemovePerson,
        toggleReceiver,
        appendItem: () => {
          const lastReceiptId = receipts[receipts.length - 1]?.id;
          append({
            title: '',
            price: '0',
            receiver: [],
            receiptId: lastReceiptId,
          });
        },
        appendItemToReceipt: (receiptId: string) =>
          append({ title: '', price: '0', receiver: [], receiptId }),
        removeItem: remove,
        renameReceipt: handleRenameReceipt,
        deleteReceipt: handleDeleteReceipt,
        markTitleManuallyEdited: () => setTitleManuallyEdited(true),
      },
      meta: {
        register,
        control,
        errors,
        fields,
        handleFormSubmit: handleSubmit(onSubmit),
      },
    }),
    [
      personList,
      showPersonDialog,
      isEditing,
      liveTotal,
      recentNames,
      receipts,
      navigateHome,
      navigateAddReceipt,
      handleAddPerson,
      handleRemovePerson,
      toggleReceiver,
      append,
      remove,
      handleRenameReceipt,
      handleDeleteReceipt,
      handleSubmit,
      onSubmit,
      register,
      control,
      errors,
      fields,
    ],
  );

  return (
    <AddExpenseContext.Provider value={value}>
      {children}
    </AddExpenseContext.Provider>
  );
}
