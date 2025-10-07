import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentGoalsAPI, therapistAPI } from '../../services/api';
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
  Award,
  TrendingUp,
  Star
} from 'lucide-react';

const TherapistGoals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [therapistGoals, setTherapistGoals] = useState([]);
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
    let mounted = true;
    const loadChildrenAndGoals = async () => {
      try {
        if (mounted) setLoading(true);
        // Load children
        const childrenRes = await therapistAPI.listChildren();
        if (!mounted) return;
        setChildren(childrenRes.data || []);

        // Load existing therapist goals (with attached assigned goal info)
        const goalsRes = await parentGoalsAPI.list();
        if (!mounted) return;
        // Normalize to ensure assignedStatus fields exist
        const normalized = (goalsRes.data || []).map(g => ({
          ...g,
          assignedStatus: g.assignedStatus || null,
          assignedProgress: typeof g.assignedProgress !== 'undefined' ? g.assignedProgress : null
        }));
        setTherapistGoals(normalized);
      } catch (e) {
        console.error('Failed to load data:', e);
        if (mounted) setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial load
    loadChildrenAndGoals();

    // Poll for updates every 8 seconds so therapist sees status changes
    const pollInterval = setInterval(() => {
      loadChildrenAndGoals();
    }, 8000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
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
        id: res.data.therapistGoalId, 
        ...payload,
        createdAt: new Date(),
        status: 'active'
      };
      
      setTherapistGoals(prev => [createdGoal, ...prev]);
      
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
      setTherapistGoals(prev => prev.filter(goal => goal.id !== goalId));
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

  const getDisplayedStatus = (goal) => {
    // If an assigned status exists for the child, prefer it (completed/active)
    if (goal.assignedStatus) return goal.assignedStatus;
    return goal.status || 'active';
  };

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/therapist')}
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
            Assign Goals to Children 🎯
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ 
            mb: 3,
            borderRadius: 2,
            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
          }}>
            {message.text}
          </Alert>
        )}

        {/* Create New Goal */}
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          backgroundColor: 'white',
          border: '1px solid #E8E6E1'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              color: '#3A3D42',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Plus size={24} style={{ marginRight: 12 }} />
              Create New Goal
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
  <FormControl fullWidth>
    <InputLabel 
      shrink={Boolean(newGoal.children_email)}
      sx={{
        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
        color: '#5B7C99',
        backgroundColor: 'white',
        paddingLeft: '4px',
        paddingRight: '4px'
      }}
    >
      Select Child *
    </InputLabel>
    <Select 
      value={newGoal.children_email} 
      onChange={(e) => handleInputChange('children_email', e.target.value)}
      label="Select Child *"
      displayEmpty
      renderValue={(selected) => {
        if (!selected) {
          return (
            <span style={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
            }}>
              Select Child *
            </span>
          );
        }
        const selectedChild = childOptions.find(opt => opt.value === selected);
        return selectedChild ? selectedChild.label : selected;
      }}
      sx={{
        borderRadius: 2,
        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#E8E6E1',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#5B7C99',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#5B7C99',
        },
      }}
    >
      {childOptions.map(opt => (
        <MenuItem 
          key={opt.value} 
          value={opt.value}
          sx={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif' }}
        >
          <Box display="flex" alignItems="center">
            <User size={16} style={{ marginRight: 8, color: '#5B7C99' }} />
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
                  sx={{
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
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Description" 
                  multiline
                  rows={2}
                  value={newGoal.description} 
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  sx={{
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
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth 
                  type="number" 
                  label="Target Value *" 
                  value={newGoal.target} 
                  onChange={(e) => handleInputChange('target', e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{
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
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField 
                  fullWidth 
                  type="number" 
                  label="XP Reward" 
                  value={newGoal.xp_reward} 
                  onChange={(e) => handleInputChange('xp_reward', e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{
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
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button 
                  variant="contained" 
                  onClick={handleAssignGoal} 
                  disabled={!newGoal.children_email || !newGoal.title || !newGoal.target}
                  sx={{ 
                    height: '56px', 
                    width: '100%',
                    backgroundColor: '#8FA998',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                    borderRadius: 2,
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
                  Assign Goal
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Assigned Goals List */}
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          backgroundColor: 'white',
          border: '1px solid #E8E6E1'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              color: '#3A3D42',
              fontFamily: '"Outfit", "Inter", sans-serif',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Target size={24} style={{ marginRight: 12 }} />
              Your Assigned Goals ({therapistGoals.length})
            </Typography>

            {therapistGoals.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" sx={{ 
                  color: '#5B7C99',
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                }}>
                  No goals assigned yet. Create your first goal above!
                </Typography>
              </Box>
            ) : (
              <Box>
                {therapistGoals.map(goal => (
                  <Card 
                    key={goal.id} 
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2,
                      border: '1px solid #E8E6E1',
                      backgroundColor: '#FAF8F5',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" sx={{ 
                            color: '#3A3D42', 
                            mb: 1,
                            fontFamily: '"Outfit", "Inter", sans-serif',
                            fontWeight: 600
                          }}>
                            {goal.title}
                          </Typography>
                          
                          {goal.description && (
                            <Typography variant="body2" sx={{ 
                              color: '#5B7C99',
                              mb: 1,
                              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                            }}>
                              {goal.description}
                            </Typography>
                          )}
                          
                          <Box display="flex" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                            <Chip 
                              icon={<User size={14} color="#5B7C99" />}
                              label={getChildName(goal.children_email)} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                fontWeight: 600,
                                color: '#5B7C99',
                                borderColor: '#5B7C99',
                                borderRadius: 1
                              }}
                            />
                            <Chip 
                              icon={<Target size={14} color="#8FA998" />}
                              label={`Target: ${goal.target}`} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                fontWeight: 600,
                                color: '#8FA998',
                                borderColor: '#8FA998',
                                borderRadius: 1
                              }}
                            />
                            <Chip 
                              icon={<Award size={14} color="#C67B5C" />}
                              label={`${goal.xp_reward} XP`} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                fontWeight: 600,
                                color: '#C67B5C',
                                borderColor: '#C67B5C',
                                borderRadius: 1
                              }}
                            />
                            <Chip 
                              label={getDisplayedStatus(goal)} 
                              size="small" 
                              sx={{ 
                                backgroundColor: getDisplayedStatus(goal) === 'active' ? '#8FA998' : '#E8E6E1',
                                color: 'white',
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                fontWeight: 600,
                                borderRadius: 1
                              }}
                            />
                          </Box>
                          
                          <Box display="flex" alignItems="center">
                            <Calendar size={14} style={{ marginRight: 4, color: '#5B7C99' }} />
                            <Typography variant="caption" sx={{
                              color: '#5B7C99',
                              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                              fontWeight: 600
                            }}>
                              Created: {formatDate(goal.createdAt)}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Box display="flex" flexDirection="column" gap={1}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleDeleteGoal(goal.id)}
                              sx={{
                                color: '#C67B5C',
                                borderColor: '#C67B5C',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                borderRadius: 2,
                                '&:hover': {
                                  backgroundColor: '#FFE8E8',
                                  borderColor: '#C67B5C'
                                }
                              }}
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

        {/* Statistics Card */}
        {therapistGoals.length > 0 && (
          <Card sx={{ 
            mt: 4,
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
                Goals Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" sx={{ 
                      color: '#5B7C99', 
                      fontWeight: 'bold',
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      {therapistGoals.length}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#5B7C99',
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}>
                      Total Goals
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" sx={{ 
                      color: '#8FA998', 
                      fontWeight: 'bold',
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      {therapistGoals.filter(g => (g.assignedStatus ? g.assignedStatus === 'active' : g.status === 'active')).length}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#8FA998',
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}>
                      Active Goals
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" sx={{ 
                      color: '#C67B5C', 
                      fontWeight: 'bold',
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      {new Set(therapistGoals.map(g => g.children_email)).size}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#C67B5C',
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}>
                      Children with Goals
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" sx={{ 
                      color: '#5B7C99', 
                      fontWeight: 'bold',
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      {therapistGoals.reduce((sum, goal) => sum + parseInt(goal.xp_reward), 0)}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#5B7C99',
                      fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                    }}>
                      Total XP Available
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default TherapistGoals;