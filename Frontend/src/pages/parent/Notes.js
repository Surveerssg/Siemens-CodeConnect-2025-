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
    { value: 'progress', label: 'Progress Update', color: '#8FA998' },
    { value: 'concern', label: 'Concern', color: '#C67B5C' },
    { value: 'achievement', label: 'Achievement', color: '#5B7C99' },
    { value: 'observation', label: 'General Observation', color: '#8FA998' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#8FA998' },
    { value: 'medium', label: 'Medium', color: '#5B7C99' },
    { value: 'high', label: 'High', color: '#C67B5C' }
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
    return noteType ? noteType.color : '#5B7C99';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#5B7C99';
  };

  const getChildName = (childValue) => {
    const child = children.find(c => c.value === childValue);
    return child ? child.label : childValue;
  };

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
            Parent Notes 📝
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Add/Edit Note Form */}
          <Grid item xs={12} md={4}>
            <Card sx={{
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
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#3A3D42',
                  fontWeight: 'bold',
                  mb: 3,
                  fontFamily: '"Outfit", "Inter", sans-serif'
                }}>
                  {editingNote ? 'Edit Note' : 'Add New Note'}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                        color: '#5B7C99'
                      }}>
                        Select Child
                      </InputLabel>
                      <Select
                        value={editingNote ? editingNote.child : newNote.child}
                        onChange={(e) => handleInputChange('child', e.target.value)}
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Note Title"
                      value={editingNote ? editingNote.title : newNote.title}
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
                      label="Note Content"
                      value={editingNote ? editingNote.content : newNote.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      multiline
                      rows={4}
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

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                        color: '#5B7C99'
                      }}>
                        Note Type
                      </InputLabel>
                      <Select
                        value={editingNote ? editingNote.type : newNote.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        label="Note Type"
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
                        {noteTypes.map((type) => (
                          <MenuItem 
                            key={type.value} 
                            value={type.value}
                            sx={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif' }}
                          >
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                        color: '#5B7C99'
                      }}>
                        Priority
                      </InputLabel>
                      <Select
                        value={editingNote ? editingNote.priority : newNote.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        label="Priority"
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
                        {priorities.map((priority) => (
                          <MenuItem 
                            key={priority.value} 
                            value={priority.value}
                            sx={{ fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif' }}
                          >
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
                        sx={{
                          backgroundColor: '#8FA998',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          borderRadius: 2,
                          px: 3,
                          '&:hover': {
                            backgroundColor: '#7D9786',
                            boxShadow: '0 4px 12px rgba(143, 169, 152, 0.3)'
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingNote(null)}
                        sx={{ 
                          color: '#5B7C99',
                          borderColor: '#E8E6E1',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          borderRadius: 2,
                          px: 3,
                          '&:hover': {
                            backgroundColor: '#F5F5F5',
                            borderColor: '#5B7C99'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={handleAddNote}
                      sx={{
                        backgroundColor: '#5B7C99',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                        borderRadius: 2,
                        px: 3,
                        '&:hover': {
                          backgroundColor: '#4A677F',
                          boxShadow: '0 4px 12px rgba(91, 124, 153, 0.3)'
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

          {/* Notes List */}
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
                  All Notes ({notes.length})
                </Typography>

                <Box>
                  {notes.map((note) => (
                    <Card 
                      key={note.id}
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        border: `1px solid ${getTypeColor(note.type)}30`,
                        backgroundColor: '#FAF8F5',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flexGrow={1}>
                            <Box display="flex" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
                              <Typography variant="h6" sx={{ 
                                color: '#3A3D42', 
                                mr: 2,
                                fontFamily: '"Outfit", "Inter", sans-serif',
                                fontWeight: 600
                              }}>
                                {note.title}
                              </Typography>
                              <Chip
                                label={noteTypes.find(t => t.value === note.type)?.label}
                                size="small"
                                sx={{ 
                                  backgroundColor: getTypeColor(note.type), 
                                  color: 'white', 
                                  fontWeight: 'bold',
                                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                  borderRadius: 1
                                }}
                              />
                              <Chip
                                label={priorities.find(p => p.value === note.priority)?.label}
                                size="small"
                                sx={{ 
                                  backgroundColor: getPriorityColor(note.priority), 
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
                              {note.content}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                              <Box display="flex" alignItems="center">
                                <User size={16} style={{ marginRight: 4, color: '#5B7C99' }} />
                                <Typography variant="caption" sx={{
                                  color: '#5B7C99',
                                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                  fontWeight: 600
                                }}>
                                  {getChildName(note.child)}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Calendar size={16} style={{ marginRight: 4, color: '#5B7C99' }} />
                                <Typography variant="caption" sx={{
                                  color: '#5B7C99',
                                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                                  fontWeight: 600
                                }}>
                                  {new Date(note.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditNote(note)} 
                              sx={{ 
                                color: '#5B7C99',
                                '&:hover': {
                                  backgroundColor: '#E8E6E1'
                                }
                              }}
                            >
                              <Edit size={16} />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteNote(note.id)} 
                              sx={{ 
                                color: '#C67B5C',
                                '&:hover': {
                                  backgroundColor: '#FFE8E8'
                                }
                              }}
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

        {/* Statistics Card */}
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
              Note Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ 
                    color: '#5B7C99', 
                    fontWeight: 'bold',
                    fontFamily: '"Outfit", "Inter", sans-serif'
                  }}>
                    {notes.length}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#5B7C99',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Total Notes
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
                    {notes.filter(n => n.type === 'progress').length}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#8FA998',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Progress Notes
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
                    {notes.filter(n => n.type === 'concern').length}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#C67B5C',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Concerns
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
                    {notes.filter(n => n.type === 'achievement').length}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#5B7C99',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Achievements
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Notes;