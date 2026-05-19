import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();

function hasFirebaseAuthPluginHeader(): boolean {
  const headers = (
    window as unknown as {
      Capacitor?: { PluginHeaders?: { name?: string }[] };
    }
  ).Capacitor?.PluginHeaders;
  return (
    Array.isArray(headers) &&
    headers.some((h) => h?.name === "FirebaseAuthentication")
  );
}

/** Wait for Capacitor to inject native plugin headers (needed with live reload). */
async function waitForNativeBridge(maxMs = 5000): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (
      Capacitor.isPluginAvailable("FirebaseAuthentication") ||
      hasFirebaseAuthPluginHeader()
    ) {
      return;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error(
    "Capacitor native bridge is not ready. Close the app, run npm run android:live (or android:rebuild), then open Money Manager again—not Chrome.",
  );
}

/**
 * Google sign-in. Uses native Google auth on Android/iOS (WebView-safe).
 * Uses signInWithPopup in the browser.
 */
function formatSignInError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/no credentials available/i.test(message)) {
    return (
      "Google Sign-In is not configured for this build yet. In Firebase Console, add your debug SHA-1 " +
      "to the Android app (com.rainy.moneymanager.app), re-download google-services.json, then run npm run android:rebuild."
    );
  }
  if (/10:|developer_error|DEVELOPER_ERROR/i.test(message)) {
    return (
      "Google Sign-In configuration error (usually missing SHA-1 in Firebase). " +
      "Run: cd android && ./gradlew signingReport — add the debug SHA-1 in Firebase, re-download google-services.json, rebuild."
    );
  }
  return message || "Sign-in failed";
}

export async function signInWithGoogle(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await waitForNativeBridge();
    let result;
    try {
      result = await FirebaseAuthentication.signInWithGoogle({
        skipNativeAuth: true,
        // Credential Manager often returns "no credentials available" until SHA-1
        // is registered in Firebase and google-services.json is re-downloaded.
        useCredentialManager: false,
      });
    } catch (error) {
      throw new Error(formatSignInError(error));
    }
    const idToken = result.credential?.idToken;
    if (!idToken) {
      throw new Error("Google sign-in did not return an ID token.");
    }
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(getFirebaseAuth(), credential);
    return;
  }

  await signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signOutUser(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseAuthentication.signOut();
    } catch {
      // Native session may already be cleared.
    }
  }
  await firebaseSignOut(getFirebaseAuth());
}
