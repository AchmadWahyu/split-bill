import {
  Controller,
  SubmitErrorHandler,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import {
  formatCurrencyIDR,
  formatThousandSeparator,
  unformatThousandSeparator,
} from '../../utils/currency';
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
import { ErrorMessageForm } from '@/components/ErrorMessageForm';
import {
  ERROR_MESSAGE_MAX_PERCENTAGE_TAX,
  ERROR_MESSAGE_MIN_RP_0,
  ERROR_MESSAGE_MIN_RP_1,
  ERROR_MESSAGE_REQUIRED,
} from '@/constants/forms';
import NotFoundPage from '../NotFoundPage';
import { ToggleWrapper } from '@/components/ui/toggle-wrapper';
import { useCallback, useRef } from 'react';
import { findFirstErrorPath } from './utils';
import { mergeRefs } from '@/utils/common';

export type ExpenseListFormValues = {
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

  const { personList, expense, title } = normalizedEventData;

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm<ExpenseListFormValues>({
    defaultValues: {
      expense,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expense.items',
  });

  const expenseError = errors?.expense;

  // Store refs for each input field
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isTaxPercentage = getValues('expense.tax.type') === 'PERCENTAGE';
  const isDiscountPercentage =
    getValues('expense.discount.type') === 'PERCENTAGE';
  const isServiceChargePercentage =
    getValues('expense.serviceCharge.type') === 'PERCENTAGE';

  const onSubmit: SubmitHandler<ExpenseListFormValues> = useCallback(
    (data) => {
      const updatedEvent = {
        ...normalizedEventData,
        expense: data.expense,
      };

      handleUpdateEventById(updatedEvent);
      navigate(`/acara/${eventId}`);
    },
    [normalizedEventData, handleUpdateEventById, navigate, eventId]
  );

  const onError: SubmitErrorHandler<ExpenseListFormValues> = useCallback(
    (err) => {
      // Find the first error path
      const firstErrorPath = findFirstErrorPath(err);

      if (firstErrorPath) {
        const refKey = firstErrorPath.join('.');
        const ref = inputRefs.current[refKey];

        if (ref && typeof ref.focus === 'function') {
          ref.focus();
        }
      }
    },
    []
  );

  if (!title) return <NotFoundPage />;

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Catat Pengeluaran
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="w-full max-w-md"
      >
        {fields.map((field, expenseItemIndex) => {
          const errorItem = expenseError?.items?.[expenseItemIndex];

          return (
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
                  {...register(`expense.items.${expenseItemIndex}.title`, {
                    required: {
                      value: true,
                      message: ERROR_MESSAGE_REQUIRED,
                    },
                  })}
                  placeholder="contoh: Bakso"
                  defaultValue={field.title}
                  className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 mt-4"
                  autoFocus
                  type="text"
                  ref={mergeRefs(
                    register(`expense.items.${expenseItemIndex}.title`).ref,
                    (el) => {
                      inputRefs.current[
                        `expense.items.${expenseItemIndex}.title`
                      ] = el;
                    }
                  )}
                />

                {errorItem?.title?.message && (
                  <ErrorMessageForm text={errorItem?.title?.message || ''} />
                )}
              </CardContent>

              <CardContent>
                <label className="text-slate-900 font-semibold">
                  Berapa Harganya?
                </label>

                <Controller
                  name={`expense.items.${expenseItemIndex}.price`}
                  control={control}
                  render={({ field: { onChange, value, ref, ...rest } }) => (
                    <Input
                      {...rest}
                      inputMode="numeric"
                      placeholder="Contoh: 30.000"
                      defaultValue={value}
                      value={formatThousandSeparator(value ?? '')}
                      onChange={(e) => {
                        const digitsOnly = unformatThousandSeparator(
                          e.target.value
                        );
                        onChange(digitsOnly);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 mt-2"
                      ref={mergeRefs(ref, (el) => {
                        inputRefs.current[
                          `expense.items.${expenseItemIndex}.price`
                        ] = el;
                      })}
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: ERROR_MESSAGE_REQUIRED,
                    },
                    min: {
                      value: 1,
                      message: ERROR_MESSAGE_MIN_RP_1,
                    },
                  }}
                />

                {errorItem?.price && (
                  <ErrorMessageForm text={errorItem?.price?.message || ''} />
                )}
              </CardContent>

              <CardContent>
                <label className="text-slate-900 font-semibold">
                  Siapa yang bayarin?
                </label>

                <Controller
                  name={`expense.items.${expenseItemIndex}.payer.name`}
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: ERROR_MESSAGE_REQUIRED,
                    },
                  }}
                  render={({
                    field: { ref, value, onChange, ...fieldProps },
                  }) => (
                    <Select
                      value={value}
                      onValueChange={onChange}
                      defaultValue={personList?.[0]?.name}
                      {...fieldProps}
                    >
                      <SelectTrigger
                        className="bg-white border-slate-200 text-slate-900 w-full"
                        ref={mergeRefs(ref, (el) => {
                          inputRefs.current[
                            `expense.items.${expenseItemIndex}.payer.name`
                          ] = el;
                        })}
                      >
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

                {errorItem?.payer?.name && (
                  <ErrorMessageForm
                    text={errorItem?.payer?.name?.message || ''}
                  />
                )}
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
                        '';

                      const currentReceivers =
                        watch('expense.items')?.[
                          expenseItemIndex
                        ]?.receiver?.filter((r) => Boolean(r)) || [];

                      const isChecked = currentReceivers?.includes(person.name);

                      const averagePrice =
                        parseInt(currentExpenseTotalPrice) /
                          currentReceivers.length || 0;

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
          );
        })}

        <Button
          className="w-full bg-primary hover:bg-primary-variant hover:bg-slate-800 text-white mt-4 h-12"
          type="button"
          onClick={() =>
            append({
              title: '',
              price: '0',
              payer: { name: '' },
              receiver: [''],
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>

        <Card className="bg-white border-slate-200 shadow-sm mt-4">
          <CardContent>
            <ToggleWrapper
              control={control}
              clearErrors={clearErrors}
              controllerName="expense.tax.type"
              fieldLabel={
                <label className="text-slate-900 font-semibold shrink-0">
                  Pake pajak ngga?
                </label>
              }
              percentageLabel={
                <span className="text-slate-900 font-semibold">%</span>
              }
              amountLabel={
                <span className="text-slate-900 font-semibold">Rp</span>
              }
            >
              <>
                <Controller
                  name="expense.tax.value"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      {...rest}
                      inputMode="numeric"
                      placeholder="Contoh: 30.000"
                      defaultValue={value}
                      value={formatThousandSeparator(value ?? '')}
                      onChange={(e) => {
                        const digitsOnly = unformatThousandSeparator(
                          e.target.value
                        );

                        onChange(digitsOnly);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: ERROR_MESSAGE_REQUIRED,
                    },
                    min: {
                      value: 0,
                      message: ERROR_MESSAGE_MIN_RP_0,
                    },
                    validate: (value) => {
                      if (isTaxPercentage && Number(value) > 100) {
                        return ERROR_MESSAGE_MAX_PERCENTAGE_TAX;
                      }
                      return true;
                    },
                  }}
                />
                {expenseError?.tax?.value?.message && (
                  <ErrorMessageForm
                    text={expenseError?.tax?.value?.message || ''}
                  />
                )}
              </>
            </ToggleWrapper>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm mt-4">
          <CardContent>
            <ToggleWrapper
              control={control}
              clearErrors={clearErrors}
              controllerName="expense.serviceCharge.type"
              fieldLabel={
                <label className="text-slate-900 font-semibold shrink-0">
                  Ada Service Chargenya?
                </label>
              }
              percentageLabel={
                <span className="text-slate-900 font-semibold">%</span>
              }
              amountLabel={
                <span className="text-slate-900 font-semibold">Rp</span>
              }
            >
              <>
                <Controller
                  name="expense.serviceCharge.value"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      {...rest}
                      inputMode="numeric"
                      placeholder="Contoh: 30.000"
                      defaultValue={value}
                      value={formatThousandSeparator(value ?? '')}
                      onChange={(e) => {
                        const digitsOnly = unformatThousandSeparator(
                          e.target.value
                        );

                        onChange(digitsOnly);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: ERROR_MESSAGE_REQUIRED,
                    },
                    min: {
                      value: 0,
                      message: ERROR_MESSAGE_MIN_RP_0,
                    },
                    validate: (value) => {
                      if (isServiceChargePercentage && Number(value) > 100) {
                        return ERROR_MESSAGE_MAX_PERCENTAGE_TAX;
                      }
                      return true;
                    },
                  }}
                />
                {expenseError?.serviceCharge?.value?.message && (
                  <ErrorMessageForm
                    text={expenseError?.serviceCharge?.value?.message || ''}
                  />
                )}
              </>
            </ToggleWrapper>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm mt-4">
          <CardContent>
            <ToggleWrapper
              control={control}
              clearErrors={clearErrors}
              controllerName="expense.discount.type"
              fieldLabel={
                <label className="text-slate-900 font-semibold shrink-0">
                  Ada diskonnya?
                </label>
              }
              percentageLabel={
                <span className="text-slate-900 font-semibold">%</span>
              }
              amountLabel={
                <span className="text-slate-900 font-semibold">Rp</span>
              }
            >
              <>
                <Controller
                  name="expense.discount.value"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      {...rest}
                      inputMode="numeric"
                      placeholder="Contoh: 30.000"
                      defaultValue={value}
                      value={formatThousandSeparator(value ?? '')}
                      onChange={(e) => {
                        const digitsOnly = unformatThousandSeparator(
                          e.target.value
                        );

                        onChange(digitsOnly);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      className="w-full bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                    />
                  )}
                  rules={{
                    required: {
                      value: true,
                      message: ERROR_MESSAGE_REQUIRED,
                    },
                    min: {
                      value: 0,
                      message: ERROR_MESSAGE_MIN_RP_0,
                    },
                    validate: (value) => {
                      if (isDiscountPercentage && Number(value) > 100) {
                        return ERROR_MESSAGE_MAX_PERCENTAGE_TAX;
                      }
                      return true;
                    },
                  }}
                />
                {expenseError?.discount?.value?.message && (
                  <ErrorMessageForm
                    text={expenseError?.discount?.value?.message || ''}
                  />
                )}
              </>
            </ToggleWrapper>
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
