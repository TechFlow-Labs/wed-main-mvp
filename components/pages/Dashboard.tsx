import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Calendar } from '../Calendar';
import { ReservationsList } from '../ReservationsList';
import type { WeddingReservation } from '../../lib/database.types';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAllReservations } from '../../lib/reservationsApi';
import type { ReservationsSchema } from '../../lib/reservationTypes';
import {
  apiReservationToWeddingReservation,
  eventDateToYmd,
  isPendingReservationApiStatus
} from '../../lib/reservationMappers';
import { toLocalYmd } from '../../lib/dateUtils';

interface DashboardProps {
  onSelectReservation: (id: string, initialReservation?: WeddingReservation) => void;
}

export function Dashboard({ onSelectReservation }: DashboardProps) {
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [apiReservations, setApiReservations] = useState<ReservationsSchema[]>([]);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadAllReservationsData = useCallback(async () => {
    if (!token) {
      setApiReservations([]);
      setLoading(false);
      return;
    }
    try {
      setLoadError(null);
      setLoading(true);
      const rows = await fetchAllReservations(token.access_token, token.token_type);
      setApiReservations(rows);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης κρατήσεων.');
      setApiReservations([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAllReservationsData();
  }, [loadAllReservationsData]);

  /** Pending (Εκκρεμεί) requests only appear on Αιτήματα Χώρου, not on Κρατήσεις. */
  const dashboardReservations = useMemo(
    () => apiReservations.filter((r) => !isPendingReservationApiStatus(r.status)),
    [apiReservations]
  );

  const reservationCountByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of dashboardReservations) {
      const d = eventDateToYmd(r.event_date);
      if (!d) continue;
      counts[d] = (counts[d] || 0) + 1;
    }
    return counts;
  }, [dashboardReservations]);

  const allReservationDates = useMemo(() => {
    const s = new Set<string>();
    for (const r of dashboardReservations) {
      const d = eventDateToYmd(r.event_date);
      if (d) s.add(d);
    }
    return s;
  }, [dashboardReservations]);

  const reservations = useMemo(() => {
    const dateStr = toLocalYmd(selectedDate);
    return dashboardReservations
      .filter((r) => eventDateToYmd(r.event_date) === dateStr)
      .map(apiReservationToWeddingReservation);
  }, [dashboardReservations, selectedDate]);

  const upcomingFiltered = useMemo(() => {
    const today = toLocalYmd(new Date());
    return dashboardReservations.filter((r) => {
      const d = eventDateToYmd(r.event_date);
      if (!d || d < today) return false;
      const st = (r.status || '').toLowerCase();
      if (st === 'cancelled' || st === 'canceled') return false;
      return true;
    });
  }, [dashboardReservations]);

  const upcomingReservations = useMemo(() => {
    return [...upcomingFiltered]
      .sort((a, b) =>
        (eventDateToYmd(a.event_date) || '').localeCompare(eventDateToYmd(b.event_date) || '')
      )
      .slice(0, 5)
      .map(apiReservationToWeddingReservation);
  }, [upcomingFiltered]);

  const todayStr = toLocalYmd(new Date());
  const monthCount = Object.entries(reservationCountByDate)
    .filter(([d]) => {
      const [y, m] = d.split('-').map(Number);
      return y === displayMonth.getFullYear() && m === displayMonth.getMonth() + 1;
    })
    .reduce((a, [, c]) => a + c, 0);

  return (
    <ScrollView className="flex-1 bg-wed-bg">
      <View className="w-full px-4 py-8">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Κρατήσεις Γάμων</Text>
          <Text className="text-gray-600">Διαχειριστείτε και παρακολουθήστε τις κρατήσεις γάμων σας</Text>
        </View>

        {loadError ? (
          <View className="mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <Text className="text-sm text-red-800">{loadError}</Text>
          </View>
        ) : null}

        <View className="gap-6">
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[100px] bg-white rounded-lg shadow p-4 border-l-4 border-wed-primary">
              <Text className="text-sm font-medium text-gray-500">Κρατήσεις σήμερα</Text>
              <Text className="text-2xl font-bold text-gray-900">{reservationCountByDate[todayStr] || 0}</Text>
            </View>
            <View className="flex-1 min-w-[100px] bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
              <Text className="text-sm font-medium text-gray-500">Αυτόν τον μήνα</Text>
              <Text className="text-2xl font-bold text-gray-900">{monthCount}</Text>
            </View>
            <View className="flex-1 min-w-[100px] bg-white rounded-lg shadow p-4 border-l-4 border-amber-600">
              <Text className="text-sm font-medium text-gray-500">Επερχόμενες</Text>
              <Text className="text-2xl font-bold text-gray-900">{upcomingFiltered.length}</Text>
            </View>
          </View>

          <View className="gap-6 flex-col lg:flex-row lg:items-stretch">
            <View className="flex-1 min-w-0 gap-6">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                reservationDates={allReservationDates}
                reservationCountByDate={reservationCountByDate}
                onMonthChange={setDisplayMonth}
              />
            </View>

            <View className="flex-1 min-w-0 flex flex-col gap-6 min-h-0">
              {upcomingReservations.length > 0 && (
                <View className="bg-white rounded-lg shadow p-4">
                  <View className="flex-row items-center gap-2 mb-3">
                    <CalendarIcon size={16} color="#2d2d2d" />
                    <Text className="text-sm font-semibold text-gray-800">Επερχόμενες κρατήσεις</Text>
                  </View>
                  <View className="gap-2">
                    {upcomingReservations.map((r) => (
                      <Pressable
                        key={r.id}
                        onPress={() => onSelectReservation(r.id, r)}
                        className="p-3 rounded-lg border border-gray-100 active:bg-gray-50"
                      >
                        <View className="flex-row justify-between items-center">
                          <Text className="font-medium text-gray-900" numberOfLines={1}>
                            {r.client_name}
                          </Text>
                          <ChevronRight size={16} color="#9ca3af" />
                        </View>
                        <Text className="text-xs text-gray-500 mt-1">
                          {new Date(r.wedding_date + 'T00:00:00').toLocaleDateString('el-GR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                          {' · '}
                          {r.venue}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {loading ? (
                <View className="bg-white rounded-lg shadow p-6 flex-1 min-h-[280px] lg:min-h-0 justify-center items-center">
                  <ActivityIndicator size="large" color="#2d2d2d" />
                  <Text className="text-gray-600 mt-4">Φόρτωση κρατήσεων...</Text>
                </View>
              ) : (
                <ReservationsList
                  reservations={reservations}
                  selectedDate={selectedDate}
                  onSelectReservation={onSelectReservation}
                  onReservationCreated={() => {
                    void loadAllReservationsData();
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
