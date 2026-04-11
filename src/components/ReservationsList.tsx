import { Calendar as CalendarIcon, Users, Mail, Phone, MapPin } from 'lucide-react';
import type { WeddingReservation } from '../lib/database.types';

interface ReservationsListProps {
  reservations: WeddingReservation[];
  selectedDate: Date;
  onSelectReservation: (id: string) => void;
}

export function ReservationsList({ reservations, selectedDate, onSelectReservation }: ReservationsListProps) {
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-wed-accent-lighter text-wed-primary border-wed-accent-light';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Κρατήσεις
        </h2>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          {formatDate(selectedDate)}
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Δεν υπάρχουν κρατήσεις για αυτή την ημερομηνία</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <button
              key={reservation.id}
              onClick={() => onSelectReservation(reservation.id)}
              className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {reservation.client_name}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusColor(reservation.status)}`}>
                    {getStatusLabel(reservation.status)}
                  </span>
                </div>
                {reservation.budget > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${reservation.budget.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{reservation.venue}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{reservation.guest_count} προσκεκλημένοι</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{reservation.contact_email}</span>
                </div>
                {reservation.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{reservation.contact_phone}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
