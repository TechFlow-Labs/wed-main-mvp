import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking
} from 'react-native';
import {
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowLeft,
  Search,
  RefreshCw,
  StickyNote
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingReservations, patchReservation } from '../../lib/reservationsApi';
import type { ReservationsSchema } from '../../lib/reservationTypes';
import { apiReservationToWeddingReservation, eventDateToYmd } from '../../lib/reservationMappers';
import type { WeddingReservation } from '../../lib/weddingReservationTypes';

interface EventRequestsProps {
  onBack: () => void;
  onCreateReservation?: (reservationId: string, initialReservation?: WeddingReservation) => void;
}

const STATUS_LABELS: Record<'pending' | 'accepted' | 'denied', string> = {
  pending: 'Εκκρεμεί',
  accepted: 'Αποδεκτό',
  denied: 'Απορριφθέν'
};

type SortOption = 'newest' | 'oldest' | 'event-date-asc' | 'event-date-desc';

function uiStatus(s: string | null | undefined): 'pending' | 'accepted' | 'denied' {
  const t = (s || '').toLowerCase();
  if (t === 'accepted' || t === 'confirmed') return 'accepted';
  if (t === 'denied' || t === 'rejected' || t === 'declined') return 'denied';
  return 'pending';
}

function displayCoupleName(r: ReservationsSchema): string {
  const couple = [r.couple_first_name, r.couple_last_name].filter(Boolean).join(' ').trim();
  const guest = [r.guest_first_name, r.guest_last_name].filter(Boolean).join(' ').trim();
  return couple || guest || 'Αίτημα κράτησης';
}

