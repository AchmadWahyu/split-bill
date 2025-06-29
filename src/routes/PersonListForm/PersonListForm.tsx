import equal from 'fast-deep-equal';
import { useFieldArray, useForm } from 'react-hook-form';
import { PersonType } from './types';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { EditEventContextType } from '../EventFormLayout';
import { normalizeEventData } from '../../utils/normalizer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { ErrorMessageForm } from '@/components/ErrorMessageForm';
import {
  ERROR_MESSAGE_NAME_DUPLICATE,
  ERROR_MESSAGE_REQUIRED,
} from '@/constants/forms';
import NotFoundPage from '../NotFoundPage';
import { EventType } from '../EventForm/types';
import { resetExpense } from '../ExpenseListForm/utils';

type PersonListFormValues = {
  personList: PersonType[];
};

const PersonListForm = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { event, handleUpdateEvent } = useOutletContext<EditEventContextType>();

  const normalizedEventData = normalizeEventData(event);

  const { personList, title } = normalizedEventData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonListFormValues>({
    defaultValues: {
      personList,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'personList',
  });

  if (!title) return <NotFoundPage />;

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Masukin Anggota
        </h1>
        <h2 className="text-xl text-slate-600">Siapa aja yang ikut?</h2>
      </div>

      <form
        onSubmit={handleSubmit((data) => {
          const isPersonListChanged = !equal(personList, data.personList);

          const updatedEvent: EventType = {
            ...normalizedEventData,
            expense: isPersonListChanged
              ? resetExpense(normalizedEventData.expense)
              : normalizedEventData.expense,
            personList: data.personList,
          };

          handleUpdateEvent(updatedEvent);
          navigate(`/acara/${eventId}/edit/transaksi`);
        })}
        className="w-full max-w-md"
      >
        <div className="flex flex-col gap-2.5">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 w-full">
              <div className="w-full">
                <Input
                  {...register(`personList.${index}.name`, {
                    required: true,
                    validate: {
                      checkUnique: (value, values) => {
                        const currentPersonList = values.personList.map(
                          (p) => p.name
                        );

                        return (
                          currentPersonList?.filter((p) => p === value)
                            ?.length < 2
                        );
                      },
                    },
                  })}
                  placeholder="Masukin nama temen kamu..."
                  defaultValue={field.name}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  autoFocus
                />

                {errors?.personList?.[index]?.name?.type === 'required' && (
                  <ErrorMessageForm text={ERROR_MESSAGE_REQUIRED} />
                )}

                {errors?.personList?.[index]?.name?.type === 'checkUnique' && (
                  <ErrorMessageForm text={ERROR_MESSAGE_NAME_DUPLICATE} />
                )}
              </div>

              {fields?.length > 1 && (
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="grow-1 bg-rose-200 hover:bg-primary-variant text-rose-600"
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            onClick={() => append({ name: '' })}
            className="grow-1 bg-primary hover:bg-primary-variant text-white"
          >
            Tambah anggota baru
          </Button>
        </div>

        <BottomNav
          fixedPosition
          primaryButtonText="Lanjut tambah pengeluaran"
          secondaryButtonText="Balik edit nama acara"
          onClickSecondaryButton={handleSubmit((data) => {
            const isPersonListChanged = !equal(personList, data.personList);

            const updatedEvent: EventType = {
              ...normalizedEventData,
              expense: isPersonListChanged
                ? resetExpense(normalizedEventData.expense)
                : normalizedEventData.expense,
              personList: data.personList,
            };

            handleUpdateEvent(updatedEvent);
            navigate(`/acara/${eventId}/edit/general`);
          })}
        />
      </form>
    </main>
  );
};

export default PersonListForm;
