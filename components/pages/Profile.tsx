import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { User, Mail, Building2, ArrowLeft, Save, Tag, FileText, Shield } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateMyProfile, type UserProfileResponse } from '../../lib/profileApi';

interface ProfileProps {
  onBack: () => void;
}

function displayName(p: UserProfileResponse): string {
  const parts = [p.first_name, p.last_name].filter(Boolean).join(' ').trim();
  return parts || p.username || p.email;
}

export function Profile({ onBack }: ProfileProps) {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      setError('Απαιτείται σύνδεση.');
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const p = await getMyProfile(token.access_token, token.token_type);
      setProfile(p);
      setUsername(p.username);
      setFirstName(p.first_name ?? '');
      setLastName(p.last_name ?? '');
      setBusinessName(p.business_name ?? '');
      setCategory(p.category ?? '');
      setDescription(p.description ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία φόρτωσης προφίλ.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!token || !profile) return;
    setError(null);
    setSaving(true);
    try {
      const updated = await updateMyProfile(token.access_token, token.token_type, {
        username: username.trim() || null,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        business_name: businessName.trim() || null,
        category: category.trim() || null,
        description: description.trim() || null,
      });
      setProfile(updated);
      setUsername(updated.username);
      setFirstName(updated.first_name ?? '');
      setLastName(updated.last_name ?? '');
      setBusinessName(updated.business_name ?? '');
      setCategory(updated.category ?? '');
      setDescription(updated.description ?? '');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία αποθήκευσης.');
    } finally {
      setSaving(false);
    }
  };

  const inputWeb =
    Platform.OS === 'web'
      ? ({ outlineStyle: 'none' as const, outlineWidth: 0, boxShadow: 'none' as const } as const)
      : undefined;

  if (loading) {
    return (
      <View className="flex-1 bg-wed-bg items-center justify-center">
        <ActivityIndicator size="large" color="#2d2d2d" />
        <Text className="text-gray-600 mt-4">Φόρτωση προφίλ…</Text>
      </View>
    );
  }

  if (!profile && error) {
    return (
      <View className="flex-1 bg-wed-bg items-center justify-center px-6">
        <Text className="text-red-700 text-center mb-4">{error}</Text>
        <Pressable onPress={onBack} className="px-4 py-2 bg-wed-primary rounded-lg">
          <Text className="text-white font-medium">Πίσω</Text>
        </Pressable>
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-wed-bg profile-form">
      <View className="w-full px-4 py-8">
        <Pressable onPress={onBack} className="flex-row items-center gap-2 mb-6">
          <ArrowLeft size={20} color="#6b7280" />
          <Text className="font-medium text-gray-600">Πίσω</Text>
        </Pressable>

        {error ? (
          <View className="mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <Text className="text-sm text-red-800">{error}</Text>
          </View>
        ) : null}

        <View className="bg-white rounded-2xl shadow-lg overflow-hidden border border-wed-accent-light/40">
          <View className="bg-wed-primary px-6 py-6">
            <View className="flex-row items-center gap-3">
              <View className="w-14 h-14 rounded-full bg-white/15 items-center justify-center">
                <User size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">{displayName(profile)}</Text>
                <Text className="text-white/90 text-sm mt-1">
                  Στοιχεία από το API (χρήστης · επιχείρηση · περιγραφή)
                </Text>
              </View>
            </View>
          </View>

          <View className="p-6 gap-5">
            <View className="flex-row flex-wrap gap-4 pb-4 border-b border-gray-100">
              <View className="flex-1 min-w-[140px]">
                <Text className="text-xs font-medium text-gray-500 uppercase mb-1">Email</Text>
                <View className="flex-row items-center gap-2">
                  <Mail size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-900 flex-1">{profile.email}</Text>
                </View>
                <Text className="text-xs text-gray-400 mt-1">Δεν υποστηρίζεται επεξεργασία μέσω API</Text>
              </View>
              <View className="flex-1 min-w-[140px]">
                <Text className="text-xs font-medium text-gray-500 uppercase mb-1">Ρόλος</Text>
                <View className="flex-row items-center gap-2">
                  <Shield size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-900">{profile.role}</Text>
                </View>
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Όνομα χρήστη (username)</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none"
                placeholderTextColor="#9ca3af"
                style={inputWeb}
                editable={!saving}
                caretColor="#C28B84"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Όνομα</Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none"
                  placeholder="Πρώτο όνομα"
                  placeholderTextColor="#9ca3af"
                  style={inputWeb}
                  editable={!saving}
                  caretColor="#C28B84"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Επώνυμο</Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none"
                  placeholder="Επώνυμο"
                  placeholderTextColor="#9ca3af"
                  style={inputWeb}
                  editable={!saving}
                  caretColor="#C28B84"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Επωνυμία επιχείρησης</Text>
              <View className="flex-row items-start gap-2">
                <Building2 size={18} color="#9ca3af" />
                <TextInput
                  value={businessName}
                  onChangeText={setBusinessName}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none"
                  placeholder="Π.χ. Wedding Studio Athens"
                  placeholderTextColor="#9ca3af"
                  style={inputWeb}
                  editable={!saving}
                  caretColor="#C28B84"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Κατηγορία</Text>
              <View className="flex-row items-start gap-2">
                <Tag size={18} color="#9ca3af" />
                <TextInput
                  value={category}
                  onChangeText={setCategory}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none"
                  placeholder="Κατηγορία δραστηριότητας"
                  placeholderTextColor="#9ca3af"
                  style={inputWeb}
                  editable={!saving}
                  caretColor="#C28B84"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Περιγραφή</Text>
              <View className="flex-row items-start gap-2">
                <View className="pt-3">
                  <FileText size={18} color="#9ca3af" />
                </View>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none min-h-[120px]"
                  placeholder="Σύντομη περιγραφή…"
                  placeholderTextColor="#9ca3af"
                  style={inputWeb}
                  editable={!saving}
                  caretColor="#C28B84"
                />
              </View>
            </View>
          </View>

          <View className="px-6 pb-6 pt-2 border-t border-gray-100 flex-row justify-between items-center">
            <Pressable onPress={onBack} className="px-4 py-2.5 bg-gray-100 rounded-xl">
              <Text className="text-sm font-medium text-gray-700">Ακύρωση</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className={`flex-row items-center gap-2 px-6 py-2.5 rounded-xl ${saving ? 'bg-gray-400' : 'bg-wed-primary active:opacity-90'}`}
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Save size={16} color="white" />
              )}
              <Text className="text-sm font-medium text-white">{saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
