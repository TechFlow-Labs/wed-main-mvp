import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Image,
  Linking,
  Platform,
  TextInput
} from 'react-native';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Users,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Package,
  FileText,
  Clock,
  PieChart,
  X,
  Pencil,
  UserPlus,
  CalendarPlus,
  Download
} from 'lucide-react-native';
import type { WeddingReservation } from '../../lib/weddingReservationTypes';
import { GuestsModal } from '../GuestsModal';
import { useAuth } from '../../contexts/AuthContext';
import { getReservationById, patchReservation } from '../../lib/reservationsApi';
import { apiReservationToWeddingReservation } from '../../lib/reservationMappers';

type EditStatusUi = 'pending' | 'confirmed' | 'completed' | 'cancelled';

function mapReservationStatusToUi(status: string): EditStatusUi {
  const t = status.toLowerCase();
  if (t === 'cancelled' || t === 'canceled') return 'cancelled';
  if (t === 'completed' || t === 'complete') return 'completed';
  if (t === 'confirmed' || t === 'accepted') return 'confirmed';
  return 'pending';
}

/** Values that `patchReservation` + `normalizeStatusForApiPatch` accept */
function uiStatusToApiPatch(status: EditStatusUi): string {
  if (status === 'cancelled') return 'rejected';
  return status;
}

function ymdToIsoDateTime(ymd: string): string | null {
  const t = ymd.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  return new Date(`${t}T12:00:00`).toISOString();
}

const STATUS_OPTIONS: { value: EditStatusUi; label: string }[] = [
  { value: 'pending', label: 'Εκκρεμεί' },
  { value: 'confirmed', label: 'Επιβεβαιωμένη' },
  { value: 'completed', label: 'Ολοκληρωμένη' },
  { value: 'cancelled', label: 'Ακυρωμένη' },
];

interface ReservationDetailProps {
  reservationId: string;
  /** When set (e.g. from API list), skips API fetch for this id */
  initialReservation?: WeddingReservation | null;
  onBack: () => void;
}

const MOCK_BUDGET_BREAKDOWN = [
  { category: 'Χώρος & Δεξιώσεις', amount: 0.35 },
  { category: 'Φωτογραφία & Βίντεο', amount: 0.22 },
  { category: 'Καταλύματα', amount: 0.18 },
  { category: 'Λουλούδια & Διακόσμηση', amount: 0.12 },
  { category: 'Μουσική & DJ', amount: 0.08 },
  { category: 'Τροφή & Ποτά', amount: 0.05 }
];

