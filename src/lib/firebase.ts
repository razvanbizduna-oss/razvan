// ─── Firebase Setup ───────────────────────────────────────────────────────────
// Replace the firebaseConfig values below with your own Firebase project config.
// Steps:
//   1. Go to https://console.firebase.google.com
//   2. Create a new project (e.g. "interact-cismigiu")
//   3. Add a Web app
//   4. Copy the config object here
//   5. In Firebase console → Realtime Database → Create database → Start in test mode
//
// The app will NOT work until you fill in your own config below.

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, off, DatabaseReference } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDGTf0McxvjriKWDtbVfnTUgcy1CCobBbA",
  authDomain: "interact-cismigiu.firebaseapp.com",
  databaseURL: "https://interact-cismigiu-default-rtdb.firebaseio.com",
  projectId: "interact-cismigiu",
  storageBucket: "interact-cismigiu.firebasestorage.app",
  messagingSenderId: "26942882237",
  appId: "1:26942882237:web:a26ad58d1289e81c4f12d4",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// ─── Generic helpers ──────────────────────────────────────────────────────────

export { ref, onValue, set, push, remove, off };
export type { DatabaseReference };
