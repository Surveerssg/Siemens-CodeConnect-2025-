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
  Chip,
  IconButton,
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
  Plus,
  Save,
  Edit,
  Delete,
  Calendar,
  User,
  FileText
} from 'lucide-react';

const TherapistNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([
    {
      id: 1,
      child: 'emma',
      title: 'Excellent progress with vowel sounds',
      content: 'Emma showed significant improvement in pronouncing vowel sounds today. She was able to correctly say "apple" and "elephant" with much clearer pronunciation. Her confidence has also improved noticeably.',
      date: '2024-01-20',
      type: 'progress',
      priority: 'high',
      sessionType: 'individual',
      duration: 30,
      goals: ['Improve vowel sounds', 'Build confidence']
    },
    {
      id: 2,
      child: 'liam',
      title: 'Struggling with consonant blends',
      content: 'Liam is having difficulty with consonant blends like "bl" and "cl". We should focus more on these sounds in upcoming sessions. He seems to get frustrated easily, so we need to make the exercises more engaging.',
      date: '2024-01-19',
      type: 'concern',
      priority: 'high',
      sessionType: 'individual',
      duration: 25,
      goals: ['Focus on consonant blends', 'Improve engagement']
    },
    {
      id: 3,
      child: 'sophia',
      title: 'Completed advanced exercises successfully',
      content: 'Sophia completed all advanced exercises today with 95% accuracy. She is ready to move to the next level of difficulty. Her pronunciation has improved dramatically over the past month.',
      date: '2024-01-18',
      type: 'achievement',
      priority: 'medium',
      sessionType: 'group',
      duration: 45,
      goals: ['Advanced speech patterns', 'Maintain accuracy']
    }
  ]);

  const [newNote, setNewNote] = useState({
    child: '',
    title: '',
    content: '',
    type: 'progress',
    priority: 'medium',
    sessionType: 'individual',
    duration: 30,
    goals: []
  });

  const [editingNote, setEditingNote] = useState(null);

  const children = [
    { value: 'emma', label: 'Emma Johnson (8 years old)' },
    { value: 'liam', label: 'Liam Smith (6 years old)' },
    { value: 'sophia', label: 'Sophia Davis (7 years old)' }
  ];

  const noteTypes = [
    { value: 'progress', label: 'Progress Update', color: '#4CAF50' },
    { value: 'concern', label: 'Concern', color: '#FF9800' },
    { value: 'achievement', label: 'Achievement', color: '#2196F3' },
    { value: 'observation', label: 'General Observation', color: '#9C27B0' },
    { value: 'recommendation', label: 'Recommendation', color: '#607D8B' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'high', label: 'High', color: '#F44336' }
  ];

  const sessionTypes = [
    { value: 'individual', label: 'Individual Session' },
    { value: 'group', label: 'Group Session' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'follow-up', label: 'Follow-up' }
  ];

  const handleInputChange = (field, value) => {
    if (editingNote) {
      setEditingNote(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setNewNote(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddNote = () => {
    if (newNote.child && newNote.title && newNote.content) {
      const note = {
        ...newNote,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0]
      };
      setNotes(prev => [note, ...prev]);
      setNewNote({
        child: '',
        title: '',
        content: '',
        type: 'progress',
        priority: 'medium',
        sessionType: 'individual',
        duration: 30,
        goals: []
      });
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
  };

  const handleSaveEdit = () => {
    if (editingNote) {
      setNotes(prev => 
        prev.map(note => 
          note.id === editingNote.id ? editingNote : note
        )
      );
      setEditingNote(null);
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const getTypeColor = (type) => {
    const noteType = noteTypes.find(t => t.value === type);
    return noteType ? noteType.color : '#9E9E9E';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#9E9E9E';
  };

  const getChildName = (childValue) => {
    const child = children.find(c => c.value === childValue);
    return child ? child.label : childValue;
  };

  return (
    <div className="floating-letters">
      {[...Array(6)].map((_, i) => (
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
            onClick={() => navigate('/therapist')}
            sx={{ color: '#4ECDC4', mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold'
          }}>
            Therapist Notes 📝
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card className="game-card">
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#2C3E50',
                  fontWeight: 'bold',
                  mb: 3
                }}>
                  {editingNote ? 'Edit Note' : 'Add New Note'}
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Child</InputLabel>
                      <Select
                        value={editingNote ? editingNote.child : newNote.child}
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
                      label="Note Title"
                      value={editingNote ? editingNote.title : newNote.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Note Content"
                      value={editingNote ? editingNote.content : newNote.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      multiline
                      rows={4}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Note Type</InputLabel>
                      <Select
                        value={editingNote ? editingNote.type : newNote.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        label="Note Type"
                        sx={{ borderRadius: 3 }}
                      >
                        {noteTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={editingNote ? editingNote.priority : newNote.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        label="Priority"
                        sx={{ borderRadius: 3 }}
                      >
                        {priorities.map((priority) => (
                          <MenuItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Session Type</InputLabel>
                      <Select
                        value={editingNote ? editingNote.sessionType : newNote.sessionType}
                        onChange={(e) => handleInputChange('sessionType', e.target.value)}
                        label="Session Type"
                        sx={{ borderRadius: 3 }}
                      >
                        {sessionTypes.map((type) => (
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
                      label="Duration (minutes)"
                      type="number"
                      value={editingNote ? editingNote.duration : newNote.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="center" gap={2}>
                  {editingNote ? (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<Save size={20} />}
                        onClick={handleSaveEdit}
                        className="child-friendly-button"
                        sx={{
                          background: 'linear-gradient(45deg, #4CAF50, #45A049)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #45A049, #4CAF50)',
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingNote(null)}
                        sx={{ color: '#FF6B6B' }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={handleAddNote}
                      className="child-friendly-button"
                      sx={{
                        background: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #44A08D, #4ECDC4)',
                        }
                      }}
                    >
                      Add Note
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card className="game-card">
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#2C3E50',
                  fontWeight: 'bold',
                  mb: 3
                }}>
                  All Notes ({notes.length})
                </Typography>

                <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(45deg, #4ECDC4, #44A08D)' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Child</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Priority</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notes.map((note) => (
                        <TableRow key={note.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <User size={16} style={{ marginRight: 8, color: '#4ECDC4' }} />
                              <Typography variant="body2">
                                {getChildName(note.child)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {note.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {note.content.substring(0, 50)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={noteTypes.find(t => t.value === note.type)?.label}
                              size="small"
                              sx={{ 
                                background: getTypeColor(note.type),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={priorities.find(p => p.value === note.priority)?.label}
                              size="small"
                              sx={{ 
                                background: getPriorityColor(note.priority),
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Calendar size={16} style={{ marginRight: 4, color: '#9B59B6' }} />
                              <Typography variant="body2">
                                {new Date(note.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleEditNote(note)}
                                sx={{ color: '#4ECDC4' }}
                              >
                                <Edit size={16} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteNote(note.id)}
                                sx={{ color: '#FF6B6B' }}
                              >
                                <Delete size={16} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
              Note Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                    {notes.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Notes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {notes.filter(n => n.type === 'progress').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Progress Notes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    {notes.filter(n => n.type === 'concern').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Concerns
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                    {notes.filter(n => n.type === 'achievement').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Achievements
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

export default TherapistNotes;