export function ReservationDetail({ reservationId, initialReservation, onBack }: ReservationDetailProps) {
  const { token } = useAuth();
  const [reservation, setReservation] = useState<WeddingReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetAnalysis, setShowBudgetAnalysis] = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [showEditReservationModal, setShowEditReservationModal] = useState(false);
  const [editStatus, setEditStatus] = useState<EditStatusUi>('pending');
  const [editEventYmd, setEditEventYmd] = useState('');
  const [editDetails, setEditDetails] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReservation?.id === reservationId) {
      setReservation(initialReservation);
      setLoading(false);
      return;
    }
    loadReservation();
  }, [reservationId, initialReservation, token]);

  useEffect(() => {
    if (!showEditReservationModal || !reservation) return;
    setEditStatus(mapReservationStatusToUi(reservation.status));
    setEditEventYmd(reservation.wedding_date);
    setEditDetails(reservation.notes || '');
    setEditBudget(reservation.budget > 0 ? String(reservation.budget) : '');
    setEditError(null);
  }, [showEditReservationModal, reservation]);

  const handleSaveReservationEdit = async () => {
    if (!reservation || !token) {
      setEditError('Απαιτείται σύνδεση για αποθήκευση.');
      return;
    }
    const eventIso = ymdToIsoDateTime(editEventYmd);
    if (!eventIso) {
      setEditError('Η ημερομηνία πρέπει να είναι σε μορφή ΕΕΕΕ-ΜΜ-ΗΗ (π.χ. 2026-03-31).');
      return;
    }
    let budgetPayload: number | string | null = null;
    const trimmedBudget = editBudget.trim();
    if (trimmedBudget) {
      const n = parseFloat(trimmedBudget.replace(',', '.'));
      if (!Number.isFinite(n)) {
        setEditError('Μη έγκυρο ποσό προϋπολογισμού.');
        return;
      }
      budgetPayload = n;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const updated = await patchReservation(token.access_token, token.token_type, reservation.id, {
        status: uiStatusToApiPatch(editStatus),
        event_date: eventIso,
        details: editDetails.trim() ? editDetails.trim() : null,
        budget_per_reservation: budgetPayload,
      });
      setReservation(apiReservationToWeddingReservation(updated));
      setShowEditReservationModal(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης');
    } finally {
      setEditSaving(false);
    }
  };

  const loadReservation = async () => {
    if (!token) {
      setReservation(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const api = await getReservationById(token.access_token, token.token_type, reservationId);
      setReservation(api ? apiReservationToWeddingReservation(api) : null);
    } catch (err) {
      console.error(err);
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('el-GR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('el-GR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100';
      case 'pending': return 'bg-yellow-100';
      case 'completed': return 'bg-wed-accent-lighter';
      case 'cancelled': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { confirmed: 'Επιβεβαιωμένη', pending: 'Εκκρεμεί', completed: 'Ολοκληρωμένη', cancelled: 'Ακυρωμένη' };
    return labels[status] ?? status;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-wed-bg justify-center items-center">
        <ActivityIndicator size="large" color="#2d2d2d" />
        <Text className="text-gray-600 mt-4">Φόρτωση λεπτομερειών κράτησης...</Text>
      </View>
    );
  }

  if (!reservation) {
    return (
      <View className="flex-1 bg-wed-bg justify-center items-center">
        <Text className="text-gray-600 mb-4">Δεν βρέθηκε η κράτηση</Text>
        <Pressable onPress={onBack} className="px-4 py-2 bg-wed-primary rounded-lg">
          <Text className="text-white font-medium">Πίσω</Text>
        </Pressable>
      </View>
    );
  }

  const tables = ['Τράπεζα 1', 'Τράπεζα 2', 'Τράπεζα 3', 'Τράπεζα 4', 'Τράπεζα 5', 'Τράπεζα 6', 'Τράπεζα 7', 'Τράπεζα 8'];

  return (
    <ScrollView className="flex-1 bg-wed-bg" contentContainerClassName="min-h-screen flex flex-col">
      <View className="w-full flex flex-1 flex-col px-4 py-8 min-h-screen">
        <Pressable onPress={onBack} className="flex-row items-center gap-2 mb-6">
          <ArrowLeft size={20} color="#6b7280" />
          <Text className="font-medium text-gray-600">Πίσω στο Πίνακα Ελέγχου</Text>
        </Pressable>

        <View className="bg-white rounded-lg shadow-lg overflow-hidden flex-1 min-h-[calc(100vh-7rem)]">
          <View className="bg-wed-primary px-8 py-6">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-2xl font-bold text-white mb-2">{reservation.client_name}</Text>
                <Text className="text-white/90">Λεπτομέρειες Κράτησης</Text>
              </View>
              <View className={`px-4 py-2 rounded-lg border ${getStatusColor(reservation.status)}`}>
                <Text className="text-sm font-semibold">{getStatusLabel(reservation.status)}</Text>
              </View>
            </View>
          </View>

          <View className="px-6 py-4 border-b border-gray-100">
            <Text className="text-xs font-semibold text-gray-500 uppercase mb-3">Γρήγορες Ενέργειες</Text>
            <View className="flex-row flex-wrap gap-2">
              <Pressable onPress={() => setShowEditReservationModal(true)} className="flex-row items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Pencil size={16} color="#374151" />
                <Text className="text-sm font-medium text-gray-700">Επεξεργασία</Text>
              </Pressable>
              <Pressable onPress={() => setShowGuestsModal(true)} className="flex-row items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <UserPlus size={16} color="#374151" />
                <Text className="text-sm font-medium text-gray-700">Προσκεκλημένοι</Text>
              </Pressable>
              <Pressable
                onPress={() => Linking.openURL(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Γάμος - ${encodeURIComponent(reservation.client_name)}&dates=${reservation.wedding_date.replace(/-/g, '')}T100000/${reservation.wedding_date.replace(/-/g, '')}T230000&location=${encodeURIComponent(reservation.venue)}`)}
                className="flex-row items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
              >
                <CalendarPlus size={16} color="#374151" />
                <Text className="text-sm font-medium text-gray-700">Ημερολόγιο</Text>
              </Pressable>
              <Pressable onPress={() => Linking.openURL(`mailto:${reservation.contact_email}`)} className="flex-row items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Mail size={16} color="#374151" />
                <Text className="text-sm font-medium text-gray-700">Email</Text>
              </Pressable>
              {Platform.OS === 'web' && (
                <Pressable onPress={() => (typeof window !== 'undefined' && window.print())} className="flex-row items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Download size={16} color="#374151" />
                  <Text className="text-sm font-medium text-gray-700">Εκτύπωση</Text>
                </Pressable>
              )}
            </View>
          </View>

          <View className="px-6 py-6 gap-6">
            <View className="flex-row flex-wrap gap-6">
              <View className="flex-1 min-w-[200px] gap-4">
                <View className="flex-row gap-3">
                  <View className="p-2 bg-wed-accent-lighter rounded-lg">
                    <CalendarIcon size={20} color="#C28B84" />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">Ημερομηνία Γάμου</Text>
                    <Text className="font-semibold text-gray-900">{formatDate(reservation.wedding_date)}</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <View className="p-2 bg-wed-accent-lighter rounded-lg">
                    <MapPin size={20} color="#C28B84" />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">Τόπος</Text>
                    <Text className="font-semibold text-gray-900">{reservation.venue}</Text>
                  </View>
                </View>
                <Pressable onPress={() => setShowGuestsModal(true)} className="flex-row gap-3">
                  <View className="p-2 bg-wed-accent-lighter rounded-lg">
                    <Users size={20} color="#C28B84" />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">Προσκεκλημένοι</Text>
                    <Text className="font-semibold text-gray-900">{reservation.guest_count}</Text>
                  </View>
                </Pressable>
                {reservation.package_type && (
                  <View className="flex-row gap-3">
                    <View className="p-2 bg-wed-accent-lighter rounded-lg">
                      <Package size={20} color="#C28B84" />
                    </View>
                    <View>
                      <Text className="text-sm text-gray-500">Πακέτο</Text>
                      <Text className="font-semibold text-gray-900">{reservation.package_type}</Text>
                    </View>
                  </View>
                )}
              </View>
              <View className="flex-1 min-w-[200px] gap-4">
                <View className="flex-row gap-3">
                  <View className="p-2 bg-wed-accent-lighter rounded-lg">
                    <Mail size={20} color="#C28B84" />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">Email</Text>
                    <Text className="font-semibold text-gray-900 break-all">{reservation.contact_email}</Text>
                  </View>
                </View>
                {reservation.contact_phone && (
                  <View className="flex-row gap-3">
                    <View className="p-2 bg-wed-accent-lighter rounded-lg">
                      <Phone size={20} color="#C28B84" />
                    </View>
                    <View>
                      <Text className="text-sm text-gray-500">Τηλέφωνο</Text>
                      <Text className="font-semibold text-gray-900">{reservation.contact_phone}</Text>
                    </View>
                  </View>
                )}
                {reservation.budget > 0 && (
                  <Pressable onPress={() => setShowBudgetAnalysis(true)} className="flex-row gap-3">
                    <View className="p-2 bg-wed-accent-lighter rounded-lg">
                      <DollarSign size={20} color="#C28B84" />
                    </View>
                    <View>
                      <Text className="text-sm text-gray-500">Προϋπολογισμός</Text>
                      <Text className="font-semibold text-gray-900">${reservation.budget.toLocaleString()}</Text>
                    </View>
                  </Pressable>
                )}
                <View className="flex-row gap-3">
                  <View className="p-2 bg-wed-accent-lighter rounded-lg">
                    <Clock size={20} color="#C28B84" />
                  </View>
                  <View>
                    <Text className="text-sm text-gray-500">Δημιουργήθηκε</Text>
                    <Text className="font-semibold text-gray-900">{formatDateTime(reservation.created_at)}</Text>
                  </View>
                </View>
              </View>
            </View>
            {reservation.notes && (
              <View className="pt-6 border-t border-gray-200">
                <View className="flex-row gap-3">
                  <View className="p-2 bg-wed-accent-lighter rounded-lg">
                    <FileText size={20} color="#C28B84" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 mb-2">Σημειώσεις</Text>
                    <Text className="text-gray-700">{reservation.notes}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Budget Modal */}
      <Modal visible={showBudgetAnalysis} transparent animationType="fade">
        <Pressable className="flex-1 justify-center bg-black/50 p-4" onPress={() => setShowBudgetAnalysis(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-xl p-6 max-w-lg mx-auto">
            <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <View className="flex-row items-center gap-2">
                <PieChart size={24} color="#2d2d2d" />
                <Text className="text-xl font-semibold">Ανάλυση Προϋπολογισμού</Text>
              </View>
              <Pressable onPress={() => setShowBudgetAnalysis(false)}>
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>
            <Text className="text-sm text-gray-500 mb-1">Συνολικός προϋπολογισμός</Text>
            <Text className="text-2xl font-bold text-gray-900 mb-6">${reservation.budget.toLocaleString()}</Text>
            <View className="gap-4">
              {MOCK_BUDGET_BREAKDOWN.map((item) => {
                const amount = Math.round(reservation.budget * item.amount);
                const percent = Math.round(item.amount * 100);
                return (
                  <View key={item.category} className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="font-medium text-gray-900">{item.category}</Text>
                      <Text className="text-gray-600">${amount.toLocaleString()} ({percent}%)</Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View className="h-full bg-wed-accent rounded-full" style={{ width: `${percent}%` }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <GuestsModal
        visible={showGuestsModal}
        onClose={() => setShowGuestsModal(false)}
        reservationId={reservation.id}
        onGuestCountChange={(count) =>
          setReservation((r) => (r ? { ...r, guest_count: count } : null))
        }
      />

      {/* Edit Modal — PATCH /reservations/{id} (ReservationsUpdateSchema) */}
      <Modal visible={showEditReservationModal} transparent animationType="fade">
        <Pressable className="flex-1 justify-center bg-black/50 p-4" onPress={() => setShowEditReservationModal(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-2xl w-full self-center"
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center gap-2">
                  <Pencil size={24} color="#2d2d2d" />
                  <Text className="text-xl font-semibold">Επεξεργασία Κράτησης</Text>
                </View>
                <Pressable onPress={() => setShowEditReservationModal(false)}>
                  <X size={24} color="#6b7280" />
                </Pressable>
              </View>
              <Text className="text-sm text-gray-500 mb-4">
                Ενημερώστε κατάσταση, ημερομηνία εκδήλωσης, λεπτομέρειες και προϋπολογισμό κράτησης.
              </Text>

              <View className="mb-4 p-3 bg-gray-50 rounded-lg gap-1">
                <Text className="text-xs text-gray-500 uppercase mb-1">Πληροφορίες (μόνο ανάγνωση)</Text>
                <Text className="text-sm text-gray-800">
                  <Text className="font-medium">Ζευγάρι / πελάτης:</Text> {reservation.client_name}
                </Text>
                <Text className="text-sm text-gray-800">
                  <Text className="font-medium">Χώρος:</Text> {reservation.venue}
                </Text>
                <Text className="text-sm text-gray-800">
                  <Text className="font-medium">Email:</Text> {reservation.contact_email}
                </Text>
              </View>

              {!token ? (
                <View className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Text className="text-sm text-amber-900">Συνδεθείτε για να αποθηκεύσετε αλλαγές μέσω API.</Text>
                </View>
              ) : null}

              {editError ? (
                <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Text className="text-sm text-red-800">{editError}</Text>
                </View>
              ) : null}

              <Text className="text-sm font-medium text-gray-700 mb-2">Κατάσταση</Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {STATUS_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => setEditStatus(opt.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      editStatus === opt.value ? 'bg-wed-primary border-wed-primary' : 'bg-white border-gray-300'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${editStatus === opt.value ? 'text-white' : 'text-gray-700'}`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-1">Ημερομηνία εκδήλωσης</Text>
              <Text className="text-xs text-gray-500 mb-2">ΕΕΕΕ-ΜΜ-ΗΗ (π.χ. 2026-03-31)</Text>
              <TextInput
                value={editEventYmd}
                onChangeText={setEditEventYmd}
                placeholder="2026-03-31"
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg mb-4 text-gray-900"
                placeholderTextColor="#9ca3af"
              />

              <Text className="text-sm font-medium text-gray-700 mb-1">Λεπτομέρειες</Text>
              <TextInput
                value={editDetails}
                onChangeText={setEditDetails}
                placeholder="Σημειώσεις, απαιτήσεις κ.λπ."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="w-full min-h-[100px] px-3 py-2.5 border border-gray-300 rounded-lg mb-4 text-gray-900"
                placeholderTextColor="#9ca3af"
              />

              <Text className="text-sm font-medium text-gray-700 mb-1">Προϋπολογισμός κράτησης</Text>
              <TextInput
                value={editBudget}
                onChangeText={setEditBudget}
                placeholder="0"
                keyboardType="decimal-pad"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg mb-6 text-gray-900"
                placeholderTextColor="#9ca3af"
              />

              <View className="flex-row justify-end gap-2 flex-wrap">
                <Pressable
                  onPress={() => setShowEditReservationModal(false)}
                  disabled={editSaving}
                  className="px-4 py-2.5 bg-gray-100 rounded-lg"
                >
                  <Text className="text-sm font-medium text-gray-700">Ακύρωση</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveReservationEdit}
                  disabled={editSaving || !token}
                  className="px-4 py-2.5 bg-wed-primary rounded-lg items-center"
                >
                  {editSaving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-sm font-medium text-white">Αποθήκευση</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
