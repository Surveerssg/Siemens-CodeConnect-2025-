import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentGoalsAPI, parentAPI } from '../../services/api';
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
  Chip,
  LinearProgress,
  Divider,
  Alert
} from '@mui/material';
import { 
  ArrowLeft, 
  Plus,
  Calendar,
  User,
  Target,
  Award
} from 'lucide-react';

const AssignGoals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parentGoals, setParentGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '1',
    xp_reward: '25',
    children_email: ''
  });

  const [children, setChildren] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadChildrenAndGoals = async () => {
      try {
        setLoading(true);
        // Load children
        const childrenRes = await parentAPI.listChildren();
        setChildren(childrenRes.data || []);

        // Load existing parent goals
        const goalsRes = await parentGoalsAPI.list();
        setParentGoals(goalsRes.data || []);
      } catch (e) {
        console.error('Failed to load data:', e);
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    loadChildrenAndGoals();
  }, []);

  const childOptions = children.map(c => ({ 
    value: c.email || c.childEmail, 
    label: c.name || c.email || 'Unknown Child' 
  }));

  const handleInputChange = (field, value) => {
    setNewGoal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssignGoal = async () => {
    if (!newGoal.children_email || !newGoal.title || !newGoal.target) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const payload = {
        title: newGoal.title,
        description: newGoal.description,
        target: parseInt(newGoal.target),
        xp_reward: parseInt(newGoal.xp_reward),
        children_email: newGoal.children_email
      };

      const res = await parentGoalsAPI.create(payload);
      
      // Add to local state
      const createdGoal = { 
        id: res.data.parentGoalId, 
        ...payload,
        createdAt: new Date(),
        status: 'active'
      };
      
      setParentGoals(prev => [createdGoal, ...prev]);
      
      // Reset form
      setNewGoal({
        title: '',
        description: '',
        target: '1',
        xp_reward: '25',
        children_email: ''
      });
      
      setMessage({ type: 'success', text: 'Goal assigned successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      console.error('Failed to assign goal:', e);
      setMessage({ type: 'error', text: e?.response?.data?.error || 'Failed to assign goal' });
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await parentGoalsAPI.delete(goalId);
      setParentGoals(prev => prev.filter(goal => goal.id !== goalId));
      setMessage({ type: 'success', text: 'Goal deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      console.error('Failed to delete goal:', e);
      setMessage({ type: 'error', text: 'Failed to delete goal' });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChildName = (childEmail) => {
    const child = children.find(c => (c.email || c.childEmail) === childEmail);
    return child?.name || childEmail || 'Unknown Child';
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
          Assign Goals to Children 🎯
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Create New Goal */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, color: '#2C3E50' }}>
            <Plus size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Create New Goal
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="child-select-label">Select Child *</InputLabel>
                <Select 
                  labelId="child-select-label" 
                  label="Select Child *" 
                  value={newGoal.children_email} 
                  onChange={(e) => handleInputChange('children_email', e.target.value)}
                >
                  {childOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box display="flex" alignItems="center">
                        <User size={16} style={{ marginRight: 8 }} />
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Goal Title *" 
                value={newGoal.title} 
                onChange={(e) => handleInputChange('title', e.target.value)} 
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Description" 
                multiline
                rows={2}
                value={newGoal.description} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                type="number" 
                label="Target Value *" 
                value={newGoal.target} 
                onChange={(e) => handleInputChange('target', e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                type="number" 
                label="XP Reward" 
                value={newGoal.xp_reward} 
                onChange={(e) => handleInputChange('xp_reward', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button 
                variant="contained" 
                onClick={handleAssignGoal} 
                disabled={!newGoal.children_email || !newGoal.title || !newGoal.target}
                sx={{ height: '56px', width: '100%' }}
              >
                Assign Goal
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Assigned Goals List */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, color: '#2C3E50' }}>
            <Target size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Your Assigned Goals ({parentGoals.length})
          </Typography>

          {parentGoals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No goals assigned yet. Create your first goal above!
            </Typography>
          ) : (
            <Box>
              {parentGoals.map(goal => (
                <Card key={goal.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" sx={{ color: '#2C3E50', mb: 1 }}>
                          {goal.title}
                        </Typography>
                        
                        {goal.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {goal.description}
                          </Typography>
                        )}
                        
                        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                          <Chip 
                            icon={<User size={14} />}
                            label={getChildName(goal.children_email)} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<Target size={14} />}
                            label={`Target: ${goal.target}`} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<Award size={14} />}
                            label={`${goal.xp_reward} XP`} 
                            size="small" 
                            variant="outlined"
                            sx={{ color: '#FF6B6B', borderColor: '#FF6B6B' }}
                          />
                          <Chip 
                            label={goal.status} 
                            size="small" 
                            color={goal.status === 'active' ? 'success' : 'default'}
                          />
                        </Box>
                        
                        <Box display="flex" alignItems="center">
                          <Calendar size={14} style={{ marginRight: 4, color: '#666' }} />
                          <Typography variant="caption" color="text.secondary">
                            Created: {formatDate(goal.createdAt)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AssignGoals;