import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
import { Hospital, ArrowLeft, User, Mail, Lock, Building, GraduationCap } from 'lucide-react';

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: ROLES.THERAPIST,
        license: formData.license,
        institution: formData.institution,
        specialization: formData.specialization,
        createdAt: new Date(),
        assignedChildren: []
      });

      navigate('/therapist');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="floating-letters">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            fontSize: `${Math.random() * 1.5 + 0.8}rem`
          }}
        >
          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
        </div>
      ))}
      
      <Container maxWidth="md" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        py: 4
      }}>
        <Paper elevation={10} sx={{ 
          p: 4, 
          width: '100%',
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 15
        }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              color: '#9B59B6',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              👩‍⚕️ Join as a Therapist
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Help children improve their speech with professional guidance!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <User size={20} style={{ marginRight: 8, color: '#9B59B6' }} />
                  }}
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    pointerEvents: 'auto',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 25
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
                  InputProps={{
                    startAdornment: <GraduationCap size={20} style={{ marginRight: 8, color: '#9B59B6' }} />
                  }}
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    pointerEvents: 'auto',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 25
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
                  InputProps={{
                    startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#9B59B6' }} />
                  }}
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    pointerEvents: 'auto',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 25
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Institution/Clinic"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Building size={20} style={{ marginRight: 8, color: '#9B59B6' }} />
                  }}
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    pointerEvents: 'auto',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 25
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    label="Specialization"
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 25,
                      pointerEvents: 'auto'
                    }}
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
                  InputProps={{
                    startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#9B59B6' }} />
                  }}
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    pointerEvents: 'auto',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 25
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
                  InputProps={{
                    startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#9B59B6' }} />
                  }}
                  sx={{
                    position: 'relative',
                    zIndex: 20,
                    pointerEvents: 'auto',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 25
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
              className="child-friendly-button"
              sx={{ 
                mt: 4, 
                mb: 2,
                height: 56,
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #9B59B6, #8E44AD)',
                position: 'relative',
                zIndex: 20,
                pointerEvents: 'auto',
                cursor: 'pointer',
                '&:hover': {
                  background: 'linear-gradient(45deg, #BB8FCE, #9B59B6)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Therapist Account!'}
            </Button>
          </Box>

          <Box textAlign="center" mt={3} sx={{ position: 'relative', zIndex: 20 }}>
            <Button
              component={Link}
              to="/role-selector"
              startIcon={<ArrowLeft size={20} />}
              sx={{ 
                color: '#9B59B6', 
                textDecoration: 'none',
                fontWeight: 'bold',
                position: 'relative',
                zIndex: 25,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
            >
              Back to Role Selection
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default SignupTherapist;
