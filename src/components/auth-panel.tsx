"use client";

import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { TransactionForm } from "@/components/transaction-form";

const googleProvider = new GoogleAuthProvider();

export function AuthPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);

  async function handleGoogleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithPopup(getFirebaseAuth(), googleProvider);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    setError(null);
    setBusy(true);
    try {
      await signOut(getFirebaseAuth());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-out failed");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
    );
  }

  return (
    <div className="mt-8 w-full space-y-4 text-left">
      {user ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Signed in
          </p>
          <p className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
            {user.email ?? user.displayName ?? "No email"}
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-500">
            uid: {user.uid}
          </p>
          <TransactionForm userId={user.uid} />
          <button
            type="button"
            onClick={handleSignOut}
            disabled={busy}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          {busy ? "Opening Google…" : "Sign in with Google"}
        </button>
      )}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
