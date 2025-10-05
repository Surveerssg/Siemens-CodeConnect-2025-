import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsAPI, parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { 
  ArrowLeft, 
  Plus
} from 'lucide-react';

const AssignGoals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  const [newGoal, setNewGoal] = useState({
    child: '',
    title: '',
    description: '',
    target: '',
    type: 'daily',
    xp: 25,
    active: true,
    startDate: '',
    endDate: ''
  });

  const [children, setChildren] = useState([]);
  const childOptions = children.map(c => ({ value: c.id, label: c.name || c.email || c.id }));

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await parentAPI.listChildren();
        setChildren(res.data || []);
      } catch (e) {
        console.error('Failed to load children:', e);
      }
    };
    loadChildren();
  }, []);

  const goalTypes = [
    { value: 'daily', label: 'Daily Goal' },
    { value: 'weekly', label: 'Weekly Goal' },
    { value: 'monthly', label: 'Monthly Goal' }
  ];

  const handleInputChange = (field, value) => {
    setNewGoal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddGoal = async () => {
    if (newGoal.child && newGoal.title && newGoal.target) {
      try {
        const payload = {
          childId: newGoal.child,
          title: newGoal.title,
          description: newGoal.description,
          targetValue: parseInt(newGoal.target),
          xpReward: parseInt(newGoal.xp),
          dueDate: newGoal.endDate || null
        };
        const res = await goalsAPI.assignToChild(payload);
        const created = { id: res.data.id, ...payload, type: newGoal.type, active: true };
        setGoals(prev => [created, ...prev]);
        setNewGoal({
          child: '',
          title: '',
          description: '',
          target: '',
          type: 'daily',
          xp: 25,
          active: true,
          startDate: '',
          endDate: ''
        });
      } catch (e) {
        console.error('Failed to assign goal:', e);
        alert(e?.message || 'Failed to assign goal');
      }
    }
  };

  const handleToggleGoal = (goalId) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, active: !goal.active }
          : goal
      )
    );
  };

  const getGoalTypeColor = (type) => {
    switch (type) {
      case 'daily': return '#FF6B6B';
      case 'weekly': return '#4ECDC4';
      case 'monthly': return '#9B59B6';
      default: return '#95A5A6';
    }
  };

  const getGoalTypeIcon = (type) => {
    switch (type) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '🏆';
      default: return '🎯';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/parent')}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
          Assign Goals 🎯
        </Typography>
      </Box>

      {/* Create New Goal */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Create New Goal</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="child-select-label">Child</InputLabel>
                <Select labelId="child-select-label" label="Child" value={newGoal.child} onChange={(e) => handleInputChange('child', e.target.value)}>
                  {childOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Title" value={newGoal.title} onChange={(e) => handleInputChange('title', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" value={newGoal.description} onChange={(e) => handleInputChange('description', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Target" value={newGoal.target} onChange={(e) => handleInputChange('target', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="XP Reward" value={newGoal.xp} onChange={(e) => handleInputChange('xp', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" onClick={handleAddGoal} disabled={!newGoal.child || !newGoal.title || !newGoal.target}>Assign Goal</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Recently Assigned (this session) */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Recently Assigned</Typography>
          {goals.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No goals assigned yet.</Typography>
          ) : (
            <Box>
              {goals.map(g => (
                <Box key={g.id} display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{g.title}</Typography>
                    <Typography variant="body2" color="text.secondary">Target: {g.targetValue} • XP: {g.xpReward}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AssignGoals;
