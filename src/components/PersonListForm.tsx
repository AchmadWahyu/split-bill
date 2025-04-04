import { useFieldArray, useForm } from 'react-hook-form';

export type Person = {
  name: string;
};

type PersonListFormValues = {
  personList: Person[];
};

const PersonListForm = ({
  personList,
  handlePersonList,
}: {
  personList: Person[];
  handlePersonList: (newPersonList: Person[]) => void;
}) => {
  const { register, handleSubmit, control } = useForm<PersonListFormValues>({
    defaultValues: {
      personList,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'personList',
  });

  return (
    <>
      {/* List Anggota */}
      <form
        onSubmit={handleSubmit((data) => {
          handlePersonList(data.personList);
        })}
      >
        <h2>Anggota</h2>

        {fields.map((field, index) => (
          <div key={field.id}>
            <input
              {...register(`personList.${index}.name` as const)}
              defaultValue={field.name}
            />

            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)}>
                Hapus
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={() => append({ name: '' })}>
          Tambah
        </button>

        <button type="submit">Simpan</button>
      </form>

      <hr />

      {/* Transaksi */}
    </>
  );
};

export default PersonListForm;
