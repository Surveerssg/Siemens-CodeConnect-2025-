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
  User,
  Award,
  TrendingUp
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
      case 'assigned': return '#5B7C99';
      case 'daily': return '#8FA998';
      case 'weekly': return '#C67B5C';
      default: return '#5B7C99';
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
      <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography sx={{
            color: '#5B7C99',
            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
            textAlign: 'center'
          }}>
            Loading goals...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              color: '#5B7C99',
              mr: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
              '&:hover': {
                backgroundColor: '#E8E6E1'
              }
            }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#3A3D42', 
            fontWeight: 'bold',
            fontFamily: '"Outfit", "Inter", sans-serif'
          }}>
            My Goals 🎯
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: '#5B7C99', 
              color: 'white', 
              textAlign: 'center', 
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(91, 124, 153, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(91, 124, 153, 0.3)'
              }
            }}>
              <Target size={32} style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" gutterBottom sx={{
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600,
                mb: 1
              }}>
                Goals Completed
              </Typography>
              <Typography variant="h2" sx={{ 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                mb: 1
              }}>
                {completedGoals}/{totalGoals}
              </Typography>
              <Typography variant="body2" sx={{
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                opacity: 0.9
              }}>
                {Math.round(completionRate)}% Complete
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3,
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
              <Award size={32} color="#8FA998" style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#8FA998',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600,
                mb: 1
              }}>
                Total XP Earned
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#8FA998', 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                mb: 1
              }}>
                {goals.filter(g => g.completed).reduce((sum, goal) => sum + goal.xp, 0)}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#8FA998',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}>
                From completed goals
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              textAlign: 'center', 
              p: 3,
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
              <User size={32} color="#C67B5C" style={{ margin: '0 auto 12px' }} />
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#C67B5C',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600,
                mb: 1
              }}>
                Assigned Goals
              </Typography>
              <Typography variant="h2" sx={{ 
                color: '#C67B5C', 
                fontWeight: 'bold',
                fontFamily: '"Outfit", "Inter", sans-serif',
                mb: 1
              }}>
                {assignedGoals.length}
              </Typography>
              <Typography variant="body2" sx={{
                color: '#C67B5C',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}>
                From parents
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Assigned Goals Section */}
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#3A3D42', 
            fontWeight: 'bold', 
            mb: 3,
            fontFamily: '"Outfit", "Inter", sans-serif',
            display: 'flex',
            alignItems: 'center'
          }}>
            <User size={24} style={{ marginRight: 12 }} />
            Parent-Assigned Goals
          </Typography>
          
          {assignedGoals.length === 0 ? (
            <Card sx={{ 
              textAlign: 'center', 
              p: 4,
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              backgroundColor: 'white',
              border: '1px solid #E8E6E1'
            }}>
              <Typography variant="h6" sx={{
                color: '#5B7C99',
                fontFamily: '"Outfit", "Inter", sans-serif',
                fontWeight: 600
              }}>
                No goals assigned yet
              </Typography>
              <Typography variant="body2" sx={{
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                mt: 1
              }}>
                Your parents will assign goals for you to complete!
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {assignedGoals.map(goal => (
                <Grid item xs={12} md={6} key={goal.id}>
                  <Card 
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      backgroundColor: goal.completed ? '#FAF8F5' : 'white',
                      border: goal.completed ? '2px solid #8FA998' : '2px solid #5B7C99',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="flex-start" mb={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={goal.completed}
                              onChange={() => handleGoalToggle(goal.id)}
                              icon={<Circle size={24} color="#5B7C99" />}
                              checkedIcon={<CheckCircle size={24} color="#8FA998" />}
                              sx={{ 
                                color: goal.completed ? '#8FA998' : '#5B7C99',
                                '&.Mui-checked': {
                                  color: '#8FA998',
                                },
                              }}
                            />
                          }
                          label=""
                        />
                        <Box flexGrow={1}>
                          <Box display="flex" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                            <Typography variant="h6" sx={{ 
                              color: goal.completed ? '#8FA998' : '#3A3D42', 
                              fontFamily: '"Outfit", "Inter", sans-serif',
                              fontWeight: 600,
                              textDecoration: goal.completed ? 'line-through' : 'none' 
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
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                borderRadius: 1
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ 
                            color: '#5B7C99',
                            mb: 2,
                            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                          }}>
                            {goal.description}
                          </Typography>
                          
                          <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="body2" sx={{
                                color: '#5B7C99',
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                fontWeight: 600
                              }}>
                                Progress: {goal.current}/{goal.target}
                              </Typography>
                              <Typography variant="body2" sx={{
                                color: '#C67B5C',
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                fontWeight: 600
                              }}>
                                {goal.xp} XP
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(goal.current / goal.target) * 100} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4, 
                                backgroundColor: '#E8E6E1',
                                '& .MuiLinearProgress-bar': { 
                                  backgroundColor: goal.completed ? '#8FA998' : '#5B7C99',
                                  borderRadius: 4 
                                } 
                              }} 
                            />
                          </Box>

                          {goal.createdAt && (
                            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                              <Calendar size={16} style={{ marginRight: 8, color: '#5B7C99' }} />
                              <Typography variant="caption" sx={{
                                color: '#5B7C99',
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                fontWeight: 600
                              }}>
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

        {/* Progress Overview */}
        {totalGoals > 0 && (
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            backgroundColor: 'white',
            border: '1px solid #E8E6E1'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#3A3D42',
                fontWeight: 'bold',
                mb: 3,
                fontFamily: '"Outfit", "Inter", sans-serif'
              }}>
                Goal Progress Overview
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" sx={{
                    color: '#5B7C99',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontWeight: 600
                  }}>
                    Overall Completion
                  </Typography>
                  <Typography variant="h6" sx={{
                    color: '#5B7C99',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontWeight: 600
                  }}>
                    {Math.round(completionRate)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completionRate} 
                  sx={{ 
                    height: 16, 
                    borderRadius: 8,
                    backgroundColor: '#E8E6E1',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#8FA998',
                      borderRadius: 8
                    }
                  }} 
                />
                <Typography variant="body2" sx={{ 
                  mt: 1, 
                  textAlign: 'center',
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  fontWeight: 600
                }}>
                  {completedGoals} of {totalGoals} goals completed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default Goals;