import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';

const SignupChild = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    parentEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // All fields now required (including parentEmail)
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.age ||
      !formData.parentEmail
    ) {
      setError('Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: ROLES.CHILD,
        age: Number(formData.age),
        parentEmail: formData.parentEmail,
        createdAt: new Date(),
        avatar: '👶',
        level: 1,
        xp: 0,
        streak: 0,
        badges: []
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
            Join as a Child 👶
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
              <Grid item xs={12}>
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
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
                  label="Parent's Email"
                  name="parentEmail"
                  type="email"
                  value={formData.parentEmail}
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
  <FormControl 
    fullWidth 
    required
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
        color: '#5B7C99',
        '&.Mui-focused': {
          color: '#5B7C99'
        }
      }
    }}
  >
    <InputLabel shrink={Boolean(formData.age)}>Age</InputLabel>
    <Select
      name="age"
      value={formData.age}
      onChange={handleChange}
      label="Age"
      required
      displayEmpty
      renderValue={(selected) => {
        if (!selected) {
          return (
            <span style={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
              opacity: 0
            }}>
              Age
            </span>
          );
        }
        return `${selected} years`;
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: 2,
            marginTop: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }
      }}
    >
      {[...Array(12)].map((_, i) => (
        <MenuItem key={i + 4} value={i + 4}>{i + 4} years</MenuItem>
      ))}
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
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Child Account'}
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

export default SignupChild;