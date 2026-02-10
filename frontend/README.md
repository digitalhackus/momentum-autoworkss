# Momentum Autoworks – Frontend

This folder contains everything needed to run the frontend. It is a copy of the root frontend files so you can run the app from here.

## What’s in this folder

- **index.html** – Entry HTML (loads `/src/main.tsx`)
- **package.json** – Dependencies and scripts (`npm run dev`, `npm run build`)
- **vite.config.ts** – Vite config (port 3000, API proxy to backend)
- **src/** – All app source:
  - **main.tsx** – React entry
  - **App.tsx** – App shell and pages
  - **api/client.ts** – Backend API client (connects to http://localhost:5000/api)
  - **contexts/** – DataContext (API), ThemeContext
  - **components/** – All UI components

## How to run

1. **Install dependencies** (once):
   ```bash
   cd c:\figma\frontend
   npm install
   ```

2. **Start the backend** (in another terminal):
   ```bash
   cd c:\figma\backend
   npm install
   npm start
   ```
   Backend runs at http://localhost:5000.

3. **Start the frontend**:
   ```bash
   cd c:\figma\frontend
   npm run dev
   ```
   App runs at http://localhost:3000 and connects to the backend.

The backend lives in **c:\figma\backend** (sibling folder), not inside this folder.
