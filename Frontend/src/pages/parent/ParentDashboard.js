import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parentAPI, goalsAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  TextField
} from '@mui/material';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Settings,
  LogOut,
  Play,
  Calendar,
  Star,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [childSummary, setChildSummary] = useState(null);
  const [linkChildEmail, setLinkChildEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logout successful, navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await parentAPI.listChildren();
        setChildren(res.data || []);
      } catch (e) {
        console.error('Failed to load linked children:', e);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  const loadChildSummary = async (childId) => {
    try {
      setSelectedChildId(childId);
      const res = await parentAPI.getChildSummary(childId);
      setChildSummary(res.data || null);
    } catch (e) {
      console.error('Failed to load child summary:', e);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ 
            color: '#3A3D42', 
            fontWeight: 'bold',
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontSize: { xs: '2rem', md: '2.5rem' },
            mb: 1
          }}>
            Welcome, {user?.displayName || 'Parent'}! 👨‍👩‍👧‍👦
          </Typography>
          <Typography variant="h6" sx={{
            color: '#5B7C99',
            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
            fontWeight: 400
          }}>
            Track your children's speech progress
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
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#3A3D42', 
        fontWeight: 'bold', 
        mb: 3,
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}>
        Link Your Child
      </Typography>
      <Card sx={{ 
        mb: 4,
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        backgroundColor: 'white',
        border: '1px solid #E8E6E1'
      }}>
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
                  await parentAPI.linkChildByEmail(linkChildEmail);
                  const res = await parentAPI.listChildren();
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
          <Typography variant="body2" sx={{ 
            mt: 1, 
            color: '#5B7C99',
            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
          }}>
            Enter your child's registered email address to link their account.
          </Typography>
        </CardContent>
      </Card>

      {/* Children Section */}
      <Typography variant="h4" gutterBottom sx={{ 
        color: '#3A3D42', 
        fontWeight: 'bold', 
        mb: 3,
        fontFamily: '"Outfit", "Inter", sans-serif'
      }}>
        Linked Children
      </Typography>
      <Grid container spacing={3} mb={4}>
        {children.length === 0 && (
          <Grid item xs={12}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              backgroundColor: 'white',
              border: '1px solid #E8E6E1',
              textAlign: 'center',
              py: 4
            }}>
              <CardContent>
                <Typography sx={{
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                }}>
                  No children linked yet.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

{children.map((child) => (
  <Grid item xs={12} md={6} key={child.id}>
    <Card sx={{
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      backgroundColor: 'white',
      border: '1px solid #E8E6E1',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" gap={3}>
          {/* Avatar Section */}
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
          
          {/* Text Content Section */}
          <Box flexGrow={1} minWidth={0}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              color: '#3A3D42',
              fontFamily: '"Outfit", "Inter", sans-serif',
              mb: 1,
              wordBreak: 'break-word'
            }}>
              {child.name || child.email}
            </Typography>
            {child.email && (
              <Typography variant="body2" sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                mb: 2,
                wordBreak: 'break-word'
              }}>
                {child.email}
              </Typography>
            )}
            
            {/* View Summary Button */}
            <Button 
              onClick={() => navigate(`/parent/child/${child.id}`)}
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

export default ParentDashboard;