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
  CircularProgress
} from '@mui/material';
import { Mic, Users, Hospital } from 'lucide-react';

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
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" textAlign="center" mb={2}>
          🎤 SpeakUp
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Welcome back — sign in to continue practicing!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
                backgroundColor: 'rgba(245,245,245,0.9)'
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
                backgroundColor: 'rgba(245,245,245,0.9)'
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, height: 48 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link to="/role-selector" style={{ textDecoration: 'none', fontWeight: 600 }}>
              Sign up here
            </Link>
          </Typography>
        </Box>

        <Box mt={4} display="flex" justifyContent="space-around" flexWrap="wrap">
          <Box textAlign="center" sx={{ minWidth: 90 }}>
            <Mic size={36} />
            <Typography variant="caption" display="block">
              Child
            </Typography>
          </Box>

          <Box textAlign="center" sx={{ minWidth: 90 }}>
            <Users size={36} />
            <Typography variant="caption" display="block">
              Parent
            </Typography>
          </Box>

          <Box textAlign="center" sx={{ minWidth: 90 }}>
            <Hospital size={36} />
            <Typography variant="caption" display="block">
              Therapist
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
