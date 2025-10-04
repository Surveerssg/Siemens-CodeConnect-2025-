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
  IconButton
} from '@mui/material';
import { 
  ArrowLeft, 
  Plus,
  Save,
  Edit,
  Delete,
  Calendar,
  User
} from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([
    {
      id: 1,
      child: 'emma',
      title: 'Great progress with vowel sounds',
      content: 'Emma showed significant improvement in pronouncing vowel sounds today. She was able to correctly say "apple" and "elephant" with much clearer pronunciation.',
      date: '2024-01-20',
      type: 'progress',
      priority: 'high'
    },
    {
      id: 2,
      child: 'liam',
      title: 'Struggling with consonant blends',
      content: 'Liam is having difficulty with consonant blends like "bl" and "cl". We should focus more on these sounds in upcoming sessions.',
      date: '2024-01-19',
      type: 'concern',
      priority: 'medium'
    },
    {
      id: 3,
      child: 'emma',
      title: 'Completed first game successfully',
      content: 'Emma completed the Word Match game for the first time today! She was very excited and motivated to continue practicing.',
      date: '2024-01-18',
      type: 'achievement',
      priority: 'high'
    }
  ]);

  const [newNote, setNewNote] = useState({
    child: '',
    title: '',
    content: '',
    type: 'progress',
    priority: 'medium'
  });

  const [editingNote, setEditingNote] = useState(null);

  const children = [
    { value: 'emma', label: 'Emma (8 years old)' },
    { value: 'liam', label: 'Liam (6 years old)' }
  ];

  const noteTypes = [
    { value: 'progress', label: 'Progress Update', color: '#4CAF50' },
    { value: 'concern', label: 'Concern', color: '#FF9800' },
    { value: 'achievement', label: 'Achievement', color: '#2196F3' },
    { value: 'observation', label: 'General Observation', color: '#9C27B0' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#4CAF50' },
    { value: 'medium', label: 'Medium', color: '#FF9800' },
    { value: 'high', label: 'High', color: '#F44336' }
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
        priority: 'medium'
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
            onClick={() => navigate('/parent')}
            sx={{ color: '#4ECDC4', mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold'
          }}>
            Parent Notes 📝
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

                <Box>
                  {notes.map((note) => (
                    <Card 
                      key={note.id}
                      className="game-card"
                      sx={{ 
                        mb: 2,
                        border: `2px solid ${getTypeColor(note.type)}30`,
                        background: `linear-gradient(135deg, ${getTypeColor(note.type)}10, ${getTypeColor(note.type)}05)`
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flexGrow={1}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Typography variant="h6" sx={{ 
                                color: '#2C3E50',
                                mr: 2
                              }}>
                                {note.title}
                              </Typography>
                              <Chip
                                label={noteTypes.find(t => t.value === note.type)?.label}
                                size="small"
                                sx={{ 
                                  background: getTypeColor(note.type),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  mr: 1
                                }}
                              />
                              <Chip
                                label={priorities.find(p => p.value === note.priority)?.label}
                                size="small"
                                sx={{ 
                                  background: getPriorityColor(note.priority),
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {note.content}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box display="flex" alignItems="center">
                                <User size={16} style={{ marginRight: 4, color: '#4ECDC4' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {getChildName(note.child)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Calendar size={16} style={{ marginRight: 4, color: '#9B59B6' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(note.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
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

export default Notes;
