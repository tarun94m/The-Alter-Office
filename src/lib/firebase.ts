import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDY3PLD8r921iu3lCcA0IHOslezhIqp7jA",
  authDomain: "the-project-c2ca3.firebaseapp.com",
  projectId: "the-project-c2ca3",
  storageBucket: "the-project-c2ca3.firebasestorage.app",
  messagingSenderId: "459629371340",
  appId: "1:459629371340:web:90816614cae5c5306b4769",
  measurementId: "G-LZJ0HHJ27B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Helper function for Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(
        'This domain is not authorized for authentication. Please add ' +
        window.location.hostname +
        ' to your Firebase Console under Authentication > Settings > Authorized domains.'
      );
    }
    console.error('Error signing in with Google:', error);
    throw error;
  }
};