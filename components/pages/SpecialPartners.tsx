import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ArrowLeft, RefreshCw, Star } from 'lucide-react-native';
import { getSpecialPartners, type SpecialPartner } from '../../lib/specialPartnersApi';

type SpecialPartnersProps = {
  onBack: () => void;
};

export function SpecialPartners({ onBack }: SpecialPartnersProps) {
  const [items, setItems] = useState<SpecialPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSpecialPartners();
      setItems(data.items);
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView className="flex-1 bg-wed-bg">
      <View className="w-full px-4 py-8">
        <Pressable onPress={onBack} className="flex-row items-center gap-2 mb-6">
          <ArrowLeft size={20} color="#6b7280" />
          <Text className="font-medium text-gray-600">Πίσω</Text>
        </Pressable>

        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Special Partners</Text>
            <Text className="text-gray-600">
              Επιλεγμένοι συνεργάτες με premium υπηρεσίες για γάμο.
            </Text>
          </View>
          <Pressable onPress={load} disabled={loading} className="px-3 py-2 border border-gray-300 rounded-lg">
            <RefreshCw size={18} color={loading ? '#9ca3af' : '#374151'} />
          </Pressable>
        </View>

        {loading ? (
          <View className="bg-white rounded-lg shadow p-12 items-center">
            <ActivityIndicator size="large" color="#2d2d2d" />
            <Text className="text-gray-600 mt-4">Φόρτωση συνεργατών...</Text>
          </View>
        ) : error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Text className="text-red-800">{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View className="bg-white rounded-lg shadow p-10 items-center">
            <Text className="text-gray-500">Δεν υπάρχουν special partners αυτή τη στιγμή.</Text>
          </View>
        ) : (
          <View className="gap-4">
            {items.map((partner) => (
              <View key={partner.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <Image
                  source={{ uri: partner.featuredImage }}
                  className="w-full h-44"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <View className="flex-row items-center justify-between gap-2">
                    <Text className="text-lg font-semibold text-gray-900 flex-1">{partner.name}</Text>
                    <View className="bg-rose-100 rounded-full px-3 py-1">
                      <Text className="text-xs text-rose-800 font-medium">{partner.badge}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-500 mt-1">
                    {partner.category} · {partner.city}
                  </Text>
                  <Text className="text-gray-700 mt-3">{partner.shortDescription}</Text>
                  <View className="flex-row items-center gap-1 mt-3">
                    <Star size={16} color="#C28B84" />
                    <Text className="text-sm text-gray-700">{partner.rating.toFixed(1)} / 5</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
