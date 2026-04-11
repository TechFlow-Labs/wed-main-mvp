import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  Search,
  RefreshCw,
  CalendarPlus,
  StickyNote,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { EventSpaceRequest } from '../lib/database.types';

interface EventRequestsProps {
  onBack: () => void;
  onCreateReservation?: (reservationId: string) => void;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Γάμος',
  baptism: 'Βάπτιση',
  christening: 'Χρίσμα',
  other: 'Άλλο'
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Εκκρεμεί',
  accepted: 'Αποδεκτό',
  denied: 'Απορριφθέν'
};

type SortOption = 'newest' | 'oldest' | 'event-date-asc' | 'event-date-desc';

export function EventRequests({ onBack, onCreateReservation }: EventRequestsProps) {
  const [requests, setRequests] = useState<EventSpaceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'denied'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creatingReservationId, setCreatingReservationId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_space_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading requests:', error);
        setRequests(getMockRequests());
      } else {
        setRequests(data && data.length > 0 ? data : getMockRequests());
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      setRequests(getMockRequests());
    } finally {
      setLoading(false);
    }
  };

  const getMockRequests = (): EventSpaceRequest[] => [
    {
      id: 'mock-1',
      couple_name: 'Μαρία & Γιάννης Παπαδόπουλος',
      contact_email: 'maria.papadopoulos@email.gr',
      contact_phone: '+30 210 111 2233',
      event_date: '2025-06-15',
      event_type: 'wedding',
      guest_count: 120,
      preferred_space: 'Κύρια αίθουσα',
      message: 'Θα θέλαμε να κάνουμε τον γάμο μας τον Ιούνιο. Ενδιαφερόμαστε για το πλήρες πακέτο με δεξίωση.',
      status: 'pending',
      admin_notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      couple_name: 'Ελένη Κωνσταντίνου',
      contact_email: 'elena.k@email.gr',
      contact_phone: '+30 210 444 5566',
      event_date: '2025-07-20',
      event_type: 'baptism',
      guest_count: 45,
      preferred_space: '',
      message: 'Ψάχνουμε χώρο για τη βάπτιση του μωρού μας.',
      status: 'pending',
      admin_notes: '',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      couple_name: 'Νίκος & Αναστασία Γεωργίου',
      contact_email: 'nikos.g@email.gr',
      contact_phone: '+30 210 777 8899',
      event_date: '2025-09-05',
      event_type: 'wedding',
      guest_count: 80,
      preferred_space: 'Εξωτερικός χώρος',
      message: 'Ονειρευόμαστε έναν υπαίθριο γάμο. Έχετε διαθεσιμότητα;',
      status: 'accepted',
      admin_notes: '',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const handleConvertToReservation = async (request: EventSpaceRequest) => {
    if (!onCreateReservation) return;
    setCreatingReservationId(request.id);
    try {
      const { data, error } = await supabase
        .from('wedding_reservations')
        .insert({
          client_name: request.couple_name,
          wedding_date: request.event_date,
          venue: request.preferred_space || 'Χώρος εκδήλωσης',
          guest_count: request.guest_count,
          contact_email: request.contact_email,
          contact_phone: request.contact_phone,
          status: 'confirmed',
          notes: request.message
        })
        .select('id')
        .single();

      if (error) throw error;
      if (data?.id) onCreateReservation(data.id);
    } catch (err) {
      console.error('Error creating reservation:', err);
    } finally {
      setCreatingReservationId(null);
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    const isMock = id.startsWith('mock-');
    if (isMock) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, admin_notes: notes } : r))
      );
    } else {
      const { error } = await supabase
        .from('event_space_requests')
        .update({ admin_notes: notes })
        .eq('id', id);
      if (!error) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, admin_notes: notes } : r))
        );
      }
    }
    setEditingNotesId(null);
    setNotesDraft('');
  };

  const handleStatusUpdate = async (id: string, status: 'accepted' | 'denied') => {
    setUpdatingId(id);
    try {
      const isMock = id.startsWith('mock-');
      if (isMock) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r))
        );
      } else {
        const { error } = await supabase
          .from('event_space_requests')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r))
        );
      }
    } catch (err) {
      console.error('Error updating request:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('el-GR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('el-GR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.couple_name.toLowerCase().includes(q) ||
        r.contact_email.toLowerCase().includes(q) ||
        (r.message || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'event-date-asc':
          return a.event_date.localeCompare(b.event_date);
        case 'event-date-desc':
          return b.event_date.localeCompare(a.event_date);
        default:
          return 0;
      }
    });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    denied: requests.filter((r) => r.status === 'denied').length
  };

  const getStatusBadge = (status: string) => {
    const base = 'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border';
    switch (status) {
      case 'pending':
        return `${base} bg-amber-50 text-amber-800 border-amber-200`;
      case 'accepted':
        return `${base} bg-green-50 text-green-800 border-green-200`;
      case 'denied':
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Αιτήματα Χώρου</h1>
          <p className="text-gray-600">
            Αιτήματα από ζευγάρια για χρήση του χώρου σας. Αποδεχτείτε ή απορρίψτε κάθε αίτημα.
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
            <p className="text-2xl font-bold text-gray-900">{stats.denied}</p>
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
                <option value="event-date-asc">Ημερομηνία εκδήλωσης (αύξουσα)</option>
                <option value="event-date-desc">Ημερομηνία εκδήλωσης (φθίνουσα)</option>
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
          {(['all', 'pending', 'accepted', 'denied'] as const).map((f) => (
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
                : `Δεν υπάρχουν αιτήματα${filter !== 'all' ? ` με κατάσταση "${STATUS_LABELS[filter]}"` : ''}`}
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
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-gray-900">{request.couple_name}</h2>
                        <span className={getStatusBadge(request.status)}>
                          {request.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                          {request.status === 'accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {request.status === 'denied' && <XCircle className="w-3.5 h-3.5" />}
                          {STATUS_LABELS[request.status]}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {EVENT_TYPE_LABELS[request.event_type]}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{formatDate(request.event_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>{request.guest_count} προσκεκλημένοι</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <a href={`mailto:${request.contact_email}`} className="text-wed-accent hover:underline">
                            {request.contact_email}
                          </a>
                        </div>
                        {request.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <a href={`tel:${request.contact_phone}`} className="text-wed-accent hover:underline">
                              {request.contact_phone}
                            </a>
                          </div>
                        )}
                        {request.preferred_space && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{request.preferred_space}</span>
                          </div>
                        )}
                      </div>

                      {request.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.message}</p>
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <StickyNote className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Σημειώσεις</span>
                          {editingNotesId !== request.id ? (
                            <button
                              onClick={() => {
                                setEditingNotesId(request.id);
                                setNotesDraft(request.admin_notes || '');
                              }}
                              className="text-xs text-wed-accent hover:underline"
                            >
                              {request.admin_notes ? 'Επεξεργασία' : 'Προσθήκη'}
                            </button>
                          ) : null}
                        </div>
                        {editingNotesId === request.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={notesDraft}
                              onChange={(e) => setNotesDraft(e.target.value)}
                              placeholder="Εσωτερικές σημειώσεις..."
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveNotes(request.id, notesDraft)}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-wed-primary rounded-lg hover:bg-wed-primary-light"
                              >
                                Αποθήκευση
                              </button>
                              <button
                                onClick={() => {
                                  setEditingNotesId(null);
                                  setNotesDraft('');
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                Ακύρωση
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {request.admin_notes || <span className="text-gray-400 italic">Δεν υπάρχουν σημειώσεις</span>}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        Αίτημα: {formatDateTime(request.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                    {request.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'accepted')}
                          disabled={updatingId === request.id}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Αποδοχή
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, 'denied')}
                          disabled={updatingId === request.id}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Απόρριψη
                        </button>
                      </div>
                    )}
                    {request.status === 'accepted' && (
                      <div className="flex flex-col gap-2">
                        <a
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Εκδήλωση - ${encodeURIComponent(request.couple_name)}&dates=${request.event_date.replace(/-/g, '')}T100000/${request.event_date.replace(/-/g, '')}T230000&details=${encodeURIComponent(request.message || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <CalendarPlus className="w-4 h-4" />
                          Προσθήκη στο ημερολόγιο
                        </a>
                        {onCreateReservation && request.event_type === 'wedding' && (
                          <button
                            onClick={() => handleConvertToReservation(request)}
                            disabled={creatingReservationId === request.id}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-wed-primary rounded-lg hover:bg-wed-primary-light transition-colors disabled:opacity-50"
                          >
                            {creatingReservationId === request.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Δημιουργία...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Δημιουργία κράτησης
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
