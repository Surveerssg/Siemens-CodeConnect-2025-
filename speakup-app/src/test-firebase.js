// Test Firebase connection
import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Authentication
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Firebase Auth connected successfully');
    console.log('User ID:', userCredential.user.uid);
    
    // Test Firestore
    await setDoc(doc(db, 'test', 'connection'), {
      message: 'Firebase connection successful',
      timestamp: new Date()
    });
    console.log('✅ Firestore connected successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

// Call this function to test
// testFirebaseConnection();
