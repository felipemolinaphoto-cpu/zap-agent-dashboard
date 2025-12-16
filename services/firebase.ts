import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Configuração do Firebase (Zap Agent)
const firebaseConfig = {
  apiKey: "AIzaSyArVUcGGO7MVzGz6lhmolkZQKqfTo7CsLw",
  authDomain: "zap-agent-e03e3.firebaseapp.com",
  projectId: "zap-agent-e03e3",
  storageBucket: "zap-agent-e03e3.firebasestorage.app",
  messagingSenderId: "910440702326",
  appId: "1:910440702326:web:f062ef59753c90c6ba5a57",
  measurementId: "G-0JGZKJX3BY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (Safe check for browser environment)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};