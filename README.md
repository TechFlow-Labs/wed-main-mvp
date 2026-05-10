# Διαχείριση Κρατήσεων Γάμων (Expo)

Expo version of the Wedding Reservations app—runs on **web**, **iOS**, and **Android**.

## Setup

1. **Install dependencies** (if you get npm cache errors, run `sudo chown -R $(whoami) ~/.npm` first):

   ```bash
   npm install
   ```

2. **Configure environment**  
   Ensure `.env` contains:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Run

- **Web**: `npm run web` or `npx expo start --web`
- **iOS**: `npm run ios` or `npx expo start --ios`
- **Android**: `npm run android` or `npx expo start --android`
- **All platforms**: `npm start` then press `w` for web, `i` for iOS, `a` for Android

## Project structure

- `app/` – Expo Router routes (layout, index)
- `components/` – Shared UI (Navbar, Calendar, ReservationsList, App)
- `components/pages/` – Dashboard, Profile, EventRequests, ReservationDetail
- `components/pages/` – Dashboard, Profile, EventRequests, ReservationDetail, SpecialPartners
- `lib/` – Supabase client, database types, profile types
- `supabase/` – Migrations (unchanged from original)

## Differences from original Vite app

- React Native primitives (`View`, `Text`, `Pressable`, `TextInput`, etc.) instead of HTML
- NativeWind (Tailwind for React Native) for styling
- `lucide-react-native` instead of `lucide-react`
- AsyncStorage instead of `localStorage`
- `expo-image-picker` for image selection
- `Linking.openURL()` for `mailto:`, `tel:`, and calendar links
- Print only on web (via `window.print()`)

## Special Partners feature

- Προστέθηκε νέα οθόνη `Special Partners` στο internal navigation flow.
- Το UI είναι προσβάσιμο από:
  - navbar item `Special Partners`
  - home dashboard card `Special Partners`
- Endpoint contract:
  - `GET /public-api/special-partners/`
  - `items: Array<{ id, name, category, city, shortDescription, badge, featuredImage, rating }>`
- Local test:
  - `npm run web` και έλεγχος της οθόνης μέσα από το app navigation.
- Expected PR preview URL:
  - `https://main-feature-special-partners-page.preview.techflowlabs.gr`
