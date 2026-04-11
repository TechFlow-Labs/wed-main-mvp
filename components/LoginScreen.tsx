import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Heart, Sparkles, Lock, UserRound } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<'user' | 'pass' | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!username.trim() || !password) {
      setError('Συμπληρώστε όνομα χρήστη και κωδικό.');
      return;
    }
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Αποτυχία σύνδεσης.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputWebNoOutline =
    Platform.OS === 'web'
      ? ({
          outlineWidth: 0,
          outlineStyle: 'none' as const,
          boxShadow: 'none' as const,
        } as const)
      : undefined;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-wed-bg login-screen"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Soft ambient blooms */}
      <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
        <View className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-wed-accent-light/40" />
        <View className="absolute top-1/3 -left-20 w-56 h-56 rounded-full bg-[#E8DDD8]/80" />
        <View className="absolute bottom-8 right-8 w-40 h-40 rounded-full bg-wed-accent/15" />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 22,
          paddingVertical: 40,
        }}
      >
        <View className="items-center mb-6">
          <View className="flex-row items-center gap-2 mb-2">
            <Sparkles size={18} color="#C28B84" />
            <Text className="text-xs font-semibold text-wed-accent uppercase" style={{ letterSpacing: 3 }}>
              Wedding Plan
            </Text>
            <Sparkles size={18} color="#C28B84" />
          </View>
          <Text className="text-3xl font-light text-wed-primary text-center tracking-tight">
            Καλώς ήρθατε
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-2 px-4 leading-5">
            Συνδεθείτε για να διαχειριστείτε τις κρατήσεις και το πρόγραμμα της ημέρας σας.
          </Text>
        </View>

        <View
          className="bg-white rounded-[28px] overflow-hidden border border-wed-accent-light/60 w-full max-w-md self-center"
          style={{
            shadowColor: '#2d2d2d',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <View className="px-8 pt-10 pb-2 items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4 border-2 border-wed-accent-light bg-wed-accent-lighter"
              style={{
                shadowColor: '#C28B84',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Heart size={30} color="#C28B84" fill="#F5EDEB" />
            </View>
            <View className="flex-row items-center gap-3 w-full justify-center mb-1">
              <View className="h-px flex-1 max-w-[48px] bg-wed-accent-light" />
              <Text className="text-lg font-semibold text-wed-primary">Σύνδεση</Text>
              <View className="h-px flex-1 max-w-[48px] bg-wed-accent-light" />
            </View>
            <Text className="text-xs text-gray-400 text-center mt-2 mb-6">
              Μόνο για εξουσιοδοτημένους χρήστες
            </Text>
          </View>

          <View className="px-8 pb-10 gap-5">
            <View>
              <Text className="text-xs font-semibold tracking-wide text-gray-500 mb-2 ml-1">
                Όνομα χρήστη
              </Text>
              <View
                className={`flex-row items-center rounded-2xl border-2 bg-white px-4 ${
                  focused === 'user' ? 'border-wed-accent' : 'border-wed-accent-light/70'
                }`}
              >
                <UserRound size={20} color={focused === 'user' ? '#C28B84' : '#9ca3af'} />
                <TextInput
                  className="flex-1 py-3.5 pl-3 text-base text-wed-primary outline-none"
                  placeholder="το email ή το username σας"
                  placeholderTextColor="#b4b4b4"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocused('user')}
                  onBlur={() => setFocused(null)}
                  style={inputWebNoOutline}
                  caretColor="#C28B84"
                />
              </View>
            </View>

            <View>
              <Text className="text-xs font-semibold tracking-wide text-gray-500 mb-2 ml-1">
                Κωδικός πρόσβασης
              </Text>
              <View
                className={`flex-row items-center rounded-2xl border-2 bg-white px-4 ${
                  focused === 'pass' ? 'border-wed-accent' : 'border-wed-accent-light/70'
                }`}
              >
                <Lock size={20} color={focused === 'pass' ? '#C28B84' : '#9ca3af'} />
                <TextInput
                  className="flex-1 py-3.5 pl-3 text-base text-wed-primary outline-none"
                  placeholder="••••••••"
                  placeholderTextColor="#b4b4b4"
                  secureTextEntry
                  editable={!submitting}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                  style={inputWebNoOutline}
                  caretColor="#C28B84"
                />
              </View>
            </View>

            {error ? (
              <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <Text className="text-sm text-red-700 text-center leading-5">{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center overflow-hidden ${
                submitting ? 'bg-gray-300' : 'bg-wed-primary active:opacity-90'
              }`}
              style={
                !submitting
                  ? {
                      shadowColor: '#2d2d2d',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.25,
                      shadowRadius: 10,
                      elevation: 6,
                    }
                  : undefined
              }
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base tracking-wide">Είσοδος</Text>
              )}
            </Pressable>

            <View className="flex-row items-center justify-center gap-2 pt-1">
              <View className="w-1 h-1 rounded-full bg-wed-accent/50" />
              <Text className="text-[11px] text-gray-400 italic text-center">
                Με αγάπη για την ημέρα σας
              </Text>
              <View className="w-1 h-1 rounded-full bg-wed-accent/50" />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
