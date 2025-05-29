import { ReactNode } from 'react';
import { Toggle } from '@/components/ui/toggle';
import {
  Control,
  Controller,
  FieldPath,
  UseFormClearErrors,
} from 'react-hook-form';
import { ExpenseListFormValues } from '@/routes/ExpenseListForm/ExpenseListForm';

type ToggleWrapperProps = {
  children: ReactNode;
  percentageLabel?: ReactNode;
  amountLabel?: ReactNode;
  fieldLabel?: ReactNode;
  control?: Control<ExpenseListFormValues, unknown, ExpenseListFormValues>;
  controllerName: FieldPath<ExpenseListFormValues>;
  clearErrors?: UseFormClearErrors<ExpenseListFormValues>;
};

export const ToggleWrapper = ({
  children,
  percentageLabel = 'Percentage',
  amountLabel = 'Amount',
  fieldLabel,
  control,
  controllerName,
  clearErrors,
}: ToggleWrapperProps) => (
  <div className="">
    <div className="flex justify-between items-center">
      {fieldLabel}

      <div className="flex gap-2">
        <Controller
          name={controllerName}
          control={control}
          rules={{ required: true }}
          render={({ field }) => {
            const isPercentage = field.value === 'PERCENTAGE';
            return (
              <>
                <Toggle
                  className="hover:cursor-pointer"
                  pressed={isPercentage}
                  onPressedChange={() => {
                    field.onChange('PERCENTAGE');
                    clearErrors?.();
                  }}
                  aria-pressed={isPercentage}
                >
                  {percentageLabel}
                </Toggle>
                <Toggle
                  className="hover:cursor-pointer"
                  pressed={!isPercentage}
                  onPressedChange={() => {
                    field.onChange('AMOUNT');
                    clearErrors?.();
                  }}
                  aria-pressed={!isPercentage}
                >
                  {amountLabel}
                </Toggle>
              </>
            );
          }}
        />
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);
