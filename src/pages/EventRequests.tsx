import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  Search,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { fetchAllReservations, patchReservation } from '../lib/reservationsApi';
import type { ReservationsSchema } from '../lib/reservationTypes';

interface EventRequestsProps {
  onBack: () => void;
  onCreateReservation?: (reservationId: string) => void;
  accessToken: string;
  tokenType: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Γάμος',
  baptism: 'Βάπτιση',
  christening: 'Χρίσμα',
  other: 'Άλλο',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Εκκρεμεί',
  accepted: 'Αποδεκτό',
  rejected: 'Απορριφθέν',
};

type SortOption = 'newest' | 'oldest';

function normalizeStatus(status: string | null | undefined): string {
  return (status ?? '').toLowerCase();
}

export function EventRequests({ onBack, accessToken, tokenType }: EventRequestsProps) {
  const [requests, setRequests] = useState<ReservationsSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await fetchAllReservations(accessToken, tokenType);
      setRequests(data);
    } catch (err) {
      console.error('Error loading requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      const updated = await patchReservation(accessToken, tokenType, id, { status });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      );
    } catch (err) {
      console.error('Error updating request:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests
    .filter((r) => filter === 'all' || normalizeStatus(r.status) === filter)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const fullName = `${r.guest_first_name ?? ''} ${r.guest_last_name ?? ''}`.toLowerCase();
      return (
        fullName.includes(q) ||
        (r.guest_email ?? '').toLowerCase().includes(q) ||
        (r.details ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sort === 'oldest' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)
    );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => normalizeStatus(r.status) === 'pending').length,
    accepted: requests.filter((r) => normalizeStatus(r.status) === 'accepted').length,
    rejected: requests.filter((r) => normalizeStatus(r.status) === 'rejected').length,
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const base = 'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border';
    switch (normalizeStatus(status)) {
      case 'pending':
        return `${base} bg-amber-50 text-amber-800 border-amber-200`;
      case 'accepted':
        return `${base} bg-green-50 text-green-800 border-green-200`;
      case 'rejected':
        return `${base} bg-red-50 text-red-800 border-red-200`;
      default:
        return `${base} bg-gray-50 text-gray-800 border-gray-200`;
    }
  };

  return (
    <div className="min-h-screen bg-wed-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Πίσω</span>
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Αιτήματα Κράτησης</h1>
          <p className="text-gray-600">
            Αιτήματα από ζευγάρια για τις υπηρεσίες σας. Αποδεχτείτε ή απορρίψτε κάθε αίτημα.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-wed-primary">
            <p className="text-sm font-medium text-gray-500">Σύνολο</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
            <p className="text-sm font-medium text-gray-500">Εκκρεμεί</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Αποδεκτά</p>
            <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-500">Απορριφθέντα</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Αναζήτηση (όνομα, email, μήνυμα...)"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent bg-white"
              >
                <option value="newest">Νεότερα πρώτα</option>
                <option value="oldest">Παλαιότερα πρώτα</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={loadRequests}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Ανανέωση
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-wed-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f === 'all' ? 'Όλα' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 flex justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wed-primary mx-auto mb-4" />
              <p className="text-gray-600">Φόρτωση αιτημάτων...</p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {search.trim()
                ? `Δεν βρέθηκαν αποτελέσματα για "${search}"`
                : `Δεν υπάρχουν αιτήματα${
                    filter !== 'all' ? ` με κατάσταση "${STATUS_LABELS[filter]}"` : ''
                  }`}
            </p>
            {search.trim() && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-sm text-wed-accent hover:underline"
              >
                Εκκαθάριση αναζήτησης
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const normStatus = normalizeStatus(request.status);
              const fullName = [request.guest_first_name, request.guest_last_name]
                .filter(Boolean)
                .join(' ');
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-lg font-semibold text-gray-900">
                            {fullName || '—'}
                          </h2>
                          <span className={getStatusBadge(request.status)}>
                            {normStatus === 'pending' && <Clock className="w-3.5 h-3.5" />}
                            {normStatus === 'accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {normStatus === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                            {STATUS_LABELS[normStatus] ?? request.status}
                          </span>
                          {request.event_type && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {EVENT_TYPE_LABELS[request.event_type] ?? request.event_type}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          {request.interested_dates && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                              <span>{request.interested_dates}</span>
                            </div>
                          )}
                          {request.guest_count != null && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400 shrink-0" />
                              <span>{request.guest_count} προσκεκλημένοι</span>
                            </div>
                          )}
                          {request.budget_per_reservation != null && (
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 text-gray-400 shrink-0 text-center font-bold text-xs">€</span>
                              <span>
                                Προϋπολογισμός:{' '}
                                {Number(request.budget_per_reservation).toLocaleString('el-GR')} €
                              </span>
                            </div>
                          )}
                          {request.guest_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                              <a
                                href={`mailto:${request.guest_email}`}
                                className="text-wed-accent hover:underline"
                              >
                                {request.guest_email}
                              </a>
                            </div>
                          )}
                          {request.guest_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                              <a
                                href={`tel:${request.guest_phone}`}
                                className="text-wed-accent hover:underline"
                              >
                                {request.guest_phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {request.details && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">
                              Περιγραφή δεξίωσης
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {request.details}
                            </p>
                          </div>
                        )}

                        {request.other_comments && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 mb-1">Άλλα σχόλια</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {request.other_comments}
                            </p>
                          </div>
                        )}
                      </div>

                      {normStatus === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'ACCEPTED')}
                            disabled={updatingId === request.id}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Αποδοχή
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                            disabled={updatingId === request.id}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Απόρριψη
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
