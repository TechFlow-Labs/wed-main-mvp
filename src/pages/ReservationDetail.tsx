import { useEffect, useState, useMemo, useRef } from 'react';
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
  MessageCircle,
  X,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  UsersRound,
  Pencil,
  UserPlus,
  Send,
  CalendarPlus,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WeddingReservation } from '../lib/database.types';

interface ReservationDetailProps {
  reservationId: string;
  onBack: () => void;
}

interface Guest {
  id: string;
  name: string;
  table: string;
  confirmed: boolean | null;
  allergies: string | null;
  dietaryPreference: string | null;
  plusOne: string | null;
  notes: string | null;
}

function generateMockGuests(count: number): Guest[] {
  const firstNames = ['Μαρία', 'Γιάννης', 'Ελένη', 'Νίκος', 'Αννα', 'Δημήτρης', 'Κατερίνα', 'Αλέξανδρος', 'Σοφία', 'Παναγιώτης', 'Χριστίνα', 'Μιχάλης', 'Βασιλική', 'Γεώργιος', 'Αικατερίνη'];
  const lastNames = ['Παπαδόπουλος', 'Γεωργίου', 'Νικολάου', 'Κωνσταντίνου', 'Δημητρίου', 'Παυλίδης', 'Αντωνίου', 'Μαρκόπουλος', 'Ιωάννου', 'Πέτρου'];
  const tables = ['Τράπεζα 1', 'Τράπεζα 2', 'Τράπεζα 3', 'Τράπεζα 4', 'Τράπεζα 5', 'Τράπεζα 6', 'Τράπεζα 7', 'Τράπεζα 8'];
  const allergies = [null, null, null, 'Ξηροί καρποί', 'Γαλακτοκομικά', 'Γλουτένη', 'Θαλασσινά', 'Ξηροί καρποί, γαλακτοκομικά'];
  const dietaryPrefs = [null, null, null, null, 'Χορτοφάγος', 'Vegan', 'Χωρίς γλουτένη', 'Χαλαφή δίαιτα'];
  const confirmations: (boolean | null)[] = [true, true, true, false, null, true, true, false, null, true];

  return Array.from({ length: Math.min(count, 90) }, (_, i) => ({
    id: `guest-${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    table: tables[i % tables.length],
    confirmed: confirmations[i % confirmations.length],
    allergies: allergies[i % allergies.length],
    dietaryPreference: dietaryPrefs[i % dietaryPrefs.length],
    plusOne: i % 4 === 0 && i > 0 ? `${firstNames[(i + 3) % firstNames.length]} ${lastNames[(i + 2) % lastNames.length]}` : null,
    notes: i % 7 === 0 ? 'VIP - οικογένεια νυφίου' : i % 11 === 0 ? 'Παιδικό κάθισμα' : null
  }));
}

export function ReservationDetail({ reservationId, onBack }: ReservationDetailProps) {
  const [reservation, setReservation] = useState<WeddingReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBudgetAnalysis, setShowBudgetAnalysis] = useState(false);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [showEditReservationModal, setShowEditReservationModal] = useState(false);
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const [guestFilters, setGuestFilters] = useState({
    name: '',
    table: '',
    confirmed: '' as '' | 'true' | 'false' | 'pending',
    allergies: '',
    dietaryPreference: '',
    plusOne: '',
    notes: ''
  });
  const [debouncedGuestFilters, setDebouncedGuestFilters] = useState(guestFilters);

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedGuestFilters(guestFilters), 300);
    return () => clearTimeout(timer);
  }, [guestFilters]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wedding_reservations')
        .select('*')
        .eq('id', reservationId)
        .maybeSingle();

      if (error) throw error;
      setReservation(data);
    } catch (error) {
      console.error('Error loading reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('el-GR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('el-GR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Επιβεβαιωμένη',
      pending: 'Εκκρεμεί',
      completed: 'Ολοκληρωμένη',
      cancelled: 'Ακυρωμένη'
    };
    return labels[status] ?? status;
  };

  const filteredGuests = useMemo(() => {
    if (!reservation) return [];
    const guests = generateMockGuests(reservation.guest_count);
    const f = debouncedGuestFilters;
    return guests.filter((guest) => {
      if (f.name && !guest.name.toLowerCase().includes(f.name.toLowerCase())) return false;
      if (f.table && guest.table !== f.table) return false;
      if (f.confirmed === 'true' && guest.confirmed !== true) return false;
      if (f.confirmed === 'false' && guest.confirmed !== false) return false;
      if (f.confirmed === 'pending' && guest.confirmed !== null) return false;
      if (f.allergies) {
        if (!guest.allergies || !guest.allergies.toLowerCase().includes(f.allergies.toLowerCase())) return false;
      }
      if (f.dietaryPreference && !(guest.dietaryPreference?.toLowerCase().includes(f.dietaryPreference.toLowerCase()) ?? false)) return false;
      if (f.plusOne && !(guest.plusOne?.toLowerCase().includes(f.plusOne.toLowerCase()) ?? false)) return false;
      if (f.notes && !(guest.notes?.toLowerCase().includes(f.notes.toLowerCase()) ?? false)) return false;
      return true;
    });
  }, [reservation, debouncedGuestFilters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-wed-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wed-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση λεπτομερειών κράτησης...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-wed-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Δεν βρέθηκε η κράτηση</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-wed-primary text-white rounded-lg hover:bg-wed-primary-light transition-colors"
          >
            Πίσω
          </button>
        </div>
      </div>
    );
  }

  const mockMessages = [
    {
      id: '1',
      sender: 'couple' as const,
      text: 'Γεια σας! Είμαστε πολύ ενθουσιασμένοι για τον γάμο μας. Θα μπορούσατε να επιβεβαιώσετε το χρονοδιάγραμμα της ημέρας;',
      timestamp: '2025-02-14T10:30:00',
      senderName: reservation.client_name
    },
    {
      id: '2',
      sender: 'partner' as const,
      text: 'Γεια σας! Φυσικά. Θα σας στείλω το λεπτομερές πρόγραμμα μέχρι το τέλος της ημέρας. Συνήθως ξεκινάμε με τις φωτογραφίες προετοιμασίας 2 ώρες πριν την τελετή.',
      timestamp: '2025-02-14T11:15:00',
      senderName: 'Εσείς'
    },
    {
      id: '3',
      sender: 'couple' as const,
      text: 'Ακούγεται τέλεια! Σκεφτόμαστε να κάνουμε first look—θα ταιριάζει με το πρόγραμμά σας;',
      timestamp: '2025-02-14T14:20:00',
      senderName: reservation.client_name
    },
    {
      id: '4',
      sender: 'partner' as const,
      text: 'Ναι, τα first look είναι υπέροχα! Θα συνιστούσα 45 λεπτά πριν την τελετή για το καλύτερο φως. Θα το συμπεριλάβω στο χρονοδιάγραμμα.',
      timestamp: '2025-02-14T15:00:00',
      senderName: 'Εσείς'
    },
    {
      id: '5',
      sender: 'couple' as const,
      text: 'Σας ευχαριστούμε πολύ! Μία ακόμα ερώτηση—έχετε εφεδρικό σχέδιο αν βρέξει; Ο χώρος μας έχει έναν όμορφο κλειστό χώρο.',
      timestamp: '2025-02-15T09:45:00',
      senderName: reservation.client_name
    },
    {
      id: '6',
      sender: 'partner' as const,
      text: 'Εξαιρετική ερώτηση! Έχω κάνει φωτογραφίες στον χώρο σας πριν και ο κλειστός χώρος είναι υπέροχος. Θα εξετάσω και τις δύο επιλογές κατά την επίσκεψή μας την επόμενη εβδομάδα.',
      timestamp: '2025-02-15T10:30:00',
      senderName: 'Εσείς'
    }
  ];

  return (
    <div className="min-h-screen bg-wed-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Πίσω στο Πίνακα Ελέγχου</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-6">
          <div className="min-w-0 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-wed-primary to-wed-primary-light px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {reservation.client_name}
                  </h1>
                  <p className="text-white/90">
                    Λεπτομέρειες Κράτησης
                  </p>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-lg border ${getStatusColor(reservation.status)}`}>
                  {getStatusLabel(reservation.status)}
                </span>
              </div>
            </div>

            <div className="px-8 py-4 bg-white border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Γρήγορες Ενέργειες</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowEditReservationModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                  Επεξεργασία κράτησης
                </button>
                <button
                  onClick={() => setShowGuestsModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-gray-600" />
                  Επεξεργασία προσκεκλημένων
                </button>
                <button
                  onClick={() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Send className="w-4 h-4 text-gray-600" />
                  Αποστολή μηνύματος
                </button>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Γάμος - ${encodeURIComponent(reservation.client_name)}&dates=${reservation.wedding_date.replace(/-/g, '')}T100000/${reservation.wedding_date.replace(/-/g, '')}T230000&location=${encodeURIComponent(reservation.venue)}&details=${encodeURIComponent(`Κράτηση γάμου - ${reservation.client_name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <CalendarPlus className="w-4 h-4 text-gray-600" />
                  Προσθήκη στο ημερολόγιο
                </a>
                <a
                  href={`mailto:${reservation.contact_email}`}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-600" />
                  Στείλε email
                </a>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                  Εκτύπωση
                </button>
              </div>
            </div>

            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-wed-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ημερομηνία Γάμου</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(reservation.wedding_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                    <MapPin className="w-5 h-5 text-wed-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Τόπος Διεξαγωγής</p>
                    <p className="text-base font-semibold text-gray-900">
                      {reservation.venue}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuestsModal(true)}
                  className="flex items-start gap-3 w-full text-left rounded-lg p-2 -m-2 hover:bg-wed-accent-lighter/50 transition-colors focus:outline-none focus:ring-2 focus:ring-wed-accent focus:ring-offset-2"
                >
                  <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                    <Users className="w-5 h-5 text-wed-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Αριθμός Προσκεκλημένων</p>
                    <p className="text-base font-semibold text-gray-900">
                      {reservation.guest_count} προσκεκλημένοι
                    </p>
                    <p className="text-xs text-wed-accent mt-0.5 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Κλικ για λίστα προσκεκλημένων
                    </p>
                  </div>
                </button>

                {reservation.package_type && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                      <Package className="w-5 h-5 text-wed-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Τύπος Πακέτου</p>
                      <p className="text-base font-semibold text-gray-900">
                        {reservation.package_type}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                    <Mail className="w-5 h-5 text-wed-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-base font-semibold text-gray-900 break-all">
                      {reservation.contact_email}
                    </p>
                  </div>
                </div>

                {reservation.contact_phone && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                      <Phone className="w-5 h-5 text-wed-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Τηλέφωνο</p>
                      <p className="text-base font-semibold text-gray-900">
                        {reservation.contact_phone}
                      </p>
                    </div>
                  </div>
                )}

                {reservation.budget > 0 && (
                  <button
                    onClick={() => setShowBudgetAnalysis(true)}
                    className="flex items-start gap-3 w-full text-left rounded-lg p-2 -m-2 hover:bg-wed-accent-lighter/50 transition-colors focus:outline-none focus:ring-2 focus:ring-wed-accent focus:ring-offset-2"
                  >
                    <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                      <DollarSign className="w-5 h-5 text-wed-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Προϋπολογισμός</p>
                      <p className="text-base font-semibold text-gray-900">
                        ${reservation.budget.toLocaleString()}
                      </p>
                    </div>
                  </button>
                )}

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                    <Clock className="w-5 h-5 text-wed-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Δημιουργήθηκε</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDateTime(reservation.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {reservation.notes && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-wed-accent-lighter rounded-lg">
                    <FileText className="w-5 h-5 text-wed-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Σημειώσεις</p>
                    <p className="text-base text-gray-700 whitespace-pre-wrap">
                      {reservation.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>

          <div ref={chatSectionRef} className="min-w-0 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col min-h-[28rem] lg:min-h-[32rem]">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-wed-accent-lighter rounded-lg">
                  <MessageCircle className="w-5 h-5 text-wed-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Συνομιλία</h2>
                  <p className="text-sm text-gray-500">Συνομιλία με {reservation.client_name}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'partner' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === 'partner'
                          ? 'bg-wed-primary text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-xs font-medium opacity-90 mb-1">
                        {msg.senderName}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-xs mt-1.5 ${
                          msg.sender === 'partner' ? 'text-white/90' : 'text-gray-400'
                        }`}
                      >
                        {formatDateTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 bg-white p-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex-1 truncate">
                    Πληκτρολογήστε μήνυμα... (προσομοίωση)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBudgetAnalysis && reservation.budget > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowBudgetAnalysis(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-wed-primary to-wed-primary-light">
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Προϋπολογισμός</h2>
              </div>
              <button
                onClick={() => setShowBudgetAnalysis(false)}
                className="p-2 rounded-lg text-white/90 hover:bg-white/20 transition-colors"
                aria-label="Κλείσιμο"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
              <p className="text-sm text-gray-500 mb-1">Συνολικός προϋπολογισμός</p>
              <p className="text-2xl font-bold text-gray-900">${reservation.budget.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {showGuestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowGuestsModal(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full min-h-[32rem] max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-wed-primary to-wed-primary-light">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Λίστα Προσκεκλημένων</h2>
                <span className="text-white/90 text-sm">({filteredGuests.length} / {reservation.guest_count})</span>
              </div>
              <button
                onClick={() => setShowGuestsModal(false)}
                className="p-2 rounded-lg text-white/90 hover:bg-white/20 transition-colors"
                aria-label="Κλείσιμο"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Φίλτρα</span>
                <button
                  onClick={() => setGuestFilters({ name: '', table: '', confirmed: '', allergies: '', dietaryPreference: '', plusOne: '', notes: '' })}
                  className="ml-2 text-xs text-wed-accent hover:text-wed-primary font-medium"
                >
                  Εκκαθάριση
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Όνομα</label>
                  <input
                    type="text"
                    value={guestFilters.name}
                    onChange={(e) => setGuestFilters((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Αναζήτηση..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Τράπεζα</label>
                  <select
                    value={guestFilters.table}
                    onChange={(e) => setGuestFilters((f) => ({ ...f, table: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  >
                    <option value="">Όλες</option>
                    {['Τράπεζα 1', 'Τράπεζα 2', 'Τράπεζα 3', 'Τράπεζα 4', 'Τράπεζα 5', 'Τράπεζα 6', 'Τράπεζα 7', 'Τράπεζα 8'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Επιβεβαίωση</label>
                  <select
                    value={guestFilters.confirmed}
                    onChange={(e) => setGuestFilters((f) => ({ ...f, confirmed: e.target.value as typeof guestFilters.confirmed }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  >
                    <option value="">Όλες</option>
                    <option value="true">Θα έρθει</option>
                    <option value="false">Δεν θα έρθει</option>
                    <option value="pending">Εκκρεμεί</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Αλλεργίες</label>
                  <input
                    type="text"
                    value={guestFilters.allergies}
                    onChange={(e) => setGuestFilters((f) => ({ ...f, allergies: e.target.value }))}
                    placeholder="Αναζήτηση..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Διατροφική</label>
                  <input
                    type="text"
                    value={guestFilters.dietaryPreference}
                    onChange={(e) => setGuestFilters((f) => ({ ...f, dietaryPreference: e.target.value }))}
                    placeholder="π.χ. Vegan..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Συντροφιά</label>
                  <input
                    type="text"
                    value={guestFilters.plusOne}
                    onChange={(e) => setGuestFilters((f) => ({ ...f, plusOne: e.target.value }))}
                    placeholder="Αναζήτηση..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Σημειώσεις</label>
                  <input
                    type="text"
                    value={guestFilters.notes}
                    onChange={(e) => setGuestFilters((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Αναζήτηση..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-wed-accent focus:border-wed-accent"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[16rem] overflow-y-auto max-h-[calc(90vh-12rem)]">
              {filteredGuests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <UsersRound className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">Δεν βρέθηκαν προσκεκλημένοι</p>
                  <p className="text-sm text-gray-500 max-w-sm">
                    {Object.values(guestFilters).some(Boolean)
                      ? 'Δεν υπάρχουν αποτελέσματα που να ταιριάζουν με τα φίλτρα σας. Δοκιμάστε να αλλάξετε ή να εκκαθαρίσετε τα κριτήρια αναζήτησης.'
                      : 'Δεν υπάρχουν προσκεκλημένοι σε αυτή την κράτηση.'}
                  </p>
                  {Object.values(guestFilters).some(Boolean) && (
                    <button
                      onClick={() => setGuestFilters({ name: '', table: '', confirmed: '', allergies: '', dietaryPreference: '', plusOne: '', notes: '' })}
                      className="mt-4 px-4 py-2 text-sm font-medium text-wed-accent bg-wed-accent-lighter rounded-lg hover:bg-wed-accent-light transition-colors"
                    >
                      Εκκαθάριση φίλτρων
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Όνομα</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Τράπεζα</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Επιβεβαίωση</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Αλλεργίες</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Διατροφική Προτίμηση</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Συντροφιά</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Σημειώσεις</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{guest.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{guest.table}</td>
                          <td className="px-4 py-3">
                            {guest.confirmed === true && (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-medium">
                                <CheckCircle2 className="w-4 h-4" /> Θα έρθει
                              </span>
                            )}
                            {guest.confirmed === false && (
                              <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-md text-xs font-medium">
                                <XCircle className="w-4 h-4" /> Δεν θα έρθει
                              </span>
                            )}
                            {guest.confirmed === null && (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md text-xs font-medium">
                                <HelpCircle className="w-4 h-4" /> Εκκρεμεί
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {guest.allergies ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md text-xs">
                                <UtensilsCrossed className="w-4 h-4" /> {guest.allergies}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{guest.dietaryPreference ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{guest.plusOne ?? '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-[12rem]">
                            <span className="block truncate" title={guest.notes ?? undefined}>{guest.notes ?? '—'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditReservationModal && reservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowEditReservationModal(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-wed-primary to-wed-primary-light">
              <div className="flex items-center gap-2">
                <Pencil className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Επεξεργασία Κράτησης</h2>
              </div>
              <button
                onClick={() => setShowEditReservationModal(false)}
                className="p-2 rounded-lg text-white/90 hover:bg-white/20 transition-colors"
                aria-label="Κλείσιμο"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
              <p className="text-sm text-gray-500 mb-4">
                Επεξεργαστείτε τις λεπτομέρειες της κράτησης για {reservation.client_name}. Η λειτουργία πλήρους επεξεργασίας θα προστεθεί σύντομα.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Όνομα:</span> {reservation.client_name}</p>
                <p><span className="font-medium text-gray-700">Ημερομηνία:</span> {formatDate(reservation.wedding_date)}</p>
                <p><span className="font-medium text-gray-700">Χώρος:</span> {reservation.venue}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {reservation.contact_email}</p>
                <p><span className="font-medium text-gray-700">Προσκεκλημένοι:</span> {reservation.guest_count}</p>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowEditReservationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={() => setShowEditReservationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-wed-primary rounded-lg hover:bg-wed-primary-light transition-colors"
                >
                  Κλείσιμο
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
