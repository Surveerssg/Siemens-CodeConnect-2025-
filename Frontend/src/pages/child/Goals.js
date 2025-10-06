import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { goalsAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  LinearProgress,
  Chip,
  Checkbox,
  FormControlLabel,
  Badge
} from '@mui/material';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle, 
  Circle,
  Star,
  Trophy,
  Calendar,
  User
} from 'lucide-react';

const Goals = () => {
  const { gameProgress } = useGame();
  const navigate = useNavigate();
  
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const toDateAny = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'string' || typeof v === 'number') {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    if (v.seconds) return new Date(v.seconds * 1000);
    if (v._seconds) return new Date(v._seconds * 1000);
    return null;
  };

  useEffect(() => {
    const loadAssignedGoals = async () => {
      try {
        setLoading(true);
        const res = await goalsAPI.listMyAssigned();
        const mapped = (res.data || []).map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          target: g.targetValue || 1,
          current: g.progress || 0,
          type: 'assigned',
          completed: g.status === 'completed',
          xp: g.xpReward || 0,
          dueDate: toDateAny(g.dueDate),
          createdAt: toDateAny(g.createdAt),
          assignedBy: g.assignedByRole || 'parent',
          parentGoalId: g.parentGoalId
        }));
        setGoals(mapped);
      } catch (e) {
        console.error('Failed to load assigned goals:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAssignedGoals();
  }, []);

  const handleGoalToggle = async (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newCompleted = !goal.completed;
    const newProgress = newCompleted ? goal.target : 0;
    
    try {
      await goalsAPI.updateMyAssignedProgress(goalId, { 
        status: newCompleted ? 'completed' : 'active', 
        progress: newProgress 
      });
      
      setGoals(goals.map(g => 
        g.id === goalId ? { 
          ...g, 
          completed: newCompleted, 
          current: newProgress 
        } : g
      ));
    } catch (e) {
      console.error('Failed to update goal progress:', e);
    }
  };

  const formatDate = (d) => {
    try {
      const date = typeof d === 'string' ? new Date(d) : d;
      if (!date) return null;
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

  const getGoalTypeColor = (type) => {
    switch (type) {
      case 'assigned': return '#FF6B6B';
      case 'daily': return '#4ECDC4';
      case 'weekly': return '#9B59B6';
      default: return '#95A5A6';
    }
  };

  const getGoalTypeIcon = (type) => {
    switch (type) {
      case 'assigned': return '👨‍👦';
      case 'daily': return '📅';
      case 'weekly': return '📊';
      default: return '🎯';
    }
  };

  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const assignedGoals = goals.filter(goal => goal.type === 'assigned');

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
        <Typography>Loading goals...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/dashboard')}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
          My Goals 🎯
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)', color: 'white', textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Target size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Goals Completed
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
              {completedGoals}/{totalGoals}
            </Typography>
            <Typography variant="body2">
              {Math.round(completionRate)}% Complete
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#4ECDC4' }}>
              <Star size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Total XP Earned
            </Typography>
            <Typography variant="h2" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
              {goals.filter(g => g.completed).reduce((sum, goal) => sum + goal.xp, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">From completed goals</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#9B59B6' }}>
              <Trophy size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Assigned Goals
            </Typography>
            <Typography variant="h2" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
              {assignedGoals.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">From parents</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Assigned Goals Section */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>
          <User size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Parent-Assigned Goals
        </Typography>
        
        {assignedGoals.length === 0 ? (
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No goals assigned yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your parents will assign goals for you to complete!
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {assignedGoals.map(goal => (
              <Grid item xs={12} md={6} key={goal.id}>
                <Card 
                  sx={{ 
                    border: goal.completed ? '2px solid #4CAF50' : '2px solid #FF6B6B',
                    background: goal.completed ? 'linear-gradient(135deg, #E8F5E8, #F1F8E9)' : 'linear-gradient(135deg, #FFF, #F8F9FA)',
                    position: 'relative'
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="flex-start" mb={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={goal.completed}
                            onChange={() => handleGoalToggle(goal.id)}
                            icon={<Circle size={24} />}
                            checkedIcon={<CheckCircle size={24} />}
                            sx={{ color: goal.completed ? '#4CAF50' : '#FF6B6B' }}
                          />
                        }
                        label=""
                      />
                      <Box flexGrow={1}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Typography variant="h6" sx={{ 
                            color: goal.completed ? '#4CAF50' : '#2C3E50', 
                            textDecoration: goal.completed ? 'line-through' : 'none' 
                          }}>
                            {goal.title}
                          </Typography>
                          <Chip 
                            label={getGoalTypeIcon(goal.type)} 
                            size="small" 
                            sx={{ 
                              ml: 1, 
                              background: getGoalTypeColor(goal.type), 
                              color: 'white', 
                              fontWeight: 'bold' 
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {goal.description}
                        </Typography>
                        
                        <Box mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Progress: {goal.current}/{goal.target}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {goal.xp} XP
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(goal.current / goal.target) * 100} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4, 
                              backgroundColor: 'rgba(255, 107, 107, 0.2)', 
                              '& .MuiLinearProgress-bar': { 
                                background: `linear-gradient(90deg, ${getGoalTypeColor(goal.type)}, ${getGoalTypeColor(goal.type)}CC)`, 
                                borderRadius: 4 
                              } 
                            }} 
                          />
                        </Box>

                        {goal.createdAt && (
                          <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                            <Calendar size={16} style={{ marginRight: 8, color: '#666' }} />
                            <Typography variant="caption" color="text.secondary">
                              Assigned: {formatDate(goal.createdAt)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Goals;