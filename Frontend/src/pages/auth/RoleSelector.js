import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import { Mic, Users, Hospital, ArrowRight, User, Heart, Star } from 'lucide-react';

const RoleSelector = () => {
  const roles = [
    {
      id: 'child',
      title: 'I\'m a Child',
      description: 'Practice speaking with fun games and activities!',
      icon: <Mic size={48} color="#5B7C99" />,
      color: '#5B7C99',
      link: '/signup/child',
      emoji: '👶'
    },
    {
      id: 'parent',
      title: 'I\'m a Parent',
      description: 'Track your child\'s progress and support their journey!',
      icon: <Users size={48} color="#8FA998" />,
      color: '#8FA998',
      link: '/signup/parent',
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      id: 'therapist',
      title: 'I\'m a Therapist',
      description: 'Monitor progress and provide professional guidance!',
      icon: <Hospital size={48} color="#C67B5C" />,
      color: '#C67B5C',
      link: '/signup/therapist',
      emoji: '👩‍⚕️'
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container
        maxWidth="lg"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          position: 'relative',
          zIndex: 10,
          py: 6,
          overflowY: 'auto'
        }}
      >
        <Box width="100%">
          {/* Header */}
          <Box textAlign="center" mb={7}>
            <Box sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 2,
            }}>
              <Typography variant="h2" component="h1" sx={{ 
                color: '#3A3D42',
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontFamily: '"Outfit", "Inter", sans-serif',
                textAlign: 'center'
              }}>
                Welcome to SpeakUp 🎤
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ 
              maxWidth: 580, 
              mx: 'auto',
              color: '#5B7C99',
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.15rem' },
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              Choose your role to get started on your speech practice journey
            </Typography>
          </Box>

          {/* Role Cards */}
          <Grid container spacing={3} justifyContent="center" sx={{ position: 'relative', zIndex: 15, mb: 5 }}>
            {roles.map((role) => (
              <Grid item xs={12} sm={6} md={4} key={role.id} sx={{ display: 'flex' }}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'white',
                    border: '1px solid #E8E6E1',
                    borderRadius: 3,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 15,
                    pointerEvents: 'auto',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                      border: `1px solid ${role.color}`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', flexGrow: 1, p: 4, pb: 2 }}>
                    <Box mb={2.5} sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1.5
                    }}>
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: `${role.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        mb: 1,
                        border: `2px solid ${role.color}20`
                      }}>
                        {role.emoji}
                      </Box>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        backgroundColor: `${role.color}10`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${role.color}20`
                      }}>
                        {role.icon}
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ 
                      color: '#3A3D42',
                      fontWeight: 600,
                      mb: 1.5,
                      fontSize: '1.5rem',
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      {role.title}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      color: '#5B7C99',
                      fontWeight: 400,
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}>
                      {role.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      component={Link}
                      to={role.link}
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowRight size={18} />}
                      sx={{
                        height: 50,
                        fontSize: '1rem',
                        fontWeight: 600,
                        backgroundColor: role.color,
                        borderRadius: 2,
                        position: 'relative',
                        zIndex: 20,
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                        textTransform: 'none',
                        boxShadow: 'none',
                        letterSpacing: '0.01em',
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                        '&:hover': {
                          backgroundColor: role.color,
                          filter: 'brightness(0.9)',
                          boxShadow: `0 6px 20px -6px ${role.color}40`,
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      Get Started
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Features Section */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" sx={{ p: 3 }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#5B7C9915',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid #5B7C9920'
                }}>
                  <Star size={28} color="#5B7C99" />
                </Box>
                <Typography variant="h6" sx={{ 
                  color: '#3A3D42',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Expert Designed
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                }}>
                  Activities created by speech therapy professionals
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" sx={{ p: 3 }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#8FA99815',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid #8FA99820'
                }}>
                  <Heart size={28} color="#8FA998" />
                </Box>
                <Typography variant="h6" sx={{ 
                  color: '#3A3D42',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Child-Friendly
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                }}>
                  Engaging games that make learning fun
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box textAlign="center" sx={{ p: 3 }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#C67B5C15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid #C67B5C20'
                }}>
                  <User size={28} color="#C67B5C" />
                </Box>
                <Typography variant="h6" sx={{ 
                  color: '#3A3D42',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                  fontWeight: 600,
                  mb: 1
                }}>
                  Progress Tracking
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                }}>
                  Monitor improvement with detailed analytics
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Login Link */}
          <Box textAlign="center" mt={4}>
            <Typography variant="body1" sx={{ 
              color: '#5B7C99', 
              fontSize: '0.95rem',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              Already have an account?{' '}
              <Button 
                component={Link} 
                to="/login"
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
                Sign in here
              </Button>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RoleSelector;