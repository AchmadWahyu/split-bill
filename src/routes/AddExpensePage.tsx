import { AddExpenseProvider } from './add-expense/AddExpenseProvider';
import { AddExpenseView } from './add-expense/AddExpenseView';
import type { AddExpensePageProps } from './add-expense/types';

export default function AddExpensePage(props: AddExpensePageProps) {
  return (
    <AddExpenseProvider {...props}>
      <AddExpenseView />
    </AddExpenseProvider>
  );
}
