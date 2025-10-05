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

  // Removed UID linking; keep email-only linking

  const loadChildSummary = async (childId) => {
    try {
      setSelectedChildId(childId);
      const res = await parentAPI.getChildSummary(childId);
      setChildSummary(res.data || null);
    } catch (e) {
      console.error('Failed to load child summary:', e);
    }
  };

  // Removed dummy weekly data, quick actions, and recent activities

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', position: 'relative', zIndex: 2, py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ color: '#2C3E50', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
            Welcome, {user?.displayName || 'Parent'}! 👨‍👩‍👧‍👦
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Track your children's speech progress
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button startIcon={<Settings size={20} />} onClick={() => navigate('/settings')} sx={{ color: '#4ECDC4' }}>Settings</Button>
          <Button startIcon={<LogOut size={20} />} onClick={handleLogout} sx={{ color: '#FF6B6B' }}>Logout</Button>
        </Box>
      </Box>

      {/* Link Child */}
      <Typography variant="h4" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 2 }}>Link Your Child</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField label="Child Email" type="email" placeholder="child@email.com" value={linkChildEmail} onChange={(e) => setLinkChildEmail(e.target.value)} />
            <Button variant="contained" onClick={async () => {
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
            }} disabled={!linkChildEmail}>Link by Email</Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Enter your child's registered email address to link their account.</Typography>
        </CardContent>
      </Card>

      {/* Children Section */}
      <Typography variant="h4" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>Linked Children</Typography>
      <Grid container spacing={4} mb={4}>
        {children.length === 0 && (
          <Grid item xs={12}>
            <Card><CardContent><Typography>No children linked yet.</Typography></CardContent></Card>
          </Grid>
        )}
        {children.map((child) => (
          <Grid item xs={12} md={6} key={child.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{child.name || child.email}</Typography>
                    {child.email && (
                      <Typography variant="body2" color="text.secondary">{child.email}</Typography>
                    )}
                  </Box>
                  <Button onClick={() => navigate(`/parent/child/${child.id}`)}>View Summary</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Removed inline child summary display; shown on Child Detail page */}

      {/* Removed weekly progress, quick actions, and recent activities from dashboard */}
    </Container>
  );
};

export default ParentDashboard;
