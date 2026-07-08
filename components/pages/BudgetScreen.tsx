import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { ArrowLeft, RefreshCw, Pencil, PiggyBank, CheckCircle, Calendar } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  getBudgetSummary,
  setTotalBudget,
  type BudgetSummary,
} from '../../lib/budgetApi';

type BudgetScreenProps = {
  onBack: () => void;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('el-GR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return '#ef4444';
  if (percent >= 70) return '#f59e0b';
  return '#22c55e';
}

export function BudgetScreen({ onBack }: BudgetScreenProps) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getBudgetSummary(token.access_token, token.token_type);
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveBudget = async () => {
    if (!token || !budgetInput.trim()) return;
    const amount = parseFloat(budgetInput.trim());
    if (isNaN(amount) || amount < 0) return;
    setSaving(true);
    try {
      setError(null);
      await setTotalBudget(token.access_token, token.token_type, amount);
      setEditModalOpen(false);
      setBudgetInput('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης');
    } finally {
      setSaving(false);
    }
  };

  const spentPercent =
    summary && summary.total_budget > 0
      ? Math.min(100, (summary.spent_budget / summary.total_budget) * 100)
      : 0;

  const progressColor = getProgressColor(spentPercent);

  return (
    <ScrollView className="flex-1 bg-wed-bg">
      <View className="w-full px-4 py-8">
        <Pressable onPress={onBack} className="flex-row items-center gap-2 mb-6">
          <ArrowLeft size={20} color="#6b7280" />
          <Text className="font-medium text-gray-600">Πίσω</Text>
        </Pressable>

        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Προϋπολογισμός</Text>
          <Text className="text-gray-600">
            Παρακολούθηση δαπανών ανά προμηθευτή βάσει επιβεβαιωμένων κρατήσεων.
          </Text>
        </View>

        {error ? (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-sm text-red-800">{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View className="bg-white rounded-2xl shadow p-12 items-center">
            <ActivityIndicator size="large" color="#2d2d2d" />
            <Text className="text-gray-600 mt-4">Φόρτωση...</Text>
          </View>
        ) : (
          <>
            {/* Dark hero card */}
            <View className="bg-gray-900 rounded-2xl p-6 mb-6 shadow-lg">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-gray-400 text-sm mb-1">Συνολικός Προϋπολογισμός</Text>
                  <Text className="text-white text-4xl font-bold">
                    {formatCurrency(summary?.total_budget ?? 0)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setBudgetInput(String(summary?.total_budget ?? ''));
                    setEditModalOpen(true);
                  }}
                  className="p-2 rounded-full bg-white/10"
                >
                  <Pencil size={18} color="white" />
                </Pressable>
              </View>

              {/* Progress bar */}
              <View className="mb-4">
                <View className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <View
                    style={{ width: `${spentPercent}%`, backgroundColor: progressColor }}
                    className="h-full rounded-full"
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="text-xs text-gray-400">
                    {spentPercent.toFixed(0)}% χρησιμοποιημένο
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatCurrency(summary?.remaining_budget ?? 0)} διαθέσιμο
                  </Text>
                </View>
              </View>

              {/* Spent / Remaining tiles */}
              <View className="flex-row gap-4">
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-gray-400 text-xs mb-1">Δαπανήθηκαν</Text>
                  <Text className="text-white font-semibold text-lg">
                    {formatCurrency(summary?.spent_budget ?? 0)}
                  </Text>
                </View>
                <View className="flex-1 bg-white/10 rounded-xl p-3">
                  <Text className="text-gray-400 text-xs mb-1">Απομένουν</Text>
                  <Text className="text-white font-semibold text-lg">
                    {formatCurrency(summary?.remaining_budget ?? 0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action row */}
            <View className="flex-row gap-2 mb-6">
              <Pressable
                onPress={() => {
                  setBudgetInput(String(summary?.total_budget ?? ''));
                  setEditModalOpen(true);
                }}
                className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-wed-primary rounded-lg"
              >
                <PiggyBank size={20} color="white" />
                <Text className="font-medium text-white">Ορισμός Προϋπολογισμού</Text>
              </Pressable>
              <Pressable
                onPress={load}
                disabled={loading}
                className="px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <RefreshCw size={20} color={loading ? '#9ca3af' : '#374151'} />
              </Pressable>
            </View>

            {/* Vendor allocation list */}
            <Text className="text-xl font-bold text-gray-900 mb-4">Επιβεβαιωμένοι Προμηθευτές</Text>

            {!summary || summary.vendor_allocations.length === 0 ? (
              <View className="bg-white rounded-2xl shadow p-12 items-center">
                <PiggyBank size={48} color="#d1d5db" />
                <Text className="text-gray-500 text-center mt-3 font-medium">
                  Δεν υπάρχουν επιβεβαιωμένες κρατήσεις ακόμα.
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-1">
                  Οι δαπάνες εμφανίζονται μόλις ο προμηθευτής αποδεχτεί την κράτηση.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {summary.vendor_allocations.map((alloc) => (
                  <View
                    key={alloc.reservation_id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 gap-1">
                        <Text className="text-base font-semibold text-gray-900">
                          {alloc.business_name}
                        </Text>
                        {alloc.category ? (
                          <Text className="text-xs text-gray-500 uppercase tracking-wide">
                            {alloc.category}
                          </Text>
                        ) : null}
                        {alloc.event_date ? (
                          <View className="flex-row items-center gap-1 mt-1">
                            <Calendar size={12} color="#9ca3af" />
                            <Text className="text-xs text-gray-400">
                              {formatDate(alloc.event_date)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <View className="items-end gap-1">
                        <Text className="text-lg font-bold text-gray-900">
                          {formatCurrency(alloc.amount)}
                        </Text>
                        <View className="flex-row items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle size={11} color="#16a34a" />
                          <Text className="text-xs text-green-700 font-medium">Επιβεβαιωμένο</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {/* Edit budget modal */}
      <Modal
        visible={editModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalOpen(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <Text className="text-xl font-bold text-gray-900 mb-4">Ορισμός Προϋπολογισμού</Text>
            <TextInput
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="π.χ. 25000"
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl px-4 py-3 text-lg mb-4"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleSaveBudget}
                disabled={saving || !budgetInput.trim()}
                className="flex-1 py-3 bg-wed-primary rounded-xl items-center"
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white">Αποθήκευση</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setEditModalOpen(false);
                  setBudgetInput('');
                }}
                className="px-5 py-3 bg-gray-100 rounded-xl"
              >
                <Text className="font-medium text-gray-700">Ακύρωση</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
