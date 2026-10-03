import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const clean = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  let out = v.trim();
  out = out.replace(/,+$/, "");
  if (out.startsWith('"') && out.endsWith('"')) {
    out = out.slice(1, -1);
  } else if (out.startsWith("'") && out.endsWith("'")) {
    out = out.slice(1, -1);
  }
  out = out.trim();
  return out || undefined;
};

const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: clean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
