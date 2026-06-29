import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Modal,
  useWindowDimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { Home, LayoutDashboard, User, ChevronDown, Inbox, LogOut, Wallet, StickyNote, PiggyBank } from 'lucide-react-native';
import { getAdminProfile, type AdminProfile } from '../lib/profile.types';
import { useAuth } from '../contexts/AuthContext';
import { getMyProfile } from '../lib/profileApi';

const MENU_WIDTH = 280;

interface NavbarProps {
  onNavigateToHome?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToEventRequests?: () => void;
  onNavigateToPartnerExpenses?: () => void;
  onNavigateToNotes?: () => void;
  onNavigateToBudget?: () => void;
  onLogout?: () => void;
  showBackToDashboard?: boolean;
  currentPage?: 'home' | 'dashboard' | 'detail' | 'profile' | 'event-requests' | 'partner-expenses' | 'notes' | 'budget';
}

type Anchor = { x: number; y: number; width: number; height: number };

export function Navbar({
  onNavigateToHome,
  onNavigateToDashboard,
  onNavigateToProfile,
  onNavigateToEventRequests,
  onNavigateToPartnerExpenses,
  onNavigateToNotes,
  onNavigateToBudget,
  onLogout,
  showBackToDashboard: _showBackToDashboard = false,
  currentPage = 'home'
}: NavbarProps) {
  const { token } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    if (token) {
      getMyProfile(token.access_token, token.token_type)
        .then((p) => {
          const name =
            [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || p.username;
          setProfile({
            id: p.id,
            name,
            email: p.email,
            phone: '',
            businessName: p.business_name || '',
            businessAddress: '',
            updatedAt: new Date().toISOString(),
          });
        })
        .catch(() => {
          getAdminProfile().then(setProfile);
        });
    } else {
      getAdminProfile().then(setProfile);
    }
  }, [token]);

  const displayProfile = profile ?? { name: 'Προφίλ', email: '', avatarUrl: '' };

  const toggleProfileMenu = () => {
    if (profileMenuOpen) {
      setProfileMenuOpen(false);
      setAnchor(null);
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setProfileMenuOpen(true);
    });
  };

  const closeMenu = () => {
    setProfileMenuOpen(false);
    setAnchor(null);
  };

  const menuLeft =
    anchor != null
      ? Math.min(
          Math.max(8, anchor.x + anchor.width - MENU_WIDTH),
          windowWidth - MENU_WIDTH - 8
        )
      : 0;
  const menuTop = anchor != null ? anchor.y + anchor.height + 8 : 0;

  return (
    <View className="bg-white border-b border-gray-200 shadow-sm pt-2 pb-2 px-4 z-[100]">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-4 flex-1 flex-wrap">
          <Text className="text-xl font-bold text-gray-900">Wed Partners</Text>
          <View className="flex-row items-center gap-2 flex-wrap">
            {onNavigateToHome && (
              <Pressable
                onPress={onNavigateToHome}
                className={`flex-row items-center gap-2 py-2 px-2 ${currentPage === 'home' ? 'opacity-100' : 'opacity-70'}`}
              >
                <Home size={16} color={currentPage === 'home' ? '#2d2d2d' : '#6b7280'} />
                <Text className={`text-sm font-medium ${currentPage === 'home' ? 'text-wed-primary font-semibold' : 'text-gray-600'}`}>
                  Αρχική
                </Text>
              </Pressable>
            )}
            {onNavigateToDashboard && (
              <Pressable
                onPress={onNavigateToDashboard}
                className={`flex-row items-center gap-2 py-2 px-2 ${currentPage === 'dashboard' ? 'opacity-100' : 'opacity-70'}`}
              >
                <LayoutDashboard size={16} color={currentPage === 'dashboard' ? '#2d2d2d' : '#6b7280'} />
                <Text className={`text-sm font-medium ${currentPage === 'dashboard' ? 'text-wed-primary font-semibold' : 'text-gray-600'}`}>
                  Κρατήσεις
                </Text>
              </Pressable>
            )}
            {onNavigateToEventRequests && (
              <Pressable
                onPress={onNavigateToEventRequests}
                className={`flex-row items-center gap-2 py-2 px-2 ${currentPage === 'event-requests' ? 'opacity-100' : 'opacity-70'}`}
              >
                <Inbox size={16} color={currentPage === 'event-requests' ? '#2d2d2d' : '#6b7280'} />
                <Text className={`text-sm font-medium ${currentPage === 'event-requests' ? 'text-wed-primary font-semibold' : 'text-gray-600'}`}>
                  Αιτήματα Χώρου
                </Text>
              </Pressable>
            )}
            {onNavigateToPartnerExpenses && (
              <Pressable
                onPress={onNavigateToPartnerExpenses}
                className={`flex-row items-center gap-2 py-2 px-2 ${currentPage === 'partner-expenses' ? 'opacity-100' : 'opacity-70'}`}
              >
                <Wallet size={16} color={currentPage === 'partner-expenses' ? '#2d2d2d' : '#6b7280'} />
                <Text className={`text-sm font-medium ${currentPage === 'partner-expenses' ? 'text-wed-primary font-semibold' : 'text-gray-600'}`}>
                  Έξοδα
                </Text>
              </Pressable>
            )}
            {onNavigateToNotes && (
              <Pressable
                onPress={onNavigateToNotes}
                className={`flex-row items-center gap-2 py-2 px-2 ${currentPage === 'notes' ? 'opacity-100' : 'opacity-70'}`}
              >
                <StickyNote size={16} color={currentPage === 'notes' ? '#2d2d2d' : '#6b7280'} />
                <Text className={`text-sm font-medium ${currentPage === 'notes' ? 'text-wed-primary font-semibold' : 'text-gray-600'}`}>
                  Σημειώσεις
                </Text>
              </Pressable>
            )}
            {onNavigateToBudget && (
              <Pressable
                onPress={onNavigateToBudget}
                className={`flex-row items-center gap-2 py-2 px-2 ${currentPage === 'budget' ? 'opacity-100' : 'opacity-70'}`}
              >
                <PiggyBank size={16} color={currentPage === 'budget' ? '#f43f5e' : '#6b7280'} />
                <Text className={`text-sm font-medium ${currentPage === 'budget' ? 'text-rose-500 font-semibold' : 'text-gray-600'}`}>
                  Προϋπολογισμός
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <View ref={triggerRef} collapsable={false}>
            <Pressable
              onPress={toggleProfileMenu}
              className="flex-row items-center gap-2 px-3 py-2 rounded-lg"
            >
              <View className="w-8 h-8 rounded-full bg-wed-accent-lighter items-center justify-center overflow-hidden">
                {displayProfile.avatarUrl ? (
                  <Image source={{ uri: displayProfile.avatarUrl }} className="w-full h-full" />
                ) : (
                  <User size={16} color="#C28B84" />
                )}
              </View>
              <Text className="text-sm font-medium text-gray-700 hidden sm:block">
                {displayProfile.name || 'Προφίλ'}
              </Text>
              <ChevronDown size={16} color="#6b7280" style={{ transform: [{ rotate: profileMenuOpen ? '180deg' : '0deg' }] }} />
            </Pressable>
          </View>
        </View>
      </View>

      <Modal visible={profileMenuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
        <View className="flex-1" pointerEvents="box-none" style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} className="bg-black/25" onPress={closeMenu} />
          {anchor != null ? (
            <View
              style={[
                styles.dropdown,
                {
                  top: menuTop,
                  left: menuLeft,
                  width: MENU_WIDTH,
                  ...(Platform.OS === 'web'
                    ? { boxShadow: '0 10px 40px rgba(0,0,0,0.12)' as const }
                    : {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.12,
                        shadowRadius: 20,
                        elevation: 12,
                      }),
                },
              ]}
              className="bg-white rounded-xl border border-gray-100 py-2 px-1"
            >
              <View className="px-3 pb-3 pt-1 border-b border-gray-100 mb-1">
                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                  {displayProfile.name || 'Διαχειριστής'}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>
                  {displayProfile.email || 'Δεν έχει οριστεί email'}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  onNavigateToProfile?.();
                  closeMenu();
                }}
                className="flex-row items-center gap-2 py-3 px-3 rounded-lg active:bg-gray-50"
              >
                <User size={16} color="#6b7280" />
                <Text className="text-sm text-gray-700">Προβολή & Επεξεργασία Προφίλ</Text>
              </Pressable>
              {onLogout ? (
                <Pressable
                  onPress={() => {
                    onLogout();
                    closeMenu();
                  }}
                  className="flex-row items-center gap-2 py-3 px-3 mt-1 border-t border-gray-100 rounded-lg active:bg-red-50"
                >
                  <LogOut size={16} color="#b91c1c" />
                  <Text className="text-sm text-red-700">Αποσύνδεση</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    zIndex: 1000,
  },
});
