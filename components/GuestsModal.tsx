import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Users, X, Mail, Phone, UserPlus } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllGuests,
  createGuest,
  guestsForReservation,
  type GuestDashboard,
} from '../lib/guestsApi';

type GuestsModalProps = {
  visible: boolean;
  onClose: () => void;
  reservationId: string;
  onGuestCountChange?: (count: number) => void;
};

export function GuestsModal({ visible, onClose, reservationId, onGuestCountChange }: GuestsModalProps) {
  const { token } = useAuth();
  const onGuestCountChangeRef = useRef(onGuestCountChange);
  onGuestCountChangeRef.current = onGuestCountChange;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allGuests, setAllGuests] = useState<GuestDashboard[]>([]);
  const [search, setSearch] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!visible || !token) return;
    let cancelled = false;
    setError(null);
    setLoading(true);
    getAllGuests(token.access_token, token.token_type)
      .then((rows) => {
        if (cancelled) return;
        setAllGuests(rows);
        const mine = guestsForReservation(rows, reservationId);
        onGuestCountChangeRef.current?.(mine.length);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Αποτυχία φόρτωσης προσκεκλημένων.');
          setAllGuests([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, reservationId, token]);

  useEffect(() => {
    if (visible) {
      setSearch('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setError(null);
    }
  }, [visible, reservationId]);

  const forThisReservation = useMemo(
    () => guestsForReservation(allGuests, reservationId),
    [allGuests, reservationId]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return forThisReservation;
    return forThisReservation.filter((g) => {
      const name = `${g.first_name} ${g.last_name}`.toLowerCase();
      const em = (g.email || '').toLowerCase();
      return name.includes(q) || em.includes(q);
    });
  }, [forThisReservation, search]);

  const handleAdd = async () => {
    setError(null);
    if (!token) {
      setError('Απαιτείται σύνδεση.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('Συμπληρώστε όνομα και επώνυμο.');
      return;
    }
    setSubmitting(true);
    try {
      const created = await createGuest(token.access_token, token.token_type, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        phone_number: phone.trim() || null,
        reservation_id: reservationId,
      });
      setAllGuests((prev) => {
        const next = [...prev, created];
        const mine = guestsForReservation(next, reservationId);
        onGuestCountChangeRef.current?.(mine.length);
        return next;
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία προσθήκης.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputWeb =
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' as const, outlineWidth: 0, boxShadow: 'none' as const } as const)
      : undefined;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-black/50 justify-end modal-form"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="bg-white rounded-t-2xl max-h-[92%] border border-gray-100">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-200 bg-wed-bg">
            <View className="flex-row items-center gap-2 flex-1">
              <Users size={22} color="#2d2d2d" />
              <View>
                <Text className="text-lg font-semibold text-wed-primary">Προσκεκλημένοι</Text>
                <Text className="text-xs text-gray-500">
                  {forThisReservation.length}{' '}
                  {forThisReservation.length === 1 ? 'άτομο' : 'άτομα'} σε αυτή την κράτηση
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={12} className="p-2">
              <X size={22} color="#6b7280" />
            </Pressable>
          </View>

          <View className="px-4 py-3 border-b border-gray-100">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Αναζήτηση ονόματος ή email…"
              placeholderTextColor="#9ca3af"
              className="w-full px-3 py-2.5 border border-wed-accent-light rounded-xl bg-white text-gray-900 outline-none"
              style={inputWeb}
              caretColor="#C28B84"
            />
          </View>

          {loading ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#2d2d2d" />
              <Text className="text-gray-500 mt-3">Φόρτωση…</Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1 min-h-[200px] max-h-[45%] px-4"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {error ? (
                <View className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              ) : null}
              {filtered.length === 0 ? (
                <View className="items-center py-10">
                  <Text className="text-gray-500 text-center px-2">
                    {forThisReservation.length === 0
                      ? 'Δεν υπάρχουν προσκεκλημένοι για αυτή την κράτηση.'
                      : 'Κανένα αποτέλεσμα αναζήτησης.'}
                  </Text>
                </View>
              ) : (
                filtered.map((g) => (
                  <View key={g.id} className="py-3 border-b border-gray-100">
                    <Text className="font-semibold text-gray-900">
                      {g.first_name} {g.last_name}
                    </Text>
                    {g.email ? (
                      <View className="flex-row items-center gap-2 mt-1">
                        <Mail size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600">{g.email}</Text>
                      </View>
                    ) : null}
                    {g.phone_number ? (
                      <View className="flex-row items-center gap-2 mt-0.5">
                        <Phone size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600">{g.phone_number}</Text>
                      </View>
                    ) : null}
                  </View>
                ))
              )}
            </ScrollView>
          )}

          <View className="border-t border-wed-accent-light bg-gray-50 px-4 py-4 gap-3">
            <View className="flex-row items-center gap-2 mb-1">
              <UserPlus size={18} color="#C28B84" />
              <Text className="text-sm font-semibold text-gray-800">Νέος προσκεκλημένος</Text>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2">
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Όνομα *"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                  style={inputWeb}
                  editable={!submitting}
                  caretColor="#C28B84"
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Επώνυμο *"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                  style={inputWeb}
                  editable={!submitting}
                  caretColor="#C28B84"
                />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                style={inputWeb}
                editable={!submitting}
                caretColor="#C28B84"
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Τηλέφωνο"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                style={inputWeb}
                editable={!submitting}
                caretColor="#C28B84"
              />
            </View>
            <Pressable
              onPress={handleAdd}
              disabled={submitting || loading}
              className={`rounded-xl py-3.5 items-center ${submitting || loading ? 'bg-gray-400' : 'bg-wed-primary active:opacity-90'}`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Προσθήκη προσκεκλημένου</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
