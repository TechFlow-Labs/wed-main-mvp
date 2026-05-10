import { useEffect, useState } from 'react';
import { Gift, RefreshCw } from 'lucide-react';
import { fetchGiftLists, type GiftListItem } from '../lib/giftListsApi';

interface GiftListsProps {
  onBack: () => void;
}

export function GiftLists({ onBack }: GiftListsProps) {
  const [items, setItems] = useState<GiftListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGiftLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGiftLists();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError('Δεν ήταν δυνατή η φόρτωση των λιστών δώρων.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGiftLists();
  }, []);

  return (
    <div className="min-h-screen bg-wed-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gift Lists</h1>
            <p className="text-gray-600 mt-2">Διαθέσιμες λίστες δώρων για ζευγάρια και καλεσμένους.</p>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-1">Σύνολο λιστών: {total}</p>
            )}
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Επιστροφή
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[16rem]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-wed-primary mx-auto mb-3"></div>
              <p className="text-gray-600">Φόρτωση λιστών δώρων...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-red-100">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={loadGiftLists}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-wed-primary text-white hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4" />
              Δοκιμή ξανά
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Δεν υπάρχουν διαθέσιμες λίστες δώρων αυτή τη στιγμή.</p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
              <article key={item.id} className="bg-white rounded-lg shadow p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  <Gift className="w-5 h-5 text-wed-primary" />
                </div>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Τύπος: {item.event_type}</span>
                  <span>{item.gift_count} δώρα</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
