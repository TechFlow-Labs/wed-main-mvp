import { useEffect, useState } from 'react';
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
import { X } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { createAcceptedReservation, type ReservationAcceptedCreate } from '../lib/reservationsApi';
import { localCalendarDateToEventIso } from '../lib/dateUtils';

type AddReservationModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: Date;
};

export function AddReservationModal({
  visible,
  onClose,
  onSuccess,
  selectedDate,
}: AddReservationModalProps) {
  const { token } = useAuth();
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [details, setDetails] = useState('');
  const [interestedDates, setInterestedDates] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [eventType, setEventType] = useState('');
  const [otherComments, setOtherComments] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setGuestFirstName('');
    setGuestLastName('');
    setGuestEmail('');
    setGuestPhone('');
    setDetails('');
    setInterestedDates('');
    setGuestCount('');
    setEventType('');
    setOtherComments('');
    setBudget('');
    setError(null);
  }, [visible, selectedDate]);

  const handleSubmit = async () => {
    setError(null);
    if (!token) {
      setError('Δεν βρέθηκε συνεδρία. Συνδεθείτε ξανά.');
      return;
    }
    if (!guestFirstName.trim() || !guestLastName.trim() || !guestEmail.trim()) {
      setError('Συμπληρώστε όνομα, επώνυμο και email.');
      return;
    }

    let budgetVal: number | string | null = null;
    if (budget.trim()) {
      const n = Number(budget.trim().replace(',', '.'));
      budgetVal = Number.isFinite(n) ? n : budget.trim();
    }

    let guestCountVal: number | null = null;
    if (guestCount.trim()) {
      const n = parseInt(guestCount.trim(), 10);
      if (!Number.isFinite(n) || n < 0) {
        setError('Μη έγκυρος αριθμός προσκεκλημένων.');
        return;
      }
      guestCountVal = n;
    }

    const payload: ReservationAcceptedCreate = {
      guest_first_name: guestFirstName.trim(),
      guest_last_name: guestLastName.trim(),
      guest_email: guestEmail.trim(),
      guest_phone: guestPhone.trim() || null,
      event_date: localCalendarDateToEventIso(selectedDate),
      details: details.trim() || null,
      budget_per_reservation: budgetVal,
      interested_dates: interestedDates.trim() || null,
      guest_count: guestCountVal,
      event_type: eventType.trim() || null,
      other_comments: otherComments.trim() || null,
    };

    setSubmitting(true);
    try {
      await createAcceptedReservation(token.access_token, token.token_type, payload);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputOutline =
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' as const, outlineWidth: 0, boxShadow: 'none' as const } as const)
      : undefined;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50 modal-form">
        <Pressable className="absolute inset-0" onPress={onClose} disabled={submitting} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="w-full max-h-[92%]"
        >
          <View className="bg-wed-bg rounded-t-3xl border border-wed-accent-light/60 overflow-hidden">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-wed-accent-light/50 bg-white">
              <Text className="text-lg font-semibold text-wed-primary">Νέα κράτηση</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                className="p-2 rounded-full active:bg-gray-100"
                disabled={submitting}
              >
                <X size={22} color="#6b7280" />
              </Pressable>
            </View>

            <ScrollView
              className="px-5 py-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-xs text-gray-500 mb-4 leading-5">
                Η κράτηση αποστέλλεται στο API ως «accepted» (OpenAPI:{' '}
                <Text className="font-mono text-[10px]">POST /reservations/accepted</Text>). Η ημερομηνία
                εκδήλωσης αντιστοιχεί στην επιλεγμένη ημέρα στο ημερολόγιο.
              </Text>

              <View className="gap-4 mb-6">
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Όνομα *</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none"
                    placeholder="Όνομα"
                    placeholderTextColor="#9ca3af"
                    value={guestFirstName}
                    onChangeText={setGuestFirstName}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Επώνυμο *</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none"
                    placeholder="Επώνυμο"
                    placeholderTextColor="#9ca3af"
                    value={guestLastName}
                    onChangeText={setGuestLastName}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Email *</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none"
                    placeholder="email@παράδειγμα.gr"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={guestEmail}
                    onChangeText={setGuestEmail}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Τηλέφωνο</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none"
                    placeholder="Προαιρετικό"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Λεπτομέρειες</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none min-h-[88px]"
                    placeholder="Σημειώσεις για την εκδήλωση"
                    placeholderTextColor="#9ca3af"
                    multiline
                    textAlignVertical="top"
                    value={details}
                    onChangeText={setDetails}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Προτεινόμενες Ημερομηνίες</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none min-h-[72px]"
                    placeholder="Προαιρετικό (π.χ. εναλλακτικές ημερομηνίες)"
                    placeholderTextColor="#9ca3af"
                    multiline
                    textAlignVertical="top"
                    value={interestedDates}
                    onChangeText={setInterestedDates}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Αριθμός προσκεκλημένων</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none"
                    placeholder="Προαιρετικό"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    value={guestCount}
                    onChangeText={setGuestCount}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Τύπος εκδήλωσης</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none"
                    placeholder="Προαιρετικό"
                    placeholderTextColor="#9ca3af"
                    value={eventType}
                    onChangeText={setEventType}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Επιπλέον σχόλια</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none min-h-[72px]"
                    placeholder="Προαιρετικό"
                    placeholderTextColor="#9ca3af"
                    multiline
                    textAlignVertical="top"
                    value={otherComments}
                    onChangeText={setOtherComments}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-600 mb-1.5">Προϋπολογισμός</Text>
                  <TextInput
                    className="border border-wed-accent-light rounded-xl px-4 py-3 bg-white text-wed-primary outline-none"
                    placeholder="Προαιρετικό (αριθμός)"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    value={budget}
                    onChangeText={setBudget}
                    editable={!submitting}
                    style={inputOutline}
                    caretColor="#C28B84"
                  />
                </View>
              </View>

              {error ? (
                <View className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                className={`rounded-2xl py-4 items-center mb-8 ${submitting ? 'bg-gray-400' : 'bg-wed-primary active:opacity-90'}`}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Αποθήκευση κράτησης</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
