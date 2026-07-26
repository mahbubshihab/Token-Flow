import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLO0ZMSqy8K2WmNiI4Zrlwg1ZQELNh48c",
  authDomain: "token-flow-bd.firebaseapp.com",
  projectId: "token-flow-bd",
  storageBucket: "token-flow-bd.firebasestorage.app",
  messagingSenderId: "251986701133",
  appId: "1:251986701133:web:cc1261eada3e1283e86504",
  measurementId: "G-3E7L0W2E3R"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
