import { Route, Routes } from 'react-router';
import Home from './routes/Home';
import AddExpensePage from './routes/AddExpensePage';
import EventResultPage from './routes/EventResultPage';
import FeedbackPage from './routes/FeedbackPage';
import ScanReceiptPage from './routes/ScanReceiptPage';
import { useState } from 'react';
import { EventType } from './types';
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
      <Route path="feedback" element={<FeedbackPage />} />
      <Route path="acara">
        <Route
          path=":eventId"
          element={
            <EventResultPage
              eventList={eventList}
              handleUpdateEventById={handleUpdateEventById}
            />
          }
        />
        <Route
          path=":eventId/edit"
          element={
            <AddExpensePage
              eventList={eventList}
              handleUpdateEventById={handleUpdateEventById}
            />
          }
        />
        <Route path=":eventId/scan" element={<ScanReceiptPage />} />
      </Route>
    </Routes>
  );
}

export default App;
