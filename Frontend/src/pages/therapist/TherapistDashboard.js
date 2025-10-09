import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { therapistAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Avatar,
  TextField
} from '@mui/material';
import { 
  Settings,
  LogOut
} from 'lucide-react';

const TherapistDashboard = () => {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [linkChildEmail, setLinkChildEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Load all linked children
  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await therapistAPI.listChildren();
        setChildren(res.data || []);
      } catch (e) {
        console.error('Failed to load linked children:', e);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                color: '#3A3D42', 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontSize: { xs: '2rem', md: '2.5rem' },
                mb: 1
              }}
            >
              Welcome, Dr. {user?.displayName || 'Therapist'}! 🧑‍⚕️
            </Typography>
            <Typography 
              variant="h6" 
              sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                fontWeight: 400
              }}
            >
              Track and monitor your assigned children’s speech progress
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button 
              startIcon={<Settings size={20} />} 
              onClick={() => navigate('/settings')} 
              variant="outlined"
              sx={{ 
                color: '#5B7C99',
                borderColor: '#E8E6E1',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                  borderColor: '#5B7C99'
                }
              }}
            >
              Settings
            </Button>
            <Button
              onClick={() => navigate('/therapist/practice')}
              variant="contained"
              sx={{
                backgroundColor: '#8FA998',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                '&:hover': { backgroundColor: '#7D9786' }
              }}
            >
              Assign Practice
            </Button>
            <Button 
              startIcon={<LogOut size={20} />} 
              onClick={handleLogout}
              variant="contained"
              sx={{ 
                backgroundColor: '#5B7C99',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: '#4A677F',
                  boxShadow: '0 4px 12px rgba(91, 124, 153, 0.3)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {/* Link Child Section */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: '#3A3D42', 
            fontWeight: 'bold', 
            mb: 3,
            fontFamily: '"Outfit", "Inter", sans-serif'
          }}
        >
          Link a Child
        </Typography>
        <Card 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            backgroundColor: 'white',
            border: '1px solid #E8E6E1'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField 
                label="Child Email" 
                type="email" 
                placeholder="child@email.com" 
                value={linkChildEmail} 
                onChange={(e) => setLinkChildEmail(e.target.value)}
                sx={{
                  flexGrow: 1,
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
                variant="contained" 
                onClick={async () => {
                  if (!linkChildEmail) return;
                  try {
                    await therapistAPI.linkChildByEmail(linkChildEmail);
                    const res = await therapistAPI.listChildren();
                    setChildren(res.data || []);
                    setLinkChildEmail('');
                  } catch (e) {
                    console.error('Failed to link by email:', e);
                    alert(e?.message || 'Failed to link by email');
                  }
                }} 
                disabled={!linkChildEmail}
                sx={{
                  backgroundColor: '#8FA998',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#7D9786',
                    boxShadow: '0 4px 12px rgba(143, 169, 152, 0.3)'
                  },
                  '&:disabled': {
                    backgroundColor: '#E8E6E1',
                    color: '#8FA998'
                  }
                }}
              >
                Link by Email
              </Button>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}
            >
              Enter the child’s registered email to link their account to your therapist profile.
            </Typography>
          </CardContent>
        </Card>

        {/* Children Section */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: '#3A3D42', 
            fontWeight: 'bold', 
            mb: 3,
            fontFamily: '"Outfit", "Inter", sans-serif'
          }}
        >
          Linked Children
        </Typography>
        <Grid container spacing={3} mb={4}>
          {children.length === 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  backgroundColor: 'white',
                  border: '1px solid #E8E6E1',
                  textAlign: 'center',
                  py: 4
                }}
              >
                <CardContent>
                  <Typography
                    sx={{
                      color: '#5B7C99',
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}
                  >
                    No children linked yet.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {children.map((child) => (
            <Grid item xs={12} md={6} key={child.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  backgroundColor: 'white',
                  border: '1px solid #E8E6E1',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="flex-start" gap={3}>
                    {/* Avatar */}
                    <Avatar 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        backgroundColor: '#5B7C99',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {child.name ? child.name.charAt(0).toUpperCase() : child.email.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    {/* Info */}
                    <Box flexGrow={1} minWidth={0}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: '#3A3D42',
                          fontFamily: '"Outfit", "Inter", sans-serif',
                          mb: 1,
                          wordBreak: 'break-word'
                        }}
                      >
                        {child.name || child.email}
                      </Typography>
                      {child.email && (
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: '#5B7C99',
                            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                            mb: 2,
                            wordBreak: 'break-word'
                          }}
                        >
                          {child.email}
                        </Typography>
                      )}
                      
                      <Button 
                        onClick={() => navigate(`/therapist/child/${child.id}`)}
                        variant="contained"
                        sx={{
                          backgroundColor: '#8FA998',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          minWidth: '140px',
                          '&:hover': {
                            backgroundColor: '#7D9786',
                            boxShadow: '0 4px 12px rgba(143, 169, 152, 0.3)'
                          }
                        }}
                      >
                        View Summary
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TherapistDashboard;
