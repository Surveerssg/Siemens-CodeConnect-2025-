const SPECIALIZATION_LABELS = {
  'speech-language-pathology': 'Speech-Language Pathology',
  'pediatric-therapy': 'Pediatric Therapy',
  'hearing-impaired': 'Hearing Impaired Specialization',
  'autism-spectrum': 'Autism Spectrum',
  'general': 'General Speech Therapy'
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ROLES } from '../../constants';
import {
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
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
    return null;
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

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

      const docSnap = await waitForUserDoc(userCredential.user.uid, 12, 250);
      if (!docSnap) {
        console.warn('Timed out waiting for user doc to be readable.');
      }

      try {
        if (auth.currentUser && typeof auth.currentUser.reload === 'function') {
          await auth.currentUser.reload();
        }
        if (auth.currentUser && typeof auth.currentUser.getIdToken === 'function') {
          await auth.currentUser.getIdToken(true);
        }
      } catch (reloadErr) {
        console.warn('Error reloading auth user or refreshing token:', reloadErr);
      }

      navigate('/therapist', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(58,61,66,0.06)',
          backgroundColor: 'white',
          border: '1px solid #E8E6E1',
          position: 'relative'
        }}>
          {/* Removed the top gradient line */}

          <Typography
            variant="h4"
            textAlign="center"
            mb={3}
            sx={{
              color: '#3A3D42',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '1.6rem', md: '1.95rem' }
            }}
          >
            Join as a Therapist 👩‍⚕️
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                backgroundColor: 'rgba(198, 123, 92, 0.08)',
                border: '1px solid rgba(198, 123, 92, 0.25)',
                color: '#3A3D42',
                '& .MuiAlert-icon': { color: '#C67B5C' }
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                      '& fieldset': { borderColor: '#E8E6E1' },
                      '&:hover fieldset': { borderColor: '#5B7C99' },
                      '&.Mui-focused fieldset': { borderColor: '#5B7C99' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', 
                      color: '#5B7C99' 
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  required
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                      '& fieldset': { borderColor: '#E8E6E1' },
                      '&:hover fieldset': { borderColor: '#5B7C99' },
                      '&.Mui-focused fieldset': { borderColor: '#5B7C99' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', 
                      color: '#5B7C99' 
                    }
                  }}
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
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                      '& fieldset': { borderColor: '#E8E6E1' },
                      '&:hover fieldset': { borderColor: '#5B7C99' },
                      '&.Mui-focused fieldset': { borderColor: '#5B7C99' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', 
                      color: '#5B7C99' 
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Institution / Clinic"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                      '& fieldset': { borderColor: '#E8E6E1' },
                      '&:hover fieldset': { borderColor: '#5B7C99' },
                      '&.Mui-focused fieldset': { borderColor: '#5B7C99' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', 
                      color: '#5B7C99' 
                    }
                  }}
                />
              </Grid>

<Grid item xs={12} sm={6}>
  <TextField
    select
    fullWidth
    label="Specialization"
    name="specialization"
    value={formData.specialization}
    onChange={handleChange}
    size="medium"
    SelectProps={{
      displayEmpty: true,
      renderValue: (selected) => {
        if (!selected) {
          return (
            <span style={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
            }}>
              Specialization
            </span>
          );
        }
        return SPECIALIZATION_LABELS[selected] || selected;
      },
      MenuProps: { PaperProps: { style: { maxHeight: 280 } } }
    }}
    slotProps={{
      inputLabel: {
        shrink: Boolean(formData.specialization),
      }
    }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        '& fieldset': { borderColor: '#E8E6E1' },
        '&:hover fieldset': { borderColor: '#5B7C99' },
        '&.Mui-focused fieldset': { borderColor: '#5B7C99' }
      },
      '& .MuiSelect-select': {
        padding: '12px 36px 12px 14px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
      },
      '& .MuiInputLabel-root': { 
        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
        color: '#5B7C99',
        backgroundColor: 'white',
        paddingLeft: '4px',
        paddingRight: '4px'
      },
      '& .MuiSelect-icon': { 
        right: 12,
        color: '#5B7C99'
      }
    }}
  >
    <MenuItem value="speech-language-pathology">Speech-Language Pathology</MenuItem>
    <MenuItem value="pediatric-therapy">Pediatric Therapy</MenuItem>
    <MenuItem value="hearing-impaired">Hearing Impaired Specialization</MenuItem>
    <MenuItem value="autism-spectrum">Autism Spectrum</MenuItem>
    <MenuItem value="general">General Speech Therapy</MenuItem>
  </TextField>
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
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                      '& fieldset': { borderColor: '#E8E6E1' },
                      '&:hover fieldset': { borderColor: '#5B7C99' },
                      '&.Mui-focused fieldset': { borderColor: '#5B7C99' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', 
                      color: '#5B7C99' 
                    }
                  }}
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
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                      '& fieldset': { borderColor: '#E8E6E1' },
                      '&:hover fieldset': { borderColor: '#5B7C99' },
                      '&.Mui-focused fieldset': { borderColor: '#5B7C99' }
                    },
                    '& .MuiInputLabel-root': { 
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', 
                      color: '#5B7C99' 
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                height: 52,
                backgroundColor: '#5B7C99',
                textTransform: 'none',
                fontWeight: 700,
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                borderRadius: 3,
                fontSize: '1rem',
                boxShadow: '0 6px 18px rgba(91,124,153,0.12)',
                '&:hover': { 
                  backgroundColor: '#4A677F', 
                  boxShadow: '0 8px 26px rgba(74,103,127,0.14)' 
                },
                '&:disabled': { 
                  backgroundColor: '#E8E6E1', 
                  color: '#5B7C99' 
                }
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Therapist Account'}
            </Button>
          </Box>

          <Box textAlign="center" mt={3} sx={{ borderTop: '1px solid #E8E6E1', pt: 3 }}>
            <Button
              component={Link}
              to="/role-selector"
              startIcon={<ArrowLeft size={18} />}
              sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                '&:hover': { 
                  backgroundColor: '#5B7C9910' 
                }
              }}
            >
              Back to Role Selection
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupTherapist;