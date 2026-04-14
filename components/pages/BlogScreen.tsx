import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Switch,
} from 'react-native';
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Pencil,
  BookOpen,
  Trash2,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import {
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  type BlogResponseSchema,
} from '../../lib/blogApi';

type BlogScreenProps = {
  onBack: () => void;
};

function sortBlogs(list: BlogResponseSchema[]): BlogResponseSchema[] {
  return [...list].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
}

export function BlogScreen({ onBack }: BlogScreenProps) {
  const { token } = useAuth();
  const [posts, setPosts] = useState<BlogResponseSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newIsPublished, setNewIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editIsPublished, setEditIsPublished] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const list = await getBlogs(token.access_token, token.token_type);
      setPosts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Σφάλμα φόρτωσης');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const sortedPosts = useMemo(() => sortBlogs(posts), [posts]);

  const handleCreate = async () => {
    if (!token || !newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    try {
      setError(null);
      const created = await createBlog(token.access_token, token.token_type, {
        title: newTitle.trim(),
        content: newContent.trim(),
        excerpt: newExcerpt.trim() || null,
        is_published: newIsPublished,
      });
      setPosts((prev) => [...prev, created]);
      setNewTitle('');
      setNewContent('');
      setNewExcerpt('');
      setNewIsPublished(false);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post: BlogResponseSchema) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditExcerpt(post.excerpt ?? '');
    setEditIsPublished(post.is_published);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setEditExcerpt('');
    setEditIsPublished(false);
  };

  const handleUpdate = async (id: string) => {
    if (!token) return;
    setUpdatingId(id);
    try {
      setError(null);
      const updated = await updateBlog(token.access_token, token.token_type, id, {
        title: editTitle.trim() || null,
        content: editContent.trim() || null,
        excerpt: editExcerpt.trim() ? editExcerpt.trim() : null,
        is_published: editIsPublished,
      });
      setPosts((prev) => prev.map((x) => (x.id === id ? updated : x)));
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία ενημέρωσης');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeletingId(id);
    try {
      setError(null);
      await deleteBlog(token.access_token, token.token_type, id);
      setPosts((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία διαγραφής');
    } finally {
      setDeletingId(null);
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
          <Text className="text-3xl font-bold text-gray-900 mb-2">Blog</Text>
          <Text className="text-gray-600">
            Μοιραστείτε την ιστορία σας και τις εμπειρίες σας με τον κόσμο.
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
              <BookOpen size={18} color="#6b7280" />
              <Text className="text-sm font-medium text-gray-500">Σύνολο</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">{posts.length}</Text>
          </View>
          <View className="flex-1 min-w-[100px] bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <View className="flex-row items-center gap-2 mb-1">
              <BookOpen size={18} color="#6b7280" />
              <Text className="text-sm font-medium text-gray-500">Δημοσιευμένα</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {posts.filter((p) => p.is_published).length}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => setShowForm((v) => !v)}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-wed-primary rounded-lg"
          >
            <Plus size={20} color="white" />
            <Text className="font-medium text-white">Νέο άρθρο</Text>
          </Pressable>
          <Pressable onPress={load} disabled={loading} className="px-4 py-3 border border-gray-300 rounded-lg bg-white">
            <RefreshCw size={20} color={loading ? '#9ca3af' : '#374151'} />
          </Pressable>
        </View>

        {showForm ? (
          <View className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-100 gap-3">
            <Text className="font-semibold text-gray-900">Νέο άρθρο</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Τίτλος *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              value={newContent}
              onChangeText={setNewContent}
              placeholder="Περιεχόμενο *"
              multiline
              numberOfLines={6}
              className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />
            <TextInput
              value={newExcerpt}
              onChangeText={setNewExcerpt}
              placeholder="Σύντομη περιγραφή (προαιρετικό)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholderTextColor="#9ca3af"
            />
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-sm font-medium text-gray-700">Δημοσίευση</Text>
              <Switch
                value={newIsPublished}
                onValueChange={setNewIsPublished}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={newIsPublished ? '#22c55e' : '#f3f4f6'}
              />
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleCreate}
                disabled={saving || !newTitle.trim() || !newContent.trim()}
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
                  setNewContent('');
                  setNewExcerpt('');
                  setNewIsPublished(false);
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
        ) : sortedPosts.length === 0 ? (
          <View className="bg-white rounded-lg shadow p-12 items-center">
            <BookOpen size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-3">Δεν υπάρχουν άρθρα.</Text>
          </View>
        ) : (
          <View className="gap-4">
            {sortedPosts.map((post) => (
              <View key={post.id} className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
                {editingId === post.id ? (
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
                      value={editContent}
                      onChangeText={setEditContent}
                      placeholder="Περιεχόμενο"
                      multiline
                      numberOfLines={6}
                      className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-lg"
                      placeholderTextColor="#9ca3af"
                      textAlignVertical="top"
                    />
                    <TextInput
                      value={editExcerpt}
                      onChangeText={setEditExcerpt}
                      placeholder="Σύντομη περιγραφή (προαιρετικό)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholderTextColor="#9ca3af"
                    />
                    <View className="flex-row items-center justify-between px-1">
                      <Text className="text-sm font-medium text-gray-700">Δημοσίευση</Text>
                      <Switch
                        value={editIsPublished}
                        onValueChange={setEditIsPublished}
                        trackColor={{ false: '#d1d5db', true: '#86efac' }}
                        thumbColor={editIsPublished ? '#22c55e' : '#f3f4f6'}
                      />
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => handleUpdate(post.id)}
                        disabled={updatingId === post.id}
                        className="flex-1 py-2 bg-wed-primary rounded-lg items-center"
                      >
                        {updatingId === post.id ? (
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
                        <Text className="text-lg font-semibold text-gray-900 mb-1">{post.title}</Text>
                        {post.excerpt ? (
                          <Text className="text-sm text-gray-500 mb-2">{post.excerpt}</Text>
                        ) : null}
                        <Text className="text-base text-gray-700 leading-6" numberOfLines={3}>
                          {post.content}
                        </Text>
                      </View>
                      <View className="flex-row gap-1">
                        <Pressable
                          onPress={() => startEdit(post)}
                          className="p-2 rounded-lg border border-gray-200"
                          accessibilityLabel="Επεξεργασία"
                        >
                          <Pencil size={16} color="#374151" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="p-2 rounded-lg border border-red-100"
                          accessibilityLabel="Διαγραφή"
                        >
                          {deletingId === post.id ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                            <Trash2 size={16} color="#ef4444" />
                          )}
                        </Pressable>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2 mt-3">
                      <View
                        className={`px-2 py-0.5 rounded-full ${
                          post.is_published ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            post.is_published ? 'text-green-700' : 'text-gray-500'
                          }`}
                        >
                          {post.is_published ? 'Δημοσιευμένο' : 'Πρόχειρο'}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400">
                        {post.updated_at ? new Date(post.updated_at).toLocaleString('el-GR') : '—'}
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
