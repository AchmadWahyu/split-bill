import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  useFieldArray,
  useForm,
  type SubmitHandler,
} from 'react-hook-form';
import { EventType } from '@/types';
import {
  normalizeEventData,
  migrateEventData,
  eventDefaultValues,
} from '@/utils/normalizer';
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

  const navigateHome = useCallback(() => navigate('/'), [navigate]);

  const value = useMemo(
    () => ({
      state: {
        personList,
        showPersonDialog,
        isEditing,
        liveTotal,
        recentNames,
      },
      actions: {
        navigateHome,
        openAddPersonDialog: () => setShowPersonDialog(true),
        closeAddPersonDialog: () => setShowPersonDialog(false),
        addPerson: handleAddPerson,
        removePerson: handleRemovePerson,
        toggleReceiver,
        appendItem: () =>
          append({ title: '', price: '0', receiver: [] }),
        removeItem: remove,
      },
      meta: {
        register,
        control,
        watch,
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
      navigateHome,
      handleAddPerson,
      handleRemovePerson,
      toggleReceiver,
      append,
      remove,
      handleSubmit,
      onSubmit,
      register,
      control,
      watch,
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
