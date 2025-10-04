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
      icon: <Mic size={60} color="#FF6B6B" />,
      color: '#FF6B6B',
      link: '/signup/child',
      emoji: '👶'
    },
    {
      id: 'parent',
      title: 'I\'m a Parent',
      description: 'Track your child\'s progress and support their journey!',
      icon: <Users size={60} color="#4ECDC4" />,
      color: '#4ECDC4',
      link: '/signup/parent',
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      id: 'therapist',
      title: 'I\'m a Therapist',
      description: 'Monitor progress and provide professional guidance!',
      icon: <Hospital size={60} color="#9B59B6" />,
      color: '#9B59B6',
      link: '/signup/therapist',
      emoji: '👩‍⚕️'
    }
  ];

  return (
    <div className="floating-letters">
      {[...Array(15)].map((_, i) => (
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
      
      <Container maxWidth="lg" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        py: 4
      }}>
        <Box width="100%">
          <Box textAlign="center" mb={6}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              🎤 Welcome to SpeakUp!
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Choose your role to get started on your speech practice journey
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center" sx={{ position: 'relative', zIndex: 15 }}>
            {roles.map((role) => (
              <Grid item xs={12} sm={6} md={4} key={role.id} sx={{ display: 'flex' }}>
                <Card 
                  className="game-card"
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: `linear-gradient(135deg, ${role.color}15, ${role.color}05)`,
                    border: `2px solid ${role.color}30`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 15,
                    pointerEvents: 'auto',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      border: `3px solid ${role.color}`,
                      boxShadow: `0 20px 40px ${role.color}30`
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', flexGrow: 1, p: 4 }}>
                    <Box mb={2}>
                      <Typography variant="h1" sx={{ fontSize: '4rem', mb: 1 }}>
                        {role.emoji}
                      </Typography>
                      {role.icon}
                    </Box>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ 
                      color: role.color,
                      fontWeight: 'bold'
                    }}>
                      {role.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ 
                      fontSize: '1.1rem',
                      lineHeight: 1.6
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
                      endIcon={<ArrowRight size={20} />}
                      sx={{
                        height: 56,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${role.color}, ${role.color}CC)`,
                        borderRadius: 3,
                        position: 'relative',
                        zIndex: 20,
                        pointerEvents: 'auto',
                        cursor: 'pointer',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${role.color}CC, ${role.color})`,
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

          <Box textAlign="center" mt={6}>
            <Typography variant="body1" color="text.secondary">
              Already have an account?{' '}
              <Button 
                component={Link} 
                to="/login"
                sx={{ 
                  color: '#4ECDC4', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                Sign in here!
              </Button>
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default RoleSelector;
