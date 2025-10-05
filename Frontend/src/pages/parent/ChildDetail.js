import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parentAPI, goalsAPI } from '../../services/api';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Button, LinearProgress, CardActions 
} from '@mui/material';
import { ArrowLeft, TrendingUp, Target, Award, Play } from 'lucide-react';

const ChildDetail = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await parentAPI.getChildSummary(childId);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId]);

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button startIcon={<ArrowLeft size={20} />} onClick={() => navigate('/parent')} sx={{ color: '#4ECDC4', mr: 2 }}>Back to Dashboard</Button>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>Child Overview</Typography>
      </Box>

      {/* Weekly Progress Overview */}
      <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 2 }}>Weekly Progress Overview</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          {(() => {
            const totalXP = Number(summary?.games?.Total_XP || 0);
            const totalDays = Number(summary?.progress?.Practice_Days || 0);
            const avg = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
            const best = totalXP;
            const days = totalDays;
            return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="body2">Average Score</Typography>
                <Typography variant="h4">{avg}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="body2">Best Score</Typography>
                <Typography variant="h4">{best}</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="body2">Practice Days</Typography>
                <Typography variant="h4">{days}</Typography>
              </Card>
            </Grid>
          </Grid>
            );
          })()}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 2 }}>Quick Actions</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card onClick={() => navigate('/parent/progress')} sx={{ cursor: 'pointer' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp size={32} color="#4ECDC4" />
              <Typography variant="h6" sx={{ mt: 1 }}>View Progress</Typography>
              <Typography variant="body2" color="text.secondary">See detailed progress reports</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card onClick={() => navigate('/parent/goals')} sx={{ cursor: 'pointer' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Target size={32} color="#FF6B6B" />
              <Typography variant="h6" sx={{ mt: 1 }}>Set Goals</Typography>
              <Typography variant="body2" color="text.secondary">Assign practice goals</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card onClick={() => navigate('/parent/notes')} sx={{ cursor: 'pointer' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Award size={32} color="#9B59B6" />
              <Typography variant="h6" sx={{ mt: 1 }}>Add Notes</Typography>
              <Typography variant="body2" color="text.secondary">Record observations</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities placeholder */}
      <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 2 }}>Recent Activities</Typography>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">No recent activities yet.</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ChildDetail;


