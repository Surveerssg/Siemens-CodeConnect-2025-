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
import { Mic, Users, Hospital, ArrowRight } from 'lucide-react';

const RoleSelector = () => {
  const roles = [
    {
      id: 'child',
      title: 'I\'m a Child',
      description: 'Practice speaking with fun games and activities!',
      icon: <Mic size={48} color="#E57373" />,
      color: '#E57373',
      link: '/signup/child',
      emoji: '👶'
    },
    {
      id: 'parent',
      title: 'I\'m a Parent',
      description: 'Track your child\'s progress and support their journey!',
      icon: <Users size={48} color="#64B5F6" />,
      color: '#64B5F6',
      link: '/signup/parent',
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      id: 'therapist',
      title: 'I\'m a Therapist',
      description: 'Monitor progress and provide professional guidance!',
      icon: <Hospital size={48} color="#9575CD" />,
      color: '#9575CD',
      link: '/signup/therapist',
      emoji: '👩‍⚕️'
    }
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' }, // top-align on small screens to allow natural scrolling
        position: 'relative',
        zIndex: 10,
        py: 6,
        overflowY: 'auto' // enable scrolling inside container
      }}
    >
      <Box width="100%">
        <Box textAlign="center" mb={7}>
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <Typography variant="h2" component="h1" sx={{ 
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: '-0.02em',
              fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
            }}>
              🎤 Welcome to SpeakUp
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ 
            maxWidth: 580, 
            mx: 'auto',
            color: '#546e7a',
            fontWeight: 400,
            lineHeight: 1.6,
            fontSize: { xs: '1rem', md: '1.15rem' }
          }}>
            Choose your role to get started on your speech practice journey
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center" sx={{ position: 'relative', zIndex: 15, mb: 5 }}>
          {roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role.id} sx={{ display: 'flex' }}>
              <Card 
                className="game-card"
                elevation={0}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  zIndex: 15,
                  pointerEvents: 'auto',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${role.color}, ${role.color}dd)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    border: `1.5px solid ${role.color}`,
                    boxShadow: `0 12px 40px -12px ${role.color}50`,
                    '&::before': {
                      opacity: 1
                    }
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
                      borderRadius: '20px',
                      background: `linear-gradient(135deg, ${role.color}15, ${role.color}08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      mb: 1
                    }}>
                      {role.emoji}
                    </Box>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      background: `${role.color}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {role.icon}
                    </Box>
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ 
                    color: '#263238',
                    fontWeight: 600,
                    mb: 1.5,
                    fontSize: '1.5rem',
                    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
                  }}>
                    {role.title}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: '#607d8b',
                    fontWeight: 400
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
                      background: role.color,
                      borderRadius: '12px',
                      position: 'relative',
                      zIndex: 20,
                      pointerEvents: 'auto',
                      cursor: 'pointer',
                      textTransform: 'none',
                      boxShadow: 'none',
                      letterSpacing: '0.01em',
                      '&:hover': {
                        background: role.color,
                        filter: 'brightness(1.1)',
                        boxShadow: `0 6px 20px -6px ${role.color}60`,
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

        <Box textAlign="center" mt={4}>
          <Typography variant="body1" sx={{ color: '#78909c', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <Button 
              component={Link} 
              to="/login"
              sx={{ 
                color: '#5C6BC0', 
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                padding: '4px 8px',
                minWidth: 'auto',
                '&:hover': {
                  background: '#5C6BC010',
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
  );
};

export default RoleSelector;
