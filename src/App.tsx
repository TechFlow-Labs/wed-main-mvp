import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ReservationDetail } from './pages/ReservationDetail';
import { Profile } from './pages/Profile';
import { EventRequests } from './pages/EventRequests';
import { GiftLists } from './pages/GiftLists';

type View =
  | { type: 'dashboard' }
  | { type: 'detail'; reservationId: string }
  | { type: 'profile' }
  | { type: 'event-requests' }
  | { type: 'gift-lists' };

function App() {
  const [currentView, setCurrentView] = useState<View>({ type: 'dashboard' });

  const handleSelectReservation = (reservationId: string) => {
    setCurrentView({ type: 'detail', reservationId });
  };

  const handleBack = () => {
    setCurrentView({ type: 'dashboard' });
  };

  const handleNavigateToProfile = () => {
    setCurrentView({ type: 'profile' });
  };

  const handleNavigateToDashboard = () => {
    setCurrentView({ type: 'dashboard' });
  };

  const handleNavigateToEventRequests = () => {
    setCurrentView({ type: 'event-requests' });
  };

  const handleNavigateToGiftLists = () => {
    setCurrentView({ type: 'gift-lists' });
  };

  const showBackToDashboard =
    currentView.type === 'detail' ||
    currentView.type === 'profile' ||
    currentView.type === 'event-requests' ||
    currentView.type === 'gift-lists';

  return (
    <div className="min-h-screen">
      <Navbar
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToEventRequests={handleNavigateToEventRequests}
        onNavigateToGiftLists={handleNavigateToGiftLists}
        showBackToDashboard={showBackToDashboard}
        currentPage={
          currentView.type === 'detail'
            ? 'detail'
            : currentView.type === 'profile'
            ? 'profile'
            : currentView.type === 'event-requests'
            ? 'event-requests'
            : currentView.type === 'gift-lists'
            ? 'gift-lists'
            : 'dashboard'
        }
      />
      {currentView.type === 'profile' && (
        <Profile onBack={handleNavigateToDashboard} />
      )}
      {currentView.type === 'event-requests' && (
        <EventRequests onBack={handleNavigateToDashboard} onCreateReservation={handleSelectReservation} />
      )}
      {currentView.type === 'gift-lists' && (
        <GiftLists onBack={handleNavigateToDashboard} />
      )}
      {currentView.type === 'detail' && (
        <ReservationDetail
          reservationId={currentView.reservationId}
          onBack={handleBack}
        />
      )}
      {currentView.type === 'dashboard' && (
        <Dashboard onSelectReservation={handleSelectReservation} />
      )}
    </div>
  );
}

export default App;
