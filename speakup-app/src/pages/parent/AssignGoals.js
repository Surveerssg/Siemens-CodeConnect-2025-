import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Target, 
  Plus,
  Save,
  Calendar,
  Star
} from 'lucide-react';

const AssignGoals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([
    {
      id: 1,
      child: 'emma',
      title: 'Practice 5 words daily',
      description: 'Complete 5 word practice sessions each day',
      target: 5,
      type: 'daily',
      xp: 50,
      active: true,
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    {
      id: 2,
      child: 'liam',
      title: 'Achieve 80% accuracy',
      description: 'Maintain 80% or higher accuracy in practice sessions',
      target: 80,
      type: 'weekly',
      xp: 100,
      active: true,
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    }
  ]);

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

  const children = [
    { value: 'emma', label: 'Emma (8 years old)' },
    { value: 'liam', label: 'Liam (6 years old)' }
  ];

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

  const handleAddGoal = () => {
    if (newGoal.child && newGoal.title && newGoal.target) {
      const goal = {
        ...newGoal,
        id: Date.now(),
        target: parseInt(newGoal.target)
      };
      setGoals(prev => [...prev, goal]);
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
    <div className="floating-letters">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            fontSize: `${Math.random() * 1.5 + 0.8}rem`
          }}
        >
          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
        </div>
      ))}
      
      <Container maxWidth="lg" sx={{ 
        minHeight: '100vh',
        position: 'relative',
        zIndex: 2,
        py: 4
      }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/parent')}
            sx={{ color: '#4ECDC4', mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold'
          }}>
            Assign Goals 🎯
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card className="game-card">
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#2C3E50',
                  fontWeight: 'bold',
                  mb: 3
                }}>
                  Create New Goal
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Child</InputLabel>
                      <Select
                        value={newGoal.child}
                        onChange={(e) => handleInputChange('child', e.target.value)}
                        label="Select Child"
                        sx={{ borderRadius: 3 }}
                      >
                        {children.map((child) => (
                          <MenuItem key={child.value} value={child.value}>
                            {child.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Goal Title"
                      value={newGoal.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={newGoal.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      multiline
                      rows={2}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Target Value"
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => handleInputChange('target', e.target.value)}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Goal Type</InputLabel>
                      <Select
                        value={newGoal.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        label="Goal Type"
                        sx={{ borderRadius: 3 }}
                      >
                        {goalTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="XP Reward"
                      type="number"
                      value={newGoal.xp}
                      onChange={(e) => handleInputChange('xp', e.target.value)}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newGoal.active}
                          onChange={(e) => handleInputChange('active', e.target.checked)}
                        />
                      }
                      label="Active Goal"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={newGoal.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleAddGoal}
                    className="child-friendly-button"
                    sx={{
                      background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #44A08D, #4ECDC4)',
                      }
                    }}
                  >
                    Add Goal
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card className="game-card">
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#2C3E50',
                  fontWeight: 'bold',
                  mb: 3
                }}>
                  Current Goals
                </Typography>

                <Box>
                  {goals.map((goal) => (
                    <Card 
                      key={goal.id}
                      className="game-card"
                      sx={{ 
                        mb: 2,
                        border: goal.active ? '2px solid #4ECDC4' : '2px solid #E0E0E0',
                        background: goal.active 
                          ? 'linear-gradient(135deg, #E8F5E8, #F1F8E9)' 
                          : 'linear-gradient(135deg, #F5F5F5, #EEEEEE)'
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flexGrow={1}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Typography variant="h6" sx={{ 
                                color: goal.active ? '#2C3E50' : '#9E9E9E',
                                mr: 1
                              }}>
                                {goal.title}
                              </Typography>
                              <Chip
                                label={getGoalTypeIcon(goal.type)}
                                size="small"
                                sx={{ 
                                  background: getGoalTypeColor(goal.type),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  mr: 1
                                }}
                              />
                              <Chip
                                label={`${goal.xp} XP`}
                                size="small"
                                sx={{ 
                                  background: '#4ECDC4',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {goal.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Target: {goal.target} • {children.find(c => c.value === goal.child)?.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {goal.startDate} to {goal.endDate}
                            </Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={goal.active}
                                onChange={() => handleToggleGoal(goal.id)}
                                size="small"
                              />
                            }
                            label=""
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card className="game-card" sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              mb: 3
            }}>
              Goal Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                    {goals.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Goals
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                    {goals.filter(g => g.active).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Goals
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
                    {goals.filter(g => g.type === 'daily').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily Goals
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#F39C12', fontWeight: 'bold' }}>
                    {goals.reduce((sum, goal) => sum + goal.xp, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total XP Available
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default AssignGoals;
