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
  Grid
} from '@mui/material';
import { Users, ArrowLeft, User, Mail, Lock, Phone } from 'lucide-react';

const SignupParent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
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
        role: ROLES.PARENT,
        phone: formData.phone,
        createdAt: new Date(),
        children: []
      });

      navigate('/parent');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="floating-letters">
      {[...Array(10)].map((_, i) => (
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
              color: '#4ECDC4',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              👨‍👩‍👧‍👦 Join as a Parent
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Support your child's speech development journey!
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
                    startAdornment: <User size={20} style={{ marginRight: 8, color: '#4ECDC4' }} />
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
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Phone size={20} style={{ marginRight: 8, color: '#4ECDC4' }} />
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
                    startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#4ECDC4' }} />
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
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#4ECDC4' }} />
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
                    startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#4ECDC4' }} />
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
                background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                position: 'relative',
                zIndex: 20,
                pointerEvents: 'auto',
                cursor: 'pointer',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7EDDD6, #4ECDC4)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Parent Account!'}
            </Button>
          </Box>

          <Box textAlign="center" mt={3} sx={{ position: 'relative', zIndex: 20 }}>
            <Button
              component={Link}
              to="/role-selector"
              startIcon={<ArrowLeft size={20} />}
              sx={{ 
                color: '#4ECDC4', 
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

export default SignupParent;
