import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Calendar as CalendarIcon, Users, Mail, Phone, MapPin, Plus } from 'lucide-react-native';
import type { WeddingReservation } from '../lib/database.types';
import { AddReservationModal } from './AddReservationModal';

interface ReservationsListProps {
  reservations: WeddingReservation[];
  selectedDate: Date;
  onSelectReservation: (id: string, initialReservation?: WeddingReservation) => void;
  onReservationCreated?: () => void;
}

export function ReservationsList({
  reservations,
  selectedDate,
  onSelectReservation,
  onReservationCreated,
}: ReservationsListProps) {
  const [addOpen, setAddOpen] = useState(false);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('el-GR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Επιβεβαιωμένη',
      pending: 'Εκκρεμεί',
      completed: 'Ολοκληρωμένη',
      cancelled: 'Ακυρωμένη'
    };
    return labels[status] ?? status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100';
      case 'pending':
        return 'bg-yellow-100';
      case 'completed':
        return 'bg-wed-accent-lighter';
      case 'cancelled':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <View className="bg-white rounded-lg shadow p-6 flex-1 min-h-[280px] lg:min-h-0 flex-col">
      <View className="mb-4">
        <Text className="text-xl font-semibold text-gray-800 mb-2">Κρατήσεις</Text>
        <View className="flex-row items-center gap-2">
          <CalendarIcon size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600">{formatDate(selectedDate)}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 min-h-0"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          reservations.length === 0
            ? { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 }
            : undefined
        }
      >
        {reservations.length === 0 ? (
          <View className="items-center justify-center px-2">
            <CalendarIcon size={48} color="#d1d5db" className="mb-3" />
            <Text className="text-gray-500 text-center">
              Δεν υπάρχουν κρατήσεις για αυτή την ημερομηνία
            </Text>
          </View>
        ) : (
          <View className="gap-4">
            {reservations.map((reservation) => (
            <Pressable
              key={reservation.id}
              onPress={() => onSelectReservation(reservation.id, reservation)}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 active:bg-gray-100"
            >
              <View className="flex-row justify-between mb-3">
                <View>
                  <Text className="font-semibold text-gray-900 mb-1">{reservation.client_name}</Text>
                  <View className={`self-start px-2 py-1 rounded border ${getStatusColor(reservation.status)}`}>
                    <Text className="text-xs font-medium">{getStatusLabel(reservation.status)}</Text>
                  </View>
                </View>
                {reservation.budget > 0 && (
                  <View>
                    <Text className="text-sm font-semibold text-gray-900">
                      ${reservation.budget.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <MapPin size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600">{reservation.venue}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Users size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600">{reservation.guest_count} προσκεκλημένοι</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Mail size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600">{reservation.contact_email}</Text>
                </View>
                {reservation.contact_phone && (
                  <View className="flex-row items-center gap-2">
                    <Phone size={16} color="#6b7280" />
                    <Text className="text-sm text-gray-600">{reservation.contact_phone}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setAddOpen(true)}
        className="mt-4 flex-row items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-wed-primary active:opacity-90"
      >
        <Plus size={20} color="#ffffff" />
        <Text className="text-white font-semibold text-base">Προσθήκη κράτησης</Text>
      </Pressable>

      <AddReservationModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => onReservationCreated?.()}
        selectedDate={selectedDate}
      />
    </View>
  );
}
