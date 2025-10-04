// Test Firestore connection
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Test writing to Firestore
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, {
      message: 'Firestore connection successful',
      timestamp: new Date(),
      testId: Math.random().toString(36).substring(7)
    });
    console.log('✅ Firestore write successful');
    
    // Test reading from Firestore
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('✅ Firestore read successful:', docSnap.data());
    } else {
      console.log('❌ Document not found');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
};

// Call this function to test
// testFirestoreConnection();
