import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Pencil,
  Wallet,
  Calendar as CalendarIcon,
  Tag,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  createPartnerExpense,
  getPartnerExpenses,
  updatePartnerExpense,
  type PartnerExpenseItemSchema,
} from '../../lib/partnerExpensesApi';

type PartnerExpensesProps = {
  onBack: () => void;
};

function formatMoneyEl(amountStr: string): string {
  const n = Number.parseFloat(amountStr.replace(',', '.'));
  if (Number.isNaN(n)) return amountStr;
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDateDisplay(ymd: string): string {
  if (!ymd) return '—';
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('el-GR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function sortItems(items: PartnerExpenseItemSchema[]): PartnerExpenseItemSchema[] {
  return [...items].sort((a, b) => {
    const da = a.expense_date || '';
    const db = b.expense_date || '';
    if (da !== db) return db.localeCompare(da);
    return (b.created_at || '').localeCompare(a.created_at || '');
  });
}

export function PartnerExpenses({ onBack }: PartnerExpensesProps) {
  const { token } = useAuth();
  const [items, setItems] = useState<PartnerExpenseItemSchema[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setItems([]);
      setTotalExpenses('0');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const summary = await getPartnerExpenses(token.access_token, token.token_type);
      setItems(Array.isArray(summary.items) ? summary.items : []);
      setTotalExpenses(summary.total_expenses ?? '0');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedItems = useMemo(() => sortItems(items), [items]);

  const handleCreate = async () => {
    if (!token || !newTitle.trim()) return;
    const raw = newAmount.trim().replace(',', '.');
    if (!raw) return;
    setSaving(true);
    try {
      setError(null);
      await createPartnerExpense(token.access_token, token.token_type, {
        title: newTitle.trim(),
        amount: raw,
        category: newCategory.trim() || null,
        expense_date: newExpenseDate.trim() || null,
      });
      const summary = await getPartnerExpenses(token.access_token, token.token_type);
      setItems(Array.isArray(summary.items) ? summary.items : []);
      setTotalExpenses(summary.total_expenses ?? '0');
      setNewTitle('');
      setNewAmount('');
      setNewCategory('');
      setNewExpenseDate('');
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: PartnerExpenseItemSchema) => {
    setEditingId(row.id);
    setEditTitle(row.title);
    setEditAmount(row.amount.replace(',', '.'));
    setEditCategory(row.category ?? '');
    setEditExpenseDate(row.expense_date?.slice(0, 10) ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditAmount('');
    setEditCategory('');
    setEditExpenseDate('');
  };

  const handleUpdate = async (id: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      setError(null);
      const updated = await updatePartnerExpense(token.access_token, token.token_type, id, {
        title: editTitle.trim() || null,
        amount: editAmount.trim() ? editAmount.trim().replace(',', '.') : null,
        category: editCategory.trim() ? editCategory.trim() : null,
        expense_date: editExpenseDate.trim() ? editExpenseDate.trim() : null,
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      const summary = await getPartnerExpenses(token.access_token, token.token_type);
      setTotalExpenses(summary.total_expenses ?? '0');
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία ενημέρωσης');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-wed-bg">
      <View className="w-full px-4 py-8">
        <Pressable onPress={onBack} className="flex-row items-center gap-2 mb-6">
          <ArrowLeft size={20} color="#6b7280" />
          <Text className="font-medium text-gray-600">Πίσω</Text>
        </Pressable>

        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Έξοδα συνεργάτη</Text>
          <Text className="text-gray-600">Καταγραφή και επεξεργασία των εξόδων του χώρου σας.</Text>
        </View>

        {error ? (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-sm text-red-800">{error}</Text>
          </View>
        ) : null}

        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[140px] bg-white rounded-lg shadow p-4 border-l-4 border-wed-primary">
            <View className="flex-row items-center gap-2 mb-1">
              <Wallet size={18} color="#6b7280" />
              <Text className="text-sm font-medium text-gray-500">Σύνολο εξόδων</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">{formatMoneyEl(totalExpenses)}</Text>
          </View>
          <View className="flex-1 min-w-[100px] bg-white rounded-lg shadow p-4 border-l-4 border-gray-300">
            <Text className="text-sm font-medium text-gray-500">Εγγραφές</Text>
            <Text className="text-2xl font-bold text-gray-900">{items.length}</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => setShowForm((v) => !v)}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-wed-primary rounded-lg"
          >
            <Plus size={20} color="white" />
            <Text className="font-medium text-white">Νέο έξοδο</Text>
          </Pressable>
          <Pressable onPress={load} disabled={loading} className="px-4 py-3 border border-gray-300 rounded-lg bg-white">
            <RefreshCw size={20} color={loading ? '#9ca3af' : '#374151'} />
          </Pressable>
        </View>

        {showForm ? (
          <View className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-100 gap-3">
            <Text className="font-semibold text-gray-900">Νέα καταχώρηση</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Τίτλος *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="Ποσό (€) *"
              keyboardType="decimal-pad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Κατηγορία (προαιρετικό)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              value={newExpenseDate}
              onChangeText={setNewExpenseDate}
              placeholder="Ημερομηνία (YYYY-MM-DD, προαιρετικό)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
            />
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleCreate}
                disabled={saving || !newTitle.trim() || !newAmount.trim()}
                className="flex-1 py-2.5 bg-wed-primary rounded-lg items-center"
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-medium text-white">Αποθήκευση</Text>
                )}
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setNewTitle('');
                  setNewAmount('');
                  setNewCategory('');
                  setNewExpenseDate('');
                }}
                className="px-4 py-2.5 bg-gray-100 rounded-lg"
              >
                <Text className="font-medium text-gray-700">Ακύρωση</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View className="bg-white rounded-lg shadow p-12 items-center">
            <ActivityIndicator size="large" color="#2d2d2d" />
            <Text className="text-gray-600 mt-4">Φόρτωση...</Text>
          </View>
        ) : sortedItems.length === 0 ? (
          <View className="bg-white rounded-lg shadow p-12 items-center">
            <Wallet size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-3">Δεν υπάρχουν καταχωρημένα έξοδα.</Text>
          </View>
        ) : (
          <View className="gap-4">
            {sortedItems.map((row) => (
              <View key={row.id} className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
                {editingId === row.id ? (
                  <View className="gap-3">
                    <Text className="text-sm font-medium text-gray-600">Επεξεργασία</Text>
                    <TextInput
                      value={editTitle}
                      onChangeText={setEditTitle}
                      placeholder="Τίτλος"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                      value={editAmount}
                      onChangeText={setEditAmount}
                      placeholder="Ποσό"
                      keyboardType="decimal-pad"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                      value={editCategory}
                      onChangeText={setEditCategory}
                      placeholder="Κατηγορία"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholderTextColor="#9ca3af"
                    />
                    <TextInput
                      value={editExpenseDate}
                      onChangeText={setEditExpenseDate}
                      placeholder="Ημερομηνία (YYYY-MM-DD)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholderTextColor="#9ca3af"
                    />
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleUpdate(row.id)}
                        disabled={updatingId === row.id}
                        className="flex-1 py-2 bg-wed-primary rounded-lg items-center"
                      >
                        {updatingId === row.id ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text className="font-medium text-white">Ενημέρωση</Text>
                        )}
                      </Pressable>
                      <Pressable onPress={cancelEdit} className="px-4 py-2 bg-gray-100 rounded-lg">
                        <Text className="font-medium text-gray-700">Ακύρωση</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View>
                    <View className="flex-row justify-between items-start gap-2">
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">{row.title}</Text>
                        <Text className="text-2xl font-bold text-wed-primary mt-1">{formatMoneyEl(row.amount)}</Text>
                      </View>
                      <Pressable
                        onPress={() => startEdit(row)}
                        className="p-2 rounded-lg border border-gray-200"
                        accessibilityLabel="Επεξεργασία"
                      >
                        <Pencil size={18} color="#374151" />
                      </Pressable>
                    </View>
                    <View className="mt-3 gap-2">
                      <View className="flex-row items-center gap-2">
                        <CalendarIcon size={16} color="#9ca3af" />
                        <Text className="text-sm text-gray-600">{formatDateDisplay(row.expense_date)}</Text>
                      </View>
                      {row.category ? (
                        <View className="flex-row items-center gap-2">
                          <Tag size={16} color="#9ca3af" />
                          <Text className="text-sm text-gray-600">{row.category}</Text>
                        </View>
                      ) : null}
                      <Text className="text-xs text-gray-400">
                        Δημιουργία:{' '}
                        {row.created_at
                          ? new Date(row.created_at).toLocaleString('el-GR')
                          : '—'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
