import { BrowserRouter, Route, Routes } from 'react-router';
import Home from './routes/Home';
import EventForm from './routes/EventForm/EventForm';
import PersonListForm from './routes/PersonListForm/PersonListForm';
import ExpenseListForm from './routes/ExpenseListForm/ExpenseListForm';
import { useState } from 'react';
import { EventType } from './routes/EventForm/types';
import EventDetailView from './routes/EventDetailView/EventDetailView';
import EventFormLayout from './routes/EventFormLayout';
import { normalizeEventListData } from './utils/normalizer';

function App() {
  const eventListValueFromLocalStorage = localStorage.getItem('eventList');
  const normalizedEventListValueFromLocalStorage = normalizeEventListData(
    eventListValueFromLocalStorage
  );

  const [eventList, setEventList] = useState(
    normalizedEventListValueFromLocalStorage
  );

  const handleUpdateEventById = (newData: EventType) => {
    const eventAlreadyCreated = eventList?.find(
      (event) => event.id === newData.id
    );

    if (eventAlreadyCreated) {
      const updatedEventList = eventList.map((event) =>
        event.id === newData.id ? { ...event, ...newData } : event
      );

      setEventList(updatedEventList);
      localStorage.setItem('eventList', JSON.stringify(updatedEventList));
    } else {
      const updatedEventList = [...eventList, newData];

      setEventList(updatedEventList);
      localStorage.setItem('eventList', JSON.stringify(updatedEventList));
    }
  };

  const handleDeleteEventById = (id: string) => {
    const updatedEventList = eventList.filter((event) => event.id !== id);

    setEventList(updatedEventList);
    localStorage.setItem('eventList', JSON.stringify(updatedEventList));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              eventList={eventList}
              handleDeleteEventById={handleDeleteEventById}
            />
          }
        />
        <Route path="acara">
          <Route
            path=":eventId"
            element={<EventDetailView eventList={eventList} />}
          />
          <Route
            path=":eventId/edit"
            element={<EventFormLayout eventList={eventList} />}
          >
            <Route path="general" element={<EventForm />} />
            <Route path="anggota" element={<PersonListForm />} />
            <Route
              path="transaksi"
              element={
                <ExpenseListForm
                  handleUpdateEventById={handleUpdateEventById}
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
