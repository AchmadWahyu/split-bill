import { BrowserRouter, Route, Routes } from 'react-router';
import Home from './routes/Home';
import EventForm from './routes/EventForm/EventForm';
import PersonListForm from './routes/PersonListForm/PersonListForm';
import ExpenseListForm from './routes/ExpenseListForm/ExpenseListForm';
import { useState } from 'react';
import { eventDefaultValues } from './routes/EventForm/defaultValues';
import { EventType } from './routes/EventForm/types';
import EventDetailView from './routes/EventDetailView';
import EventFormLayout from './routes/EventFormLayout';

function App() {
  const [eventList, setEventList] = useState([eventDefaultValues]);

  const handleUpdateEventById = (newData: EventType) => {
    const eventAlreadyCreated = eventList?.find(
      (event) => event.id === newData.id
    );

    if (eventAlreadyCreated) {
      const updatedEventList = eventList.map((event) =>
        event.id === newData.id ? { ...event, ...newData } : event
      );

      setEventList(updatedEventList);
    } else {
      setEventList((prev) => [...prev, newData]);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home eventList={eventList} />} />
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
