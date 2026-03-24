import { createContext, use, type BaseSyntheticEvent } from 'react';
import type {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import type { AddExpenseFormValues } from './types';

/**
 * React 19: `use()` reads context (and can unwrap Promises). It replaces `useContext()`
 * for context values and works the same way at runtime, with a slightly more flexible API.
 *
 * We keep the context object in a module-level `createContext` so subcomponents can
 * consume shared form + person state without prop drilling.
 */
export const AddExpenseContext = createContext<AddExpenseContextValue | null>(
  null,
);

export type AddExpenseContextValue = {
  state: {
    personList: string[];
    showPersonDialog: boolean;
    isEditing: boolean;
    liveTotal: number;
    recentNames: string[];
  };
  actions: {
    navigateHome: () => void;
    openAddPersonDialog: () => void;
    closeAddPersonDialog: () => void;
    addPerson: (name: string) => void;
    removePerson: (name: string) => void;
    toggleReceiver: (itemIndex: number, personName: string) => void;
    appendItem: () => void;
    removeItem: (index: number) => void;
  };
  meta: {
    register: UseFormRegister<AddExpenseFormValues>;
    control: Control<AddExpenseFormValues>;
    watch: UseFormWatch<AddExpenseFormValues>;
    errors: FieldErrors<AddExpenseFormValues>;
    fields: FieldArrayWithId<AddExpenseFormValues, 'expense.items', 'id'>[];
    /** Bound react-hook-form submit handler (validation + onSubmit) */
    handleFormSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  };
};

export function useAddExpense() {
  const value = use(AddExpenseContext);
  if (!value) {
    throw new Error('useAddExpense must be used within AddExpenseProvider');
  }
  return value;
}
