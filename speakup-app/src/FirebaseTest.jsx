import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { debugFirebaseConfig } from './debug-firebase';
import { testFirestoreConnection } from './test-firestore';

const FirebaseTest = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [result, setResult] = useState('');

  const testFirebaseConnection = async () => {
    try {
      setResult('Testing Firebase connection...');
      
      // First, debug the configuration
      debugFirebaseConfig();
      
      // Test Firestore connection first
      setResult('Testing Firestore connection...');
      const firestoreSuccess = await testFirestoreConnection();
      
      if (!firestoreSuccess) {
        setResult('❌ Firestore connection failed. Check console for details.');
        return;
      }
      
      setResult('✅ Firestore connection successful! Testing Authentication...');
      
      // Try to create a test user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setResult(`✅ Success! User created: ${userCredential.user.uid}`);
      
      // Clean up - delete the test user
      await userCredential.user.delete();
      setResult(result + ' (Test user cleaned up)');
      
    } catch (error) {
      console.error('Firebase Error:', error);
      setResult(`❌ Error: ${error.code} - ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Firebase Connection Test</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Test Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '5px', margin: '5px 0' }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Test Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '5px', margin: '5px 0' }}
        />
      </div>
      
      <button 
        onClick={testFirebaseConnection}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#4ECDC4', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Firebase Connection
      </button>
      
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
