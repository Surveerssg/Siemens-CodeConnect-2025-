import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalsAPI } from '../../services/api';
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

  const handleAddGoal = async () => {
    if (newGoal.child && newGoal.title && newGoal.target) {
      try {
        const payload = {
          childId: newGoal.child, // expect child's uid
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

      {/* Create New Goal & Current Goals sections remain the same */}

      {/* Goal Statistics section remains the same */}
    </Container>
  );
};

export default AssignGoals;
