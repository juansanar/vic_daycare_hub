import { create } from "zustand";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth, firebaseEnabled } from "./firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>(() => ({
  user: null,
  loading: firebaseEnabled,

  signInWithGoogle: async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  },

  signOut: async () => {
    if (!auth) return;
    await fbSignOut(auth);
  },
}));

if (auth) {
  onAuthStateChanged(auth, (user) => {
    useAuth.setState({ user, loading: false });
  });
}
