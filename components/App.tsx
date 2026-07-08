import { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from './Navbar';
import { HomeDashboard } from './pages/HomeDashboard';
import { Dashboard } from './pages/Dashboard';
import { ReservationDetail } from './pages/ReservationDetail';
import { Profile } from './pages/Profile';
import { EventRequests } from './pages/EventRequests';
import { PartnerExpenses } from './pages/PartnerExpenses';
import { NotesScreen } from './pages/NotesScreen';
import { BudgetScreen } from './pages/BudgetScreen';

import type { WeddingReservation } from '../lib/database.types';

type ViewState =
  | { type: 'home' }
  | { type: 'dashboard' }
  | { type: 'detail'; reservationId: string; initialReservation?: WeddingReservation }
  | { type: 'profile' }
  | { type: 'event-requests' }
  | { type: 'partner-expenses' }
  | { type: 'notes' }
  | { type: 'budget' };

export function App() {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });

  const handleSelectReservation = (reservationId: string, initialReservation?: WeddingReservation) => {
    setCurrentView({ type: 'detail', reservationId, initialReservation });
  };

  const handleBack = () => {
    setCurrentView({ type: 'dashboard' });
  };

  const handleNavigateToProfile = () => {
    setCurrentView({ type: 'profile' });
  };

  const handleNavigateToHome = () => {
    setCurrentView({ type: 'home' });
  };

  const handleNavigateToDashboard = () => {
    setCurrentView({ type: 'dashboard' });
  };

  const handleNavigateToEventRequests = () => {
    setCurrentView({ type: 'event-requests' });
  };

  const handleNavigateToPartnerExpenses = () => {
    setCurrentView({ type: 'partner-expenses' });
  };

  const handleNavigateToNotes = () => {
    setCurrentView({ type: 'notes' });
  };

  const handleNavigateToBudget = () => {
    setCurrentView({ type: 'budget' });
  };

  const showBackToDashboard =
    currentView.type === 'detail' ||
    currentView.type === 'profile' ||
    currentView.type === 'event-requests' ||
    currentView.type === 'partner-expenses' ||
    currentView.type === 'notes' ||
    currentView.type === 'budget';

  return (
    <View className="flex-1 min-h-screen">
      <Navbar
        onNavigateToHome={handleNavigateToHome}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToEventRequests={handleNavigateToEventRequests}
        onNavigateToPartnerExpenses={handleNavigateToPartnerExpenses}
        onNavigateToNotes={handleNavigateToNotes}
        onNavigateToBudget={handleNavigateToBudget}
        onLogout={logout}
        showBackToDashboard={showBackToDashboard}
        currentPage={
          currentView.type === 'detail'
            ? 'detail'
            : currentView.type === 'profile'
            ? 'profile'
            : currentView.type === 'event-requests'
            ? 'event-requests'
            : currentView.type === 'partner-expenses'
            ? 'partner-expenses'
            : currentView.type === 'notes'
            ? 'notes'
            : currentView.type === 'budget'
            ? 'budget'
            : currentView.type === 'home'
            ? 'home'
            : 'dashboard'
        }
      />
      {currentView.type === 'profile' && (
        <Profile onBack={handleNavigateToHome} />
      )}
      {currentView.type === 'event-requests' && (
        <EventRequests onBack={handleNavigateToHome} onCreateReservation={handleSelectReservation} />
      )}
      {currentView.type === 'partner-expenses' && <PartnerExpenses onBack={handleNavigateToHome} />}
      {currentView.type === 'notes' && <NotesScreen onBack={handleNavigateToHome} />}
      {currentView.type === 'budget' && <BudgetScreen onBack={handleNavigateToHome} />}
      {currentView.type === 'detail' && (
        <ReservationDetail
          reservationId={currentView.reservationId}
          initialReservation={currentView.initialReservation}
          onBack={handleBack}
        />
      )}
      {currentView.type === 'home' && (
        <HomeDashboard
          onNavigateToReservations={handleNavigateToDashboard}
          onNavigateToRequests={handleNavigateToEventRequests}
          onNavigateToPartnerExpenses={handleNavigateToPartnerExpenses}
          onNavigateToNotes={handleNavigateToNotes}
        />
      )}
      {currentView.type === 'dashboard' && (
        <Dashboard onSelectReservation={handleSelectReservation} />
      )}
    </View>
  );
}
