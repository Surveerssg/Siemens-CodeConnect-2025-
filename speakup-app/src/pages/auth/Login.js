import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
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
import { Mic, School, Users, Hospital } from 'lucide-react';

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
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="floating-letters">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            fontSize: `${Math.random() * 2 + 1}rem`
          }}
        >
          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
        </div>
      ))}
      
      <Container maxWidth="sm" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <Paper elevation={10} sx={{ 
          p: 4, 
          width: '100%',
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
          backdropFilter: 'blur(10px)'
        }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              color: '#FF6B6B',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              🎤 SpeakUp
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Welcome back! Let's practice speaking together!
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.8)'
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
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.8)'
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="child-friendly-button"
              sx={{ 
                mt: 3, 
                mb: 2,
                height: 56,
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E8E, #7EDDD6)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/role-selector" style={{ 
                color: '#4ECDC4', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Sign up here!
              </Link>
            </Typography>
          </Box>

          <Box mt={4} display="flex" justifyContent="space-around" flexWrap="wrap">
            <Box textAlign="center" sx={{ minWidth: 100, mb: 2 }}>
              <Mic size={40} color="#FF6B6B" />
              <Typography variant="caption" display="block">
                Child
              </Typography>
            </Box>
            <Box textAlign="center" sx={{ minWidth: 100, mb: 2 }}>
              <Users size={40} color="#4ECDC4" />
              <Typography variant="caption" display="block">
                Parent
              </Typography>
            </Box>
            <Box textAlign="center" sx={{ minWidth: 100, mb: 2 }}>
              <Hospital size={40} color="#9B59B6" />
              <Typography variant="caption" display="block">
                Therapist
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default Login;
