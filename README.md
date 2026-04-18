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

## Build static web output (`dist/`)

Generate a production web build for Nginx/Docker:

```bash
npm run build:web
```

This creates the `dist/` directory used by the Docker image.

## Docker deploy (static `dist/` + Nginx)

The included Docker setup serves `dist/` via Nginx and proxies same-origin `/api/*`
requests to `host.docker.internal:8060`.

1. Build and start container:

   ```bash
   npm run docker:up
   ```

2. Stop container:

   ```bash
   npm run docker:down
   ```

If you prefer explicit commands:

```bash
npm run build:web
docker compose up -d --build
```

## Project structure

- `app/` – Expo Router routes (layout, index)
- `components/` – Shared UI (Navbar, Calendar, ReservationsList, App)
- `components/pages/` – Dashboard, Profile, EventRequests, ReservationDetail
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
