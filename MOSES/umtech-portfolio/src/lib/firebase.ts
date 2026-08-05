import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAe-XZvq4jMUSSgt-5HqsY9udGl7DqQ_b0',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'umtech-fb1cc.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'umtech-fb1cc',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'umtech-fb1cc.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '730459113523',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:730459113523:web:0eac9f400575f1bbb9fb46',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-JXSQ90TB37',
};

// Initialize Firebase (safe for both server and client)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

export { app, db };
export default firebaseConfig;
