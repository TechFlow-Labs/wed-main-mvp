import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  avatarUrl?: string;
  venuePhotos?: string[];
  updatedAt: string;
}

const STORAGE_KEY = 'wedding-admin-profile';

const DEFAULT_PROFILE: AdminProfile = {
  id: 'default',
  name: '',
  email: '',
  phone: '',
  businessName: '',
  businessAddress: '',
  venuePhotos: [],
  updatedAt: new Date().toISOString()
};

export const MOCK_PROFILE: AdminProfile = {
  id: 'default',
  name: 'Νίκος Παπαδόπουλος',
  email: 'nikos.papadopoulos@weddingstudio.gr',
  phone: '+30 210 123 4567',
  businessName: 'Wedding Studio Athens',
  businessAddress: 'Λεωφόρος Συγγρού 125, 117 42 Αθήνα',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  venuePhotos: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=400&fit=crop'
  ],
  updatedAt: new Date().toISOString()
};

export async function getAdminProfile(): Promise<AdminProfile> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AdminProfile;
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...MOCK_PROFILE };
}

export async function saveAdminProfile(profile: Partial<AdminProfile>): Promise<AdminProfile> {
  const current = await getAdminProfile();
  const updated: AdminProfile = {
    ...current,
    ...profile,
    updatedAt: new Date().toISOString()
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
