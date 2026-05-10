import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { fetchGiftLists, type GiftItem } from "../lib/api";

export function GiftLists() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GiftItem[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchGiftLists();
        setItems(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Κάτι πήγε λάθος");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-wed-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wed-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση λίστας δώρων...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-wed-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-6 text-center max-w-lg w-full">
          <p className="text-red-700 font-medium mb-2">Αποτυχία φόρτωσης</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-wed-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-6 text-center max-w-lg w-full">
          <Gift className="w-10 h-10 text-wed-primary mx-auto mb-3" />
          <p className="text-gray-900 font-semibold mb-1">Δεν υπάρχουν δώρα ακόμα</p>
          <p className="text-gray-600 text-sm">Όταν προστεθούν δώρα θα εμφανιστούν εδώ.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wed-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Lists</h1>
        <p className="text-gray-600 mb-8">Διαθέσιμα δώρα: {items.length}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow p-5">
              <p className="text-xs text-wed-primary font-semibold mb-1">
                {item.category || "General"}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">{item.item_name}</h2>
              <p className="text-sm text-gray-600 mt-2">
                {item.short_description || "Χωρίς σύντομη περιγραφή"}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
