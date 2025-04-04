import { useState } from 'react';
import './App.css';
import PersonListForm, { Person } from './components/PersonListForm';

type Transaction = {
  title: string;
  amount: number;
  payer: string;
  receiver: string[];
};

function App() {
  const [personList, setPersonList] = useState<Person[]>([
    {
      name: '',
    },
  ]);

  const handlePersonList = (newPersonList: Person[]) => {
    setPersonList(newPersonList);
  };

  return (
    <PersonListForm
      personList={personList}
      handlePersonList={handlePersonList}
    />
  );
}

export default App;
