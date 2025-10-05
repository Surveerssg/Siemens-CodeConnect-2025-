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
  User
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
      setEditingNote(prev => ({ ...prev, [field]: value }));
    } else {
      setNewNote(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddNote = () => {
    if (newNote.child && newNote.title && newNote.content) {
      const note = { ...newNote, id: Date.now(), date: new Date().toISOString().split('T')[0] };
      setNotes(prev => [note, ...prev]);
      setNewNote({ child: '', title: '', content: '', type: 'progress', priority: 'medium', sessionType: 'individual', duration: 30, goals: [] });
    }
  };

  const handleEditNote = (note) => setEditingNote(note);
  const handleSaveEdit = () => {
    if (editingNote) {
      setNotes(prev => prev.map(note => note.id === editingNote.id ? editingNote : note));
      setEditingNote(null);
    }
  };
  const handleDeleteNote = (noteId) => setNotes(prev => prev.filter(note => note.id !== noteId));

  const getTypeColor = (type) => noteTypes.find(t => t.value === type)?.color || '#9E9E9E';
  const getPriorityColor = (priority) => priorities.find(p => p.value === priority)?.color || '#9E9E9E';
  const getChildName = (childValue) => children.find(c => c.value === childValue)?.label || childValue;

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button startIcon={<ArrowLeft size={20} />} onClick={() => navigate('/therapist')} sx={{ color: '#4ECDC4', mr: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>Therapist Notes 📝</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Child</InputLabel>
                    <Select value={editingNote ? editingNote.child : newNote.child} onChange={(e) => handleInputChange('child', e.target.value)} label="Select Child">
                      {children.map((child) => <MenuItem key={child.value} value={child.value}>{child.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Note Title" value={editingNote ? editingNote.title : newNote.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Note Content" value={editingNote ? editingNote.content : newNote.content} onChange={(e) => handleInputChange('content', e.target.value)} multiline rows={4} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Note Type</InputLabel>
                    <Select value={editingNote ? editingNote.type : newNote.type} onChange={(e) => handleInputChange('type', e.target.value)} label="Note Type">
                      {noteTypes.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select value={editingNote ? editingNote.priority : newNote.priority} onChange={(e) => handleInputChange('priority', e.target.value)} label="Priority">
                      {priorities.map(priority => <MenuItem key={priority.value} value={priority.value}>{priority.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Session Type</InputLabel>
                    <Select value={editingNote ? editingNote.sessionType : newNote.sessionType} onChange={(e) => handleInputChange('sessionType', e.target.value)} label="Session Type">
                      {sessionTypes.map(type => <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Duration (minutes)" type="number" value={editingNote ? editingNote.duration : newNote.duration} onChange={(e) => handleInputChange('duration', e.target.value)} />
                </Grid>
              </Grid>

              <Box mt={3} display="flex" justifyContent="center" gap={2}>
                {editingNote ? (
                  <>
                    <Button variant="contained" startIcon={<Save size={20} />} onClick={handleSaveEdit} sx={{ background: '#4CAF50', '&:hover': { background: '#45A049' } }}>Save Changes</Button>
                    <Button variant="outlined" onClick={() => setEditingNote(null)} sx={{ color: '#FF6B6B' }}>Cancel</Button>
                  </>
                ) : (
                  <Button variant="contained" startIcon={<Plus size={20} />} onClick={handleAddNote} sx={{ background: '#4ECDC4', '&:hover': { background: '#44A08D' } }}>Add Note</Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: '#2C3E50', fontWeight: 'bold', mb: 3 }}>
                All Notes ({notes.length})
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Child</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.map(note => (
                      <TableRow key={note.id}>
                        <TableCell>{getChildName(note.child)}</TableCell>
                        <TableCell>{note.title}</TableCell>
                        <TableCell><Chip label={noteTypes.find(t => t.value === note.type)?.label} sx={{ background: getTypeColor(note.type), color: 'white' }} /></TableCell>
                        <TableCell><Chip label={priorities.find(p => p.value === note.priority)?.label} sx={{ background: getPriorityColor(note.priority), color: 'white' }} /></TableCell>
                        <TableCell>{new Date(note.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditNote(note)}><Edit size={16} /></IconButton>
                          <IconButton onClick={() => handleDeleteNote(note.id)}><Delete size={16} /></IconButton>
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
    </Container>
  );
};

export default TherapistNotes;
