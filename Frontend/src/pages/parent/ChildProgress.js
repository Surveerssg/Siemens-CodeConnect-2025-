import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Star,
  Target,
  Award,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ChildProgress = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await parentAPI.listChildren();
        const list = (res.data || []).map(c => ({ value: c.id, label: c.name || c.email || c.id }));
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].value);
      } catch (e) {
        console.error('Failed to load children:', e);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedChild) return;
      try {
        setLoading(true);
        const res = await parentAPI.getChildSummary(selectedChild);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [selectedChild]);

  // Mock data for charts and additional metrics
  const weeklyProgressData = [
    { day: 'Mon', score: 75, words: 12 },
    { day: 'Tue', score: 82, words: 15 },
    { day: 'Wed', score: 68, words: 10 },
    { day: 'Thu', score: 91, words: 18 },
    { day: 'Fri', score: 88, words: 16 },
    { day: 'Sat', score: 95, words: 20 },
    { day: 'Sun', score: 78, words: 14 }
  ];

  const activityDistribution = [
    { name: 'Practice', value: 60, color: '#8FA998' },
    { name: 'Games', value: 25, color: '#5B7C99' },
    { name: 'Assessments', value: 15, color: '#C67B5C' }
  ];

  // Calculate stats from summary data (use same mapping as other pages)
  const totalXP = Number(summary?.games?.Total_XP || summary?.games?.Total_XP_Earned || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || summary?.progress?.Practice_Days || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : (summary?.progress?.Average_Score || 0);
  const bestScore = summary?.progress?.Best_Score || summary?.games?.Best_Score || totalXP;
  const practiceDays = totalDays || summary?.progress?.Practice_Days || 0;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;
  const selectedChildData = children.find(child => child.value === selectedChild);

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate('/parent')}
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
            Progress Tracking 📈
          </Typography>
        </Box>

        {/* Child Selector */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                color: '#5B7C99'
              }}>
                Select Child
              </InputLabel>
              <Select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                label="Select Child"
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
                {children.map((child) => (
                  <MenuItem 
                    key={child.value} 
                    value={child.value}
                    sx={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif' }}
                  >
                    {child.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <Box textAlign="center" py={4}>
            <Typography sx={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
            }}>
              Loading progress data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Level Progress Card */}
            {selectedChildData && (
              <Card sx={{ 
                mb: 4,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                backgroundColor: 'white',
                border: '1px solid #E8E6E1'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      backgroundColor: '#5B7C99', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {selectedChildData.label.charAt(0).toUpperCase()}
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="h5" sx={{ 
                        color: '#3A3D42',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {selectedChildData.label}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: '#5B7C99',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontWeight: 600,
                        mb: 2
                      }}>
                        Level {currentLevel} • {totalXP} XP Total
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={levelProgress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: '#E8E6E1',
                          '& .MuiLinearProgress-bar': { 
                            backgroundColor: '#8FA998',
                            borderRadius: 4
                          }
                        }} 
                      />
                      <Typography variant="body2" sx={{ 
                        mt: 1, 
                        color: '#5B7C99',
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                        fontWeight: 600
                      }}>
                        {1000 - (totalXP % 1000)} XP to Level {currentLevel + 1}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} mb={4}>
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
                  <TrendingUp size={32} color="#8FA998" style={{ margin: '0 auto 12px' }} />
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#8FA998',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontWeight: 600
                  }}>
                    Average Score
                  </Typography>
                  <Typography variant="h2" sx={{ 
                    color: '#8FA998', 
                    fontWeight: 'bold',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    mb: 1
                  }}>
                    {avgScore}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#8FA998',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Per session
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
                  <Award size={32} color="#C67B5C" style={{ margin: '0 auto 12px' }} />
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#C67B5C',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontWeight: 600
                  }}>
                    Best Score
                  </Typography>
                  <Typography variant="h2" sx={{ 
                    color: '#C67B5C', 
                    fontWeight: 'bold',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    mb: 1
                  }}>
                    {bestScore}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#C67B5C',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Highest achievement
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
                  <Calendar size={32} color="#5B7C99" style={{ margin: '0 auto 12px' }} />
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: '#5B7C99',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    fontWeight: 600
                  }}>
                    Practice Days
                  </Typography>
                  <Typography variant="h2" sx={{ 
                    color: '#5B7C99', 
                    fontWeight: 'bold',
                    fontFamily: '"Outfit", "Inter", sans-serif',
                    mb: 1
                  }}>
                    {practiceDays}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#5B7C99',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    This month
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={8}>
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
                      Weekly Progress
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyProgressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" />
                        <XAxis 
                          dataKey="day" 
                          stroke="#5B7C99"
                          tick={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', fill: '#5B7C99' }}
                        />
                        <YAxis 
                          stroke="#5B7C99"
                          tick={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif', fill: '#5B7C99' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: 8,
                            border: '1px solid #E8E6E1',
                            fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#8FA998" 
                          strokeWidth={3}
                          dot={{ fill: '#8FA998', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, fill: '#C67B5C' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  backgroundColor: 'white',
                  border: '1px solid #E8E6E1'
                }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom sx={{ 
                      color: '#3A3D42',
                      fontWeight: 'bold',
                      mb: 3,
                      fontFamily: '"Outfit", "Inter", sans-serif'
                    }}>
                      Activity Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={activityDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {activityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Additional Metrics */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
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
                      Words Mastered
                    </Typography>
                    <Box textAlign="center" py={2}>
                      <Typography variant="h2" sx={{ 
                        color: '#5B7C99',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {summary?.progress?.Words_Learned || 0}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#5B7C99',
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                      }}>
                        Total words successfully practiced
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
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
                      Current Streak
                    </Typography>
                    <Box textAlign="center" py={2}>
                      <Typography variant="h2" sx={{ 
                        color: '#C67B5C',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {summary?.progress?.Current_Streak || 0}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: '#C67B5C',
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                      }}>
                        Consecutive days of practice
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default ChildProgress;