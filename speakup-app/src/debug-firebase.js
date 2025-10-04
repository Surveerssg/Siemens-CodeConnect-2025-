// Debug Firebase Configuration
import { auth, db } from './firebase';

export const debugFirebaseConfig = () => {
  console.log('=== Firebase Configuration Debug ===');
  
  // Check if environment variables are loaded
  console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Loaded' : '❌ Missing');
  console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Loaded' : '❌ Missing');
  console.log('Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Loaded' : '❌ Missing');
  console.log('Messaging Sender ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Loaded' : '❌ Missing');
  console.log('App ID:', import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Loaded' : '❌ Missing');
  
  // Check Firebase app initialization
  console.log('Auth object:', auth ? '✅ Initialized' : '❌ Failed');
  console.log('Firestore object:', db ? '✅ Initialized' : '❌ Failed');
  
  // Show actual values (be careful with sensitive data)
  console.log('Full config:', {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.substring(0, 10) + '...'
  });
  
  console.log('=== End Debug ===');
};

// Call this function in your browser console or add to a component
// debugFirebaseConfig();
