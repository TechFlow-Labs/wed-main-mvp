# Διαχείριση Κρατήσεων Γάμων (Expo)

Expo version of the Wedding Reservations app—runs on **web**, **iOS**, and **Android**.

## Setup

1. **Install dependencies** (if you get npm cache errors, run `sudo chown -R $(whoami) ~/.npm` first):

   ```bash
   npm install
   ```

2. **Configure environment** (optional)  
   Point the app at your Wedding Plan API (defaults to `http://localhost:8060`):

   ```
   EXPO_PUBLIC_API_URL=http://localhost:8060
   ```

   **Web + API on different ports** triggers browser CORS unless the API sends CORS headers. Options: enable CORS on the API, or use a **same-origin proxy** (the Docker image uses `/api` → see below).

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

## Docker deploy (Nginx + API proxy)

The **Docker build** sets `EXPO_PUBLIC_API_URL=/api` so the browser only talks to the same origin. Nginx forwards `/api/...` to `API_UPSTREAM` (runtime env var). Rebuild the image after changing build args.

1. Build and start container (build runs `expo export` inside the image with `/api`):

   ```bash
   npm run docker:up
   ```

2. Stop container:

   ```bash
   npm run docker:down
   ```

For local Docker usage, ensure the API is listening on **port 8060** on the machine that runs Docker (`host.docker.internal`).

If you prefer explicit commands:

```bash
docker compose up -d --build
```

For a **local static `dist/`** test without Docker, either point the API at `http://localhost:8060` and enable CORS there, or build with `EXPO_PUBLIC_API_URL=/api` and serve behind any reverse proxy to `:8060`.

## Coolify deployment (with preview deployments)

Use this repository as a **Dockerfile app** in Coolify (not Docker Compose for production/preview).

### Runtime env vars used by the container

- `APP_DOMAIN`: value for Nginx `server_name` (use `_` if you do not want hostname matching).
- `API_UPSTREAM`: upstream base URL used by Nginx for `/api` proxying (no trailing slash recommended).
- `EXPO_PUBLIC_API_URL`: keep this as `/api` so the browser always calls same-origin.

You can start from `.env.coolify.example`.

### Main deployment example

- `APP_DOMAIN=main.wedapp.gr`
- `API_UPSTREAM=http://wedding-api:8060`
- `EXPO_PUBLIC_API_URL=/api`

`wedding-api` should be the internal Coolify service/hostname for your API project.

### Preview deployment example (branch-based)

With Coolify Preview Deployments enabled, configure wildcard preview domain in Coolify (for example `*.preview.wedapp.gr`) and set:

- `APP_DOMAIN=_`
- `API_UPSTREAM=http://wedding-api-preview:8060` (or your shared staging API service)
- `EXPO_PUBLIC_API_URL=/api`

Each preview URL can then route frontend and API through the same origin while Nginx forwards `/api` internally.

### Notes

- Coolify handles TLS/ingress for preview/main domains, so this app serves plain HTTP on port `85`.
- `docker-compose.yml` remains for local development only.

## Project structure

- `app/` – Expo Router routes (layout, index)
- `components/` – Shared UI (Navbar, Calendar, ReservationsList, App)
- `components/pages/` – Dashboard, Profile, EventRequests, ReservationDetail
- `lib/` – REST API clients (`fetch` to OpenAPI backend), types, mappers

## Differences from original Vite app

- React Native primitives (`View`, `Text`, `Pressable`, `TextInput`, etc.) instead of HTML
- NativeWind (Tailwind for React Native) for styling
- `lucide-react-native` instead of `lucide-react`
- AsyncStorage instead of `localStorage`
- `expo-image-picker` for image selection
- `Linking.openURL()` for `mailto:`, `tel:`, and calendar links
- Print only on web (via `window.print()`)
