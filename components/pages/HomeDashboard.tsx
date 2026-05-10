import { View, Text, ScrollView, Pressable } from 'react-native';
import { CalendarDays, Inbox, Sparkles, Wallet, StickyNote, Star } from 'lucide-react-native';

type HomeDashboardProps = {
  onNavigateToReservations: () => void;
  onNavigateToRequests: () => void;
  onNavigateToPartnerExpenses: () => void;
  onNavigateToNotes: () => void;
  onNavigateToSpecialPartners: () => void;
};

export function HomeDashboard({
  onNavigateToReservations,
  onNavigateToRequests,
  onNavigateToPartnerExpenses,
  onNavigateToNotes,
  onNavigateToSpecialPartners,
}: HomeDashboardProps) {
  return (
    <ScrollView className="flex-1 bg-wed-bg">
      <View className="absolute inset-0 overflow-hidden pointer-events-none">
        <View className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-wed-accent-light/35" />
        <View className="absolute bottom-20 -left-16 w-48 h-48 rounded-full bg-[#E8DDD8]/70" />
      </View>

      <View className="w-full px-4 py-10 max-w-5xl self-center">
        <View className="items-center mb-10">
          <View className="flex-row items-center gap-2 mb-3">
            <Sparkles size={20} color="#C28B84" />
            <Text className="text-xs font-semibold text-wed-accent uppercase tracking-[0.2em]">Wedding Plan</Text>
            <Sparkles size={20} color="#C28B84" />
          </View>
          <Text className="text-3xl font-light text-wed-primary text-center">Καλώς ήρθατε</Text>
          <Text className="text-gray-600 text-center mt-3 px-2 leading-6">
            Επιλέξτε πού θέλετε να μεταβείτε — κρατήσεις, αιτήματα, έξοδα, σημειώσεις ή special partners.
          </Text>
        </View>

        <View className="gap-5">
          <View className="flex-col md:flex-row gap-5">
            <Pressable
              onPress={onNavigateToReservations}
              className="flex-1 min-w-0 bg-white rounded-2xl border border-wed-accent-light/60 p-6 active:opacity-95"
              style={{
                shadowColor: '#2d2d2d',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.07,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-4">
                <View className="w-14 h-14 rounded-2xl bg-wed-accent-lighter items-center justify-center border border-wed-accent-light">
                  <CalendarDays size={28} color="#C28B84" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-xl font-semibold text-wed-primary mb-1">Οι κρατήσεις μου</Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Ημερολόγιο, λίστα κρατήσεων ανά ημέρα και στατιστικά — η προβολή «Κρατήσεις Γάμων».
                  </Text>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-sm font-semibold text-wed-accent">Μετάβαση →</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={onNavigateToRequests}
              className="flex-1 min-w-0 bg-white rounded-2xl border border-wed-accent-light/60 p-6 active:opacity-95"
              style={{
                shadowColor: '#2d2d2d',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.07,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-4">
                <View className="w-14 h-14 rounded-2xl bg-wed-accent-lighter items-center justify-center border border-wed-accent-light">
                  <Inbox size={28} color="#C28B84" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-xl font-semibold text-wed-primary mb-1">Τα αιτήματά μου</Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Αιτήματα ζευγαριών για χρήση του χώρου — εκκρεμή, αποδεκτά και απορριφθέντα.
                  </Text>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-sm font-semibold text-wed-accent">Μετάβαση →</Text>
              </View>
            </Pressable>
          </View>

          <View className="flex-col md:flex-row gap-5">
            <Pressable
              onPress={onNavigateToPartnerExpenses}
              className="flex-1 min-w-0 bg-white rounded-2xl border border-wed-accent-light/60 p-6 active:opacity-95"
              style={{
                shadowColor: '#2d2d2d',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.07,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-4">
                <View className="w-14 h-14 rounded-2xl bg-wed-accent-lighter items-center justify-center border border-wed-accent-light">
                  <Wallet size={28} color="#C28B84" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-xl font-semibold text-wed-primary mb-1">Έξοδα συνεργάτη</Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Σύνολο εξόδων και λίστα καταχωρήσεων — προσθήκη και επεξεργασία εγγραφών.
                  </Text>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-sm font-semibold text-wed-accent">Μετάβαση →</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={onNavigateToNotes}
              className="flex-1 min-w-0 bg-white rounded-2xl border border-wed-accent-light/60 p-6 active:opacity-95"
              style={{
                shadowColor: '#2d2d2d',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.07,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-4">
                <View className="w-14 h-14 rounded-2xl bg-wed-accent-lighter items-center justify-center border border-wed-accent-light">
                  <StickyNote size={28} color="#C28B84" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-xl font-semibold text-wed-primary mb-1">Σημειώσεις</Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Γενικές σημειώσεις — προσθήκη, επεξεργασία και προαιρετική σύνδεση με κράτηση.
                  </Text>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-sm font-semibold text-wed-accent">Μετάβαση →</Text>
              </View>
            </Pressable>
          </View>

          <View className="flex-col md:flex-row gap-5">
            <Pressable
              onPress={onNavigateToSpecialPartners}
              className="flex-1 min-w-0 bg-white rounded-2xl border border-wed-accent-light/60 p-6 active:opacity-95"
              style={{
                shadowColor: '#2d2d2d',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.07,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <View className="flex-row items-start gap-4">
                <View className="w-14 h-14 rounded-2xl bg-wed-accent-lighter items-center justify-center border border-wed-accent-light">
                  <Star size={28} color="#C28B84" />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-xl font-semibold text-wed-primary mb-1">Special Partners</Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Επιλεγμένοι συνεργάτες με σύντομη περιγραφή, badge, εικόνα και αξιολόγηση.
                  </Text>
                </View>
              </View>
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-sm font-semibold text-wed-accent">Μετάβαση →</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
