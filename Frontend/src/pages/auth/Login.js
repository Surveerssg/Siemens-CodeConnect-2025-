import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
  Card,
  Grid
} from '@mui/material';
import { Mic, Users, Hospital, ArrowRight, User, Heart, Star } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      let userRole = ROLES.CHILD;

      if (userDoc.exists()) {
        const userData = userDoc.data();
        userRole = userData.role || ROLES.CHILD;
      }

      // Navigate based on user role
      switch (userRole) {
        case ROLES.CHILD:
          navigate('/dashboard');
          break;
        case ROLES.PARENT:
          navigate('/parent');
          break;
        case ROLES.THERAPIST:
          navigate('/therapist');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card sx={{ 
          p: 4,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          backgroundColor: 'white',
          border: '1px solid #E8E6E1'
        }}>
          {/* Header */}
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" sx={{ 
              color: '#3A3D42',
              fontWeight: 'bold',
              fontFamily: '"Outfit", "Inter", sans-serif',
              mb: 1
            }}>
              Welcome Back 🎤
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              Sign in to continue your speech practice journey
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3,
              borderRadius: 2,
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  '& fieldset': {
                    borderColor: '#E8E6E1',
                  },
                  '&:hover fieldset': {
                    borderColor: '#5B7C99',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5B7C99',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  color: '#5B7C99',
                }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  '& fieldset': {
                    borderColor: '#E8E6E1',
                  },
                  '&:hover fieldset': {
                    borderColor: '#5B7C99',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5B7C99',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  color: '#5B7C99',
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={!loading && <ArrowRight size={18} />}
              sx={{ 
                mt: 3, 
                height: 48,
                backgroundColor: '#5B7C99',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                borderRadius: 2,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#4A677F',
                  boxShadow: '0 4px 12px rgba(91, 124, 153, 0.3)'
                },
                '&:disabled': {
                  backgroundColor: '#E8E6E1',
                  color: '#5B7C99'
                }
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
            </Button>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" sx={{ 
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              Don't have an account?{' '}
              <Button 
                component={Link} 
                to="/role-selector"
                sx={{ 
                  color: '#5B7C99', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  padding: '4px 8px',
                  minWidth: 'auto',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  '&:hover': {
                    backgroundColor: '#5B7C9910',
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign up here
              </Button>
            </Typography>
          </Box>

          {/* Role Icons */}
          <Box mt={4} display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box textAlign="center" sx={{ minWidth: 90, mb: 2 }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#5B7C9915',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                border: '1px solid #5B7C9920'
              }}>
                <Mic size={24} color="#5B7C99" />
              </Box>
              <Typography variant="caption" sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                fontWeight: 600
              }}>
                Child
              </Typography>
            </Box>

            <Box textAlign="center" sx={{ minWidth: 90, mb: 2 }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#8FA99815',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                border: '1px solid #8FA99820'
              }}>
                <Users size={24} color="#8FA998" />
              </Box>
              <Typography variant="caption" sx={{
                color: '#8FA998',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                fontWeight: 600
              }}>
                Parent
              </Typography>
            </Box>

            <Box textAlign="center" sx={{ minWidth: 90, mb: 2 }}>
              <Box sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#C67B5C15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                border: '1px solid #C67B5C20'
              }}>
                <Hospital size={24} color="#C67B5C" />
              </Box>
              <Typography variant="caption" sx={{
                color: '#C67B5C',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                fontWeight: 600
              }}>
                Therapist
              </Typography>
            </Box>
          </Box>

          {/* Features */}
        </Card>
      </Container>
    </Box>
  );
};

export default Login;