import { useState } from 'react';
import './App.css';
import PersonListForm, { Person } from './components/PersonListForm';
import TransactionListForm, {
  Transaction,
} from './components/TransactionListForm';
import Results from './components/Results';

function App() {
  const [personList, setPersonList] = useState<Person[]>([
    {
      name: 'Joko',
    },
  ]);

  const handlePersonList = (newPersonList: Person[]) => {
    setPersonList(newPersonList);
  };

  const [transactionList, setTransactionList] = useState([
    {
      title: '',
      priceBeforeTax: 0,
      priceAfterTax: 0,
      tax: 0,
      payer: personList[0],
      receiver: [''],
    },
  ]);

  const handleTransactionList = (newTransactionList: Transaction[]) => {
    setTransactionList(newTransactionList);
  };

  return (
    <>
      <PersonListForm
        personList={personList}
        handlePersonList={handlePersonList}
      />

      <hr />

      <TransactionListForm
        personList={personList}
        transactionList={transactionList}
        handleTransactionList={handleTransactionList}
      />

      <hr />

      <Results personList={personList} transactionList={transactionList} />
    </>
  );
}

export default App;
