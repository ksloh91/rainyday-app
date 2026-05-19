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
  if (/not implemented|plugin.*not|native bridge/i.test(message)) {
    return (
      "Native Google Sign-In is unavailable. Open the Money Manager app (not Chrome), then run: npm run android:rebuild"
    );
  }
  return message || "Sign-in failed";
}

export async function signInWithGoogle(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    let result;
    try {
      result = await FirebaseAuthentication.signInWithGoogle({
        skipNativeAuth: true,
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
    }
  }
  await firebaseSignOut(getFirebaseAuth());
}
