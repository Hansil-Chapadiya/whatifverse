# What If Verse Frontend Prototype

React + Vite + TypeScript prototype for **What If Verse** (AI-powered alternate reality simulation platform).

## Install

1. Copy env template:
   - `cp .env.example .env`
2. Fill required values in `.env`:
   - `VITE_APP_NAME`
   - `VITE_AI_SERVICE_BASE_URL`
   - `VITE_IMAGE_SERVICE_BASE_URL`
   - Optional tokens:
     - `VITE_AI_SERVICE_TOKEN`
     - `VITE_IMAGE_SERVICE_TOKEN`
3. Install dependencies:
   - `npm install react@18.3.1 react-dom@18.3.1 react-router-dom@6.30.1 @google/model-viewer@4.1.0`
   - `npm install -D vite@5.4.10 typescript@5.6.3 @vitejs/plugin-react@4.3.4 @types/react@18.3.12 @types/react-dom@18.3.1`
   - or simply: `npm install` (uses package.json)
4. Run dev server:
   - `npm run dev`

## Build

- `npm run build`
- `npm run preview`

## Exact npm packages used

Dependencies:
- `react`
- `react-dom`
- `react-router-dom`
- `@google/model-viewer`

Dev dependencies:
- `vite`
- `typescript`
- `@vitejs/plugin-react`
- `@types/react`
- `@types/react-dom`

## Notes

- The app validates required env vars at startup and shows a setup error screen when missing.
- The async scene generation flow polls every 2500ms and times out after 5 minutes.
- AR entry uses `model-viewer` and only presents AR controls when supported.
- In local development, absolute service URLs are automatically routed through the Vite dev proxy (`/__proxy_ai`, `/__proxy_image`) to avoid browser CORS preflight blocking.
- If you changed `.env`, restart `npm run dev` so proxy targets reload.
