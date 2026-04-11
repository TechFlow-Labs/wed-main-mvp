import { useEffect, useState } from 'react';
import { Calendar } from '../components/Calendar';
import { ReservationsList } from '../components/ReservationsList';
import { supabase } from '../lib/supabase';
import type { WeddingReservation } from '../lib/database.types';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

interface DashboardProps {
  onSelectReservation: (id: string) => void;
}

export function Dashboard({ onSelectReservation }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState<WeddingReservation[]>([]);
  const [allReservationDates, setAllReservationDates] = useState<Set<string>>(new Set());
  const [reservationCountByDate, setReservationCountByDate] = useState<Record<string, number>>({});
  const [upcomingReservations, setUpcomingReservations] = useState<WeddingReservation[]>([]);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await loadReservations();
    })();
  }, [selectedDate]);

  useEffect(() => {
    (async () => {
      await loadAllReservationDates();
    })();
  }, []);

  useEffect(() => {
    loadReservationCountsForMonth(displayMonth);
  }, [displayMonth]);

  useEffect(() => {
    loadUpcomingReservations();
  }, []);

  const loadReservationCountsForMonth = async (date: Date) => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const todayStr = new Date().toISOString().split('T')[0];
    const startStr = monthStart.toISOString().split('T')[0];
    const endStr = monthEnd.toISOString().split('T')[0];
    const rangeStart = startStr < todayStr ? startStr : todayStr;
    const rangeEnd = endStr > todayStr ? endStr : todayStr;

    const { data } = await supabase
      .from('wedding_reservations')
      .select('wedding_date')
      .gte('wedding_date', rangeStart)
      .lte('wedding_date', rangeEnd);

    const counts: Record<string, number> = {};
    (data || []).forEach((r) => {
      counts[r.wedding_date] = (counts[r.wedding_date] || 0) + 1;
    });
    setReservationCountByDate(counts);
  };

  const loadUpcomingReservations = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('wedding_reservations')
      .select('*')
      .gte('wedding_date', today)
      .neq('status', 'cancelled')
      .order('wedding_date', { ascending: true })
      .limit(5);
    setUpcomingReservations(data || []);
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('wedding_reservations')
        .select('*')
        .eq('wedding_date', dateStr)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reservations:', error);
        setReservations([]);
      } else {
        setReservations(data || []);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllReservationDates = async () => {
    try {
      const { data, error } = await supabase
        .from('wedding_reservations')
        .select('wedding_date');

      if (error) {
        console.error('Error loading reservation dates:', error);
        setAllReservationDates(new Set());
      } else {
        const dates = new Set(data?.map(r => r.wedding_date) || []);
        setAllReservationDates(dates);
      }
    } catch (error) {
      console.error('Error loading reservation dates:', error);
      setAllReservationDates(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-wed-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Κρατήσεις Γάμων
          </h1>
          <p className="text-gray-600">
            Διαχειριστείτε και παρακολουθήστε τις κρατήσεις γάμων σας
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-wed-primary">
                <p className="text-sm font-medium text-gray-500">Κρατήσεις σήμερα</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservationCountByDate[new Date().toISOString().split('T')[0]] || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                <p className="text-sm font-medium text-gray-500">Αυτόν τον μήνα</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.entries(reservationCountByDate)
                    .filter(([d]) => {
                      const [y, m] = d.split('-').map(Number);
                      return y === displayMonth.getFullYear() && m === displayMonth.getMonth() + 1;
                    })
                    .reduce((a, [, c]) => a + c, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-600">
                <p className="text-sm font-medium text-gray-500">Επερχόμενες</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingReservations.length}</p>
              </div>
            </div>

            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              reservationDates={allReservationDates}
              reservationCountByDate={reservationCountByDate}
              onMonthChange={setDisplayMonth}
            />
          </div>

          <div className="space-y-6">
            {upcomingReservations.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-wed-primary" />
                  Επερχόμενες κρατήσεις
                </h3>
                <div className="space-y-2">
                  {upcomingReservations.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onSelectReservation(r.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{r.client_name}</p>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-wed-primary shrink-0" />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.wedding_date + 'T00:00:00').toLocaleDateString('el-GR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                        {' · '}
                        {r.venue}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[20rem]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wed-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Φόρτωση κρατήσεων...</p>
                </div>
              </div>
            ) : (
              <ReservationsList
                reservations={reservations}
                selectedDate={selectedDate}
                onSelectReservation={onSelectReservation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
