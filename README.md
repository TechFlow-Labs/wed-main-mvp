# Διαχείριση Κρατήσεων Γάμων (Expo)

Expo version of the Wedding Reservations app. Runs on **web**, **iOS**, and **Android**.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure `.env`:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

Only `EXPO_PUBLIC_*` variables are supported for deployment.

## Local run

- Web dev server: `npm run web`
- iOS: `npm run ios`
- Android: `npm run android`
- Web export build: `npm run build:web`
- Serve exported build locally: `npm run serve:web`

## Docker runtime (no Nginx)

The Docker image:
1. Builds static web assets with `expo export --platform web`.
2. Serves `dist/` with Node `serve` on port `3000`.

Container ingress, TLS certificates, and HTTP->HTTPS redirects are expected to be handled by Traefik/Coolify.

## Coolify (Traefik-only) configuration

Create a single **Application** in Coolify from this repository:
- Build Pack: `Dockerfile`
- Dockerfile path: `./Dockerfile`
- Container port: `3000`
- Domain: `app.yourdomain.com`
- Enable automatic HTTPS (Let's Encrypt)
- Enable force HTTPS redirect
- Health check path: `/`

Set these environment variables in Coolify:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

## Note about legacy Vite files

The `src/` directory contains legacy Vite-era files that use `VITE_*` env names and is not part of the Expo deployment path. Production deployment for this project uses the Expo app and `EXPO_PUBLIC_*` variables only.
