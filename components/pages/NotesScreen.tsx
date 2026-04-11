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
  StickyNote,
  Link2,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { createNote, getNotes, updateNote, type NoteResponseSchema } from '../../lib/notesApi';

type NotesScreenProps = {
  onBack: () => void;
};

function sortNotes(list: NoteResponseSchema[]): NoteResponseSchema[] {
  return [...list].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
}

export function NotesScreen({ onBack }: NotesScreenProps) {
  const { token } = useAuth();
  const [notes, setNotes] = useState<NoteResponseSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newReservationId, setNewReservationId] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editReservationId, setEditReservationId] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setNotes([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const list = await getNotes(token.access_token, token.token_type);
      setNotes(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedNotes = useMemo(() => sortNotes(notes), [notes]);

  const handleCreate = async () => {
    if (!token || !newContent.trim()) return;
    setSaving(true);
    try {
      setError(null);
      const created = await createNote(token.access_token, token.token_type, {
        content: newContent.trim(),
        reservation_id: newReservationId.trim() || null,
      });
      setNotes((prev) => [...prev, created]);
      setNewContent('');
      setNewReservationId('');
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (row: NoteResponseSchema) => {
    setEditingId(row.id);
    setEditContent(row.content);
    setEditReservationId(row.reservation_id ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditReservationId('');
  };

  const handleUpdate = async (id: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      setError(null);
      const updated = await updateNote(token.access_token, token.token_type, id, {
        content: editContent.trim() || null,
        reservation_id: editReservationId.trim() ? editReservationId.trim() : null,
      });
      setNotes((prev) => prev.map((x) => (x.id === id ? updated : x)));
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
          <Text className="text-3xl font-bold text-gray-900 mb-2">Σημειώσεις</Text>
          <Text className="text-gray-600">
            Γενικές σημειώσεις (και προαιρετική σύνδεση με κράτηση μέσω αναγνωριστικού).
          </Text>
        </View>

        {error ? (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-sm text-red-800">{error}</Text>
          </View>
        ) : null}

        <View className="flex-row flex-wrap gap-4 mb-6">
          <View className="flex-1 min-w-[100px] bg-white rounded-lg shadow p-4 border-l-4 border-wed-primary">
            <View className="flex-row items-center gap-2 mb-1">
              <StickyNote size={18} color="#6b7280" />
              <Text className="text-sm font-medium text-gray-500">Σύνολο</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">{notes.length}</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => setShowForm((v) => !v)}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-wed-primary rounded-lg"
          >
            <Plus size={20} color="white" />
            <Text className="font-medium text-white">Νέα σημείωση</Text>
          </Pressable>
          <Pressable onPress={load} disabled={loading} className="px-4 py-3 border border-gray-300 rounded-lg bg-white">
            <RefreshCw size={20} color={loading ? '#9ca3af' : '#374151'} />
          </Pressable>
        </View>

        {showForm ? (
          <View className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-100 gap-3">
            <Text className="font-semibold text-gray-900">Νέα καταχώρηση</Text>
            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              placeholder="Κείμενο *"
              multiline
              numberOfLines={4}
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
            <TextInput
              value={newReservationId}
              onChangeText={setNewReservationId}
              placeholder="ID κράτησης (UUID, προαιρετικό)"
              autoCapitalize="none"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
            />
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleCreate}
                disabled={saving || !newContent.trim()}
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
                  setNewContent('');
                  setNewReservationId('');
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
        ) : sortedNotes.length === 0 ? (
          <View className="bg-white rounded-lg shadow p-12 items-center">
            <StickyNote size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-3">Δεν υπάρχουν σημειώσεις.</Text>
          </View>
        ) : (
          <View className="gap-4">
            {sortedNotes.map((row) => (
              <View key={row.id} className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
                {editingId === row.id ? (
                  <View className="gap-3">
                    <Text className="text-sm font-medium text-gray-600">Επεξεργασία</Text>
                    <TextInput
                      value={editContent}
                      onChangeText={setEditContent}
                      placeholder="Κείμενο"
                      multiline
                      numberOfLines={4}
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg"
                      placeholderTextColor="#9ca3af"
                      textAlignVertical="top"
                    />
                    <TextInput
                      value={editReservationId}
                      onChangeText={setEditReservationId}
                      placeholder="ID κράτησης (UUID)"
                      autoCapitalize="none"
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
                        <Text className="text-base text-gray-900 leading-6">{row.content}</Text>
                      </View>
                      <Pressable
                        onPress={() => startEdit(row)}
                        className="p-2 rounded-lg border border-gray-200"
                        accessibilityLabel="Επεξεργασία"
                      >
                        <Pencil size={18} color="#374151" />
                      </Pressable>
                    </View>
                    {row.reservation_id ? (
                      <View className="mt-3 flex-row items-center gap-2">
                        <Link2 size={14} color="#9ca3af" />
                        <Text className="text-xs text-gray-500 font-mono" selectable>
                          Κράτηση: {row.reservation_id}
                        </Text>
                      </View>
                    ) : null}
                    <Text className="text-xs text-gray-400 mt-2">
                      Ενημέρωση: {row.updated_at ? new Date(row.updated_at).toLocaleString('el-GR') : '—'}
                    </Text>
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
