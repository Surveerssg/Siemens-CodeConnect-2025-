import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ROLES } from '../../constants';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';

const SignupTherapist = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    license: '',
    institution: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // small helper to wait
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const waitForUserDoc = async (uid, maxAttempts = 12, intervalMs = 250) => {
    const ref = doc(db, 'users', uid);
    let attempts = 0;
    while (attempts < maxAttempts) {
      const snap = await getDoc(ref);
      if (snap.exists()) return snap;
      attempts++;
      await sleep(intervalMs);
    }
    return null; // timed out
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // set display name in auth profile
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      // write profile to Firestore (client-side timestamp is okay here)
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const payload = {
        name: formData.name,
        email: formData.email,
        role: ROLES.THERAPIST,
        license: formData.license || '',
        institution: formData.institution || '',
        specialization: formData.specialization || '',
        createdAt: new Date(),
        assignedChildren: []
      };

      await setDoc(userDocRef, payload, { merge: true });

      // Wait until the user doc is actually readable by other parts of the app.
      // This avoids the race where a global auth listener redirects before the role is known.
      const docSnap = await waitForUserDoc(userCredential.user.uid, 12, 250);
      if (!docSnap) {
        // not strictly fatal — still try to continue, but log/display a warning
        console.warn('Timed out waiting for user doc to be readable.');
      }

      // reload auth user and refresh token so AuthContext (if it uses token claims or server calls) gets fresh data
      try {
        // auth.currentUser should be same as userCredential.user, but reload to be safe
        if (auth.currentUser && typeof auth.currentUser.reload === 'function') {
          await auth.currentUser.reload();
        }
        // force a fresh token
        if (auth.currentUser && typeof auth.currentUser.getIdToken === 'function') {
          await auth.currentUser.getIdToken(true);
        }
      } catch (reloadErr) {
        console.warn('Error reloading auth user or refreshing token:', reloadErr);
      }

      // Finally navigate to therapist dashboard
      navigate('/therapist', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" textAlign="center" mb={3}>
          👩‍⚕️ Join as a Therapist
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="License Number"
                name="license"
                value={formData.license}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Institution / Clinic"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Specialization</InputLabel>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  label="Specialization"
                >
                  <MenuItem value="speech-language-pathology">Speech-Language Pathology</MenuItem>
                  <MenuItem value="pediatric-therapy">Pediatric Therapy</MenuItem>
                  <MenuItem value="hearing-impaired">Hearing Impaired Specialization</MenuItem>
                  <MenuItem value="autism-spectrum">Autism Spectrum</MenuItem>
                  <MenuItem value="general">General Speech Therapy</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Therapist Account!'}
          </Button>
        </Box>

        <Box mt={2} textAlign="center">
          <Button component={Link} to="/role-selector" startIcon={<ArrowLeft />}>
            Back to Role Selection
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupTherapist;