function formatEventDateDisplay(iso: string | null | undefined): string {
  const ymd = eventDateToYmd(iso);
  if (!ymd) return '—';
  return new Date(`${ymd}T12:00:00`).toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function sortKeyEvent(iso: string | null | undefined): string {
  return eventDateToYmd(iso) ?? '';
}

export function EventRequests({ onBack, onCreateReservation }: EventRequestsProps) {
  const { token } = useAuth();
  const [requests, setRequests] = useState<ReservationsSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort] = useState<SortOption>('newest');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creatingReservationId, setCreatingReservationId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const loadRequests = useCallback(async () => {
    if (!token) {
      setRequests([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const list = await getPendingReservations(token.access_token, token.token_type);
      setRequests(list.filter((r) => uiStatus(r.status) === 'pending'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleOpenReservationDetail = (r: ReservationsSchema) => {
    if (!onCreateReservation) return;
    setCreatingReservationId(r.id);
    try {
      onCreateReservation(r.id, apiReservationToWeddingReservation(r));
    } finally {
      setCreatingReservationId(null);
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    if (!token) return;
    try {
      const updated = await patchReservation(token.access_token, token.token_type, id, {
        details: notes.trim() ? notes.trim() : null
      });
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης');
    }
    setEditingNotesId(null);
    setNotesDraft('');
  };

  /** PATCH /reservations/{id} — backend expects uppercase status (ACCEPTED | REJECTED). */
  const handleStatusUpdate = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!token) return;
    setUpdatingId(id);
    try {
      await patchReservation(token.access_token, token.token_type, id, { status });
      // This screen is pending-only (OpenAPI GET /reservations/pending),
      // so accepted/denied requests should disappear immediately.
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία ενημέρωσης');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: 'pending' | 'accepted' | 'denied') => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50',
      accepted: 'bg-green-50',
      denied: 'bg-red-50'
    };
    return colors[status] || 'bg-gray-50';
  };

  const filteredRequests = requests
    .filter((r) => uiStatus(r.status) === 'pending')
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const name = displayCoupleName(r).toLowerCase();
      const email = (r.guest_email || '').toLowerCase();
      const details = (r.details || '').toLowerCase();
      return name.includes(q) || email.includes(q) || details.includes(q);
    })
    .sort((a, b) => {
      const ka = sortKeyEvent(a.event_date);
      const kb = sortKeyEvent(b.event_date);
      switch (sort) {
        case 'newest':
          return kb.localeCompare(ka);
        case 'oldest':
          return ka.localeCompare(kb);
        case 'event-date-asc':
          return ka.localeCompare(kb);
        case 'event-date-desc':
          return kb.localeCompare(ka);
        default:
          return 0;
      }
    });

  const stats = {
    pending: requests.filter((r) => uiStatus(r.status) === 'pending').length,
    total: requests.length
  };

  return (
    <ScrollView className="flex-1 bg-wed-bg">
      <View className="w-full px-4 py-8">
        <Pressable onPress={onBack} className="flex-row items-center gap-2 mb-6">
          <ArrowLeft size={20} color="#6b7280" />
          <Text className="font-medium text-gray-600">Πίσω</Text>
        </Pressable>

        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Αιτήματα Χώρου</Text>
          <Text className="text-gray-600">Εκκρεμή αιτήματα από ζευγάρια για χρήση του χώρου σας.</Text>
        </View>

        {error ? (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-sm text-red-800">{error}</Text>
          </View>
        ) : null}

        <View className="flex-row flex-wrap gap-4 mb-6">
          {[
            { label: 'Σύνολο', value: stats.total, border: 'border-wed-primary' },
            { label: 'Εκκρεμεί', value: stats.pending, border: 'border-amber-500' }
          ].map((s) => (
            <View key={s.label} className={`flex-1 min-w-[80px] bg-white rounded-lg shadow p-4 border-l-4 ${s.border}`}>
              <Text className="text-sm font-medium text-gray-500">{s.label}</Text>
              <Text className="text-2xl font-bold text-gray-900">{s.value}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 flex-row items-center px-3 py-2.5 border border-gray-300 rounded-lg bg-white">
            <Search size={20} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Αναζήτηση..."
              className="flex-1 ml-2"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <Pressable onPress={loadRequests} disabled={loading} className="px-4 py-2.5 border border-gray-300 rounded-lg">
            <RefreshCw size={20} color={loading ? '#9ca3af' : '#374151'} />
          </Pressable>
        </View>

        {loading ? (
          <View className="bg-white rounded-lg shadow p-12 items-center">
            <ActivityIndicator size="large" color="#2d2d2d" />
            <Text className="text-gray-600 mt-4">Φόρτωση αιτημάτων...</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View className="bg-white rounded-lg shadow p-12 items-center">
            <FileText size={48} color="#d1d5db" className="mb-3" />
            <Text className="text-gray-500 text-center">
              {search.trim() ? `Δεν βρέθηκαν εκκρεμή αιτήματα για "${search}"` : 'Δεν υπάρχουν εκκρεμή αιτήματα'}
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {filteredRequests.map((request) => {
              const st = uiStatus(request.status);
              const guestCount = Array.isArray(request.guests) ? request.guests.length : 0;

              return (
                <View key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <View className="gap-4">
                    <View>
                      <View className="flex-row flex-wrap items-center gap-2 mb-2">
                        <Text className="text-lg font-semibold text-gray-900">{displayCoupleName(request)}</Text>
                        <View className={`px-2 py-1 rounded-lg ${getStatusBadge(st)}`}>
                          <Text className="text-xs font-medium">{STATUS_LABELS[st]}</Text>
                        </View>
                        {request.business_name ? (
                          <View className="bg-gray-100 px-2 py-0.5 rounded">
                            <Text className="text-xs text-gray-500">{request.business_name}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View className="gap-2">
                        <View className="flex-row items-center gap-2">
                          <CalendarIcon size={16} color="#9ca3af" />
                          <Text className="text-sm text-gray-600">{formatEventDateDisplay(request.event_date)}</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Users size={16} color="#9ca3af" />
                          <Text className="text-sm text-gray-600">{guestCount} προσκεκλημένοι</Text>
                        </View>
                        {request.guest_email ? (
                          <Pressable
                            onPress={() => Linking.openURL(`mailto:${request.guest_email}`)}
                            className="flex-row items-center gap-2"
                          >
                            <Mail size={16} color="#9ca3af" />
                            <Text className="text-sm text-wed-accent">{request.guest_email}</Text>
                          </Pressable>
                        ) : null}
                        {request.guest_phone ? (
                          <Pressable
                            onPress={() => Linking.openURL(`tel:${request.guest_phone}`)}
                            className="flex-row items-center gap-2"
                          >
                            <Phone size={16} color="#9ca3af" />
                            <Text className="text-sm text-wed-accent">{request.guest_phone}</Text>
                          </Pressable>
                        ) : null}
                      </View>
                      <View className="mt-4">
                        <View className="flex-row items-center gap-2 mb-1">
                          <StickyNote size={16} color="#9ca3af" />
                          <Text className="text-sm font-medium text-gray-600">Λεπτομέρειες</Text>
                          {editingNotesId !== request.id ? (
                            <Pressable
                              onPress={() => {
                                setEditingNotesId(request.id);
                                setNotesDraft(request.details || '');
                              }}
                            >
                              <Text className="text-xs text-wed-accent">{request.details ? 'Επεξεργασία' : 'Προσθήκη'}</Text>
                            </Pressable>
                          ) : null}
                        </View>
                        {editingNotesId === request.id ? (
                          <View className="gap-2">
                            <TextInput
                              value={notesDraft}
                              onChangeText={setNotesDraft}
                              placeholder="Λεπτομέρειες κράτησης..."
                              multiline
                              numberOfLines={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                              placeholderTextColor="#9ca3af"
                            />
                            <View className="flex-row gap-2">
                              <Pressable
                                onPress={() => handleSaveNotes(request.id, notesDraft)}
                                className="px-3 py-1.5 bg-wed-primary rounded-lg"
                              >
                                <Text className="text-sm font-medium text-white">Αποθήκευση</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setEditingNotesId(null);
                                  setNotesDraft('');
                                }}
                                className="px-3 py-1.5 bg-gray-100 rounded-lg"
                              >
                                <Text className="text-sm font-medium text-gray-700">Ακύρωση</Text>
                              </Pressable>
                            </View>
                          </View>
                        ) : (
                          <Text className="text-sm text-gray-600">{request.details || '—'}</Text>
                        )}
                      </View>
                    </View>

                    <View className="gap-2">
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                          disabled={updatingId === request.id}
                          className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-green-600 rounded-lg"
                        >
                          <CheckCircle2 size={16} color="white" />
                          <Text className="text-sm font-medium text-white">Αποδοχή</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleStatusUpdate(request.id, 'REJECTED')}
                          disabled={updatingId === request.id}
                          className="flex-1 flex-row items-center justify-center gap-2 py-2 bg-red-600 rounded-lg"
                        >
                          <XCircle size={16} color="white" />
                          <Text className="text-sm font-medium text-white">Απόρριψη</Text>
                        </Pressable>
                      </View>
                      {onCreateReservation ? (
                        <Pressable
                          onPress={() => handleOpenReservationDetail(request)}
                          disabled={creatingReservationId === request.id}
                          className="flex-row items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg"
                        >
                          {creatingReservationId === request.id ? (
                            <>
                              <ActivityIndicator size="small" color="#374151" />
                              <Text className="text-sm font-medium text-gray-700">Άνοιγμα...</Text>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} color="#374151" />
                              <Text className="text-sm font-medium text-gray-700">Άνοιγμα στοιχείων</Text>
                            </>
                          )}
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
