import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  ArrowLeft, 
  TrendingUp
} from 'lucide-react';

const AssignedChildren = () => {
  const navigate = useNavigate();

  const children = [
    {
      id: 1,
      name: 'Emma Johnson',
      age: 8,
      avatar: '👧',
      level: 3,
      xp: 1250,
      streak: 5,
      lastSession: '2024-01-20',
      weeklyProgress: 85,
      totalWords: 45,
      averageScore: 78,
      phonemeAccuracy: { vowels: 85, consonants: 72, blends: 68 },
      nextSession: '2024-01-22',
      status: 'active',
      parent: 'Sarah Johnson',
      diagnosis: 'Hearing Impairment',
      goals: ['Improve vowel sounds', 'Work on consonant blends']
    },
    {
      id: 2,
      name: 'Liam Smith',
      age: 6,
      avatar: '👦',
      level: 2,
      xp: 890,
      streak: 3,
      lastSession: '2024-01-19',
      weeklyProgress: 72,
      totalWords: 32,
      averageScore: 82,
      phonemeAccuracy: { vowels: 88, consonants: 75, blends: 45 },
      nextSession: '2024-01-23',
      status: 'needs_attention',
      parent: 'Mike Smith',
      diagnosis: 'Speech Delay',
      goals: ['Focus on consonant blends', 'Improve pronunciation clarity']
    },
    {
      id: 3,
      name: 'Sophia Davis',
      age: 7,
      avatar: '👧',
      level: 4,
      xp: 2100,
      streak: 8,
      lastSession: '2024-01-20',
      weeklyProgress: 92,
      totalWords: 67,
      averageScore: 89,
      phonemeAccuracy: { vowels: 92, consonants: 88, blends: 85 },
      nextSession: '2024-01-21',
      status: 'excellent',
      parent: 'Jennifer Davis',
      diagnosis: 'Articulation Disorder',
      goals: ['Maintain current progress', 'Advanced speech patterns']
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#4CAF50';
      case 'active': return '#4ECDC4';
      case 'needs_attention': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent Progress';
      case 'active': return 'Active';
      case 'needs_attention': return 'Needs Attention';
      default: return 'Unknown';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/therapist')}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
          Assigned Children 👥
        </Typography>
      </Box>

      <Grid container spacing={4} mb={4}>
        {children.map((child) => (
          <Grid item xs={12} md={6} lg={4} key={child.id}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${getStatusColor(child.status)}15, ${getStatusColor(child.status)}05)`,
              border: `2px solid ${getStatusColor(child.status)}30`
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar 
                    sx={{ width: 60, height: 60, mr: 2, fontSize: '2rem', background: getStatusColor(child.status) }}
                  >
                    {child.avatar}
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{child.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Age {child.age} • Level {child.level}</Typography>
                    <Chip
                      label={getStatusLabel(child.status)}
                      size="small"
                      sx={{ background: getStatusColor(child.status), color: 'white', fontWeight: 'bold', mt: 1 }}
                    />
                  </Box>
                </Box>

                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Weekly Progress</Typography>
                    <Typography variant="body2">{child.weeklyProgress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={child.weeklyProgress} 
                    sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(78, 205, 196, 0.2)',
                      '& .MuiLinearProgress-bar': { background: getStatusColor(child.status), borderRadius: 4 }
                    }} 
                  />
                </Box>

                <Grid container spacing={2} mb={3}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{child.streak}</Typography>
                      <Typography variant="caption">Day Streak</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{child.totalWords}</Typography>
                      <Typography variant="caption">Words</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{child.averageScore}%</Typography>
                      <Typography variant="caption">Avg Score</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Parent:</strong> {child.parent}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Diagnosis:</strong> {child.diagnosis}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Next Session:</strong> {new Date(child.nextSession).toLocaleDateString()}
                </Typography>

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Current Goals:</strong>
                  </Typography>
                  {child.goals.map((goal, index) => (
                    <Chip
                      key={index}
                      label={goal}
                      size="small"
                      sx={{ mr: 1, mb: 1, background: '#4ECDC4', color: 'white', fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  startIcon={<TrendingUp size={16} />}
                  sx={{ color: getStatusColor(child.status), fontWeight: 'bold' }}
                  onClick={() => navigate('/therapist/analytics')}
                >
                  View Analytics
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>
            Detailed Progress Table
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Child</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Progress %</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vowels</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Consonants</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Blends</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '1rem', background: getStatusColor(child.status) }}>
                          {child.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{child.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Age {child.age}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>{child.weeklyProgress}%</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={child.weeklyProgress} 
                          sx={{ width: 60, height: 6, borderRadius: 3, backgroundColor: 'rgba(78, 205, 196, 0.2)',
                            '& .MuiLinearProgress-bar': { background: getStatusColor(child.status), borderRadius: 3 }
                          }} 
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={child.phonemeAccuracy.vowels >= 80 ? 'success.main' : 'warning.main'}>
                        {child.phonemeAccuracy.vowels}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={child.phonemeAccuracy.consonants >= 80 ? 'success.main' : 'warning.main'}>
                        {child.phonemeAccuracy.consonants}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={child.phonemeAccuracy.blends >= 80 ? 'success.main' : 'warning.main'}>
                        {child.phonemeAccuracy.blends}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(child.status)} size="small" sx={{ background: getStatusColor(child.status), color: 'white', fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" sx={{ color: getStatusColor(child.status) }} onClick={() => navigate('/therapist/analytics')}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AssignedChildren;
