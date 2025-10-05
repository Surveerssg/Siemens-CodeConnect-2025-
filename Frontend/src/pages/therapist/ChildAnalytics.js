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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { 
  ArrowLeft, 
  TrendingUp,
  Calendar,
  Star,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

const ChildAnalytics = () => {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState('emma');
  const [timeRange, setTimeRange] = useState('month');

  const children = [
    { value: 'emma', label: 'Emma Johnson (8 years old)' },
    { value: 'liam', label: 'Liam Smith (6 years old)' },
    { value: 'sophia', label: 'Sophia Davis (7 years old)' }
  ];

  const timeRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const progressData = {
    emma: {
      weekly: [
        { day: 'Mon', score: 75, words: 3, time: 15, vowels: 80, consonants: 70, blends: 65 },
        { day: 'Tue', score: 82, words: 4, time: 20, vowels: 85, consonants: 75, blends: 70 },
        { day: 'Wed', score: 68, words: 2, time: 12, vowels: 75, consonants: 65, blends: 60 },
        { day: 'Thu', score: 91, words: 5, time: 25, vowels: 90, consonants: 85, blends: 80 },
        { day: 'Fri', score: 88, words: 4, time: 18, vowels: 88, consonants: 82, blends: 78 },
        { day: 'Sat', score: 95, words: 6, time: 30, vowels: 95, consonants: 90, blends: 85 },
        { day: 'Sun', score: 78, words: 3, time: 16, vowels: 80, consonants: 75, blends: 70 }
      ],
      monthly: [
        { week: 'Week 1', score: 78, words: 20, time: 120, vowels: 80, consonants: 72, blends: 68 },
        { week: 'Week 2', score: 82, words: 25, time: 150, vowels: 85, consonants: 78, blends: 72 },
        { week: 'Week 3', score: 85, words: 28, time: 165, vowels: 88, consonants: 82, blends: 75 },
        { week: 'Week 4', score: 88, words: 30, time: 180, vowels: 90, consonants: 85, blends: 80 }
      ],
      stats: {
        totalWords: 103,
        averageScore: 83,
        totalTime: 615,
        streak: 5,
        level: 3,
        xp: 1250,
        improvement: 12
      }
    }
  };

  const currentData = progressData[selectedChild]?.[timeRange] || progressData.emma.weekly;
  const currentStats = progressData[selectedChild]?.stats || progressData.emma.stats;

  const phonemeData = [
    { subject: 'Vowels', A: 85, B: 80, fullMark: 100 },
    { subject: 'Consonants', A: 72, B: 75, fullMark: 100 },
    { subject: 'Blends', A: 68, B: 70, fullMark: 100 },
    { subject: 'Diphthongs', A: 75, B: 78, fullMark: 100 },
    { subject: 'Syllables', A: 80, B: 82, fullMark: 100 }
  ];

  const difficultyData = [
    { name: 'Easy', value: 45, color: '#4CAF50' },
    { name: 'Medium', value: 35, color: '#FF9800' },
    { name: 'Hard', value: 20, color: '#F44336' }
  ];

  const recommendations = [
    {
      category: 'Vowel Sounds',
      priority: 'High',
      description: 'Focus on long vowel sounds (a, e, i, o, u) as accuracy is below target',
      exercises: ['Vowel matching games', 'Tongue positioning exercises', 'Mirror practice']
    },
    {
      category: 'Consonant Blends',
      priority: 'Medium',
      description: 'Continue working on consonant blends (bl, cl, fl) with structured practice',
      exercises: ['Blend repetition drills', 'Word building activities', 'Phoneme isolation']
    },
    {
      category: 'Pronunciation Clarity',
      priority: 'Low',
      description: 'Overall pronunciation is improving well, maintain current practice routine',
      exercises: ['Daily practice sessions', 'Recording and playback', 'Peer interaction']
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#9E9E9E';
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
          Child Analytics 📊
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Child</InputLabel>
            <Select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
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
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
              sx={{ borderRadius: 3 }}
            >
              {timeRanges.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={4} mb={4}>
        {[
          { title: 'Average Score', value: `${currentStats.averageScore}%`, icon: <TrendingUp size={24} />, color: '#FF6B6B', subtitle: `+${currentStats.improvement}% from last period` },
          { title: 'Total Words', value: currentStats.totalWords, icon: <Calendar size={24} />, color: '#4ECDC4', subtitle: 'Words practiced' },
          { title: 'Current Level', value: currentStats.level, icon: <Star size={24} />, color: '#9B59B6', subtitle: `Level ${currentStats.level}` },
          { title: 'Improvement', value: `+${currentStats.improvement}%`, icon: <BarChart3 size={24} />, color: '#F39C12', subtitle: 'Since last period' }
        ].map((stat, idx) => (
          <Grid item xs={12} md={3} key={idx}>
            <Card className="game-card" sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: stat.color }}>
                {stat.icon} {stat.title}
              </Typography>
              <Typography variant="h2" sx={{ color: stat.color, fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">{stat.subtitle}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={8}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Progress Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#4ECDC4" strokeWidth={3} name="Overall Score" dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 6 }} />
                  <Line type="monotone" dataKey="vowels" stroke="#FF6B6B" strokeWidth={2} name="Vowels" dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="consonants" stroke="#9B59B6" strokeWidth={2} name="Consonants" dot={{ fill: '#9B59B6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="blends" stroke="#F39C12" strokeWidth={2} name="Blends" dot={{ fill: '#F39C12', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Phoneme Accuracy
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={phonemeData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Current" dataKey="A" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.3} />
                  <Radar name="Target" dataKey="B" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Difficulty Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="game-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2C3E50', mb: 3 }}>
                Words Per Session
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="words" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h4" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>
        AI-Powered Recommendations
      </Typography>

      <Grid container spacing={3}>
        {recommendations.map((rec, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card className="game-card" sx={{ border: `2px solid ${getPriorityColor(rec.priority)}30`, background: `linear-gradient(135deg, ${getPriorityColor(rec.priority)}15, ${getPriorityColor(rec.priority)}05)` }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ color: '#2C3E50', fontWeight: 'bold', flexGrow: 1 }}>
                    {rec.category}
                  </Typography>
                  <Chip label={rec.priority} size="small" sx={{ background: getPriorityColor(rec.priority), color: 'white', fontWeight: 'bold' }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {rec.description}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Recommended Exercises:
                </Typography>
                {rec.exercises.map((exercise, idx) => (
                  <Typography key={idx} variant="caption" display="block" sx={{ mb: 0.5 }}>
                    • {exercise}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ChildAnalytics;
