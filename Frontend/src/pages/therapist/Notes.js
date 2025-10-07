import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI, parentAPI } from '../../services/api';
import { 
  Container, Typography, Box, Grid, Card, Button,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import { ArrowLeft, Plus, Send, User, Calendar, FileText } from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [note, setNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  const therapistEmail = "therapist@example.com";

  // Load therapist's children
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await therapistAPI.listChildren(); 
        const list = (res.data || []).map(c => ({
          value: c.id,
          label: c.name || c.email || c.id
        }));
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].value);
      } catch (err) {
        console.error('Failed to load children:', err);
      }
    };
    loadChildren();
  }, []);

  // Fetch parent email and notes when child is selected
  useEffect(() => {
    const fetchParentInfo = async () => {
      if (!selectedChild) return;
      try {
        const res = await therapistAPI.getParentEmail(selectedChild);
        const email = res.data?.parentEmail || '';
        setParentEmail(email);

        // Fetch all notes for this parent
        if (email) fetchNotes(email);
      } catch (err) {
        console.error('Failed to fetch parent info:', err);
        setParentEmail('');
        setNotesList([]);
      }
    };
    fetchParentInfo();
  }, [selectedChild]);

  // Fetch notes by parent email
  const fetchNotes = async (email) => {
    try {
      setNotesLoading(true);
      const res = await parentAPI.getNotes(email);
      if (res.success && Array.isArray(res.data)) {
        setNotesList(res.data);
      } else {
        setNotesList([]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotesList([]);
    } finally {
      setNotesLoading(false);
    }
  };

  // Send note
  const handleAddNote = async () => {
    if (!note.title || !note.content || !selectedChild) {
      return alert('Please fill all fields');
    }

    setLoading(true);
    try {
      const res = await therapistAPI.sendNote(selectedChild, note.title, note.content, therapistEmail);
      alert(res.message || 'Note sent successfully!');
      setNote({ title: '', content: '' });

      // Refresh notes after sending
      if (parentEmail) fetchNotes(parentEmail);
    } catch (err) {
      console.error('Error sending note:', err);
      alert('Failed to send note: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
    return new Date(timestamp).toLocaleString();
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
            Therapist Notes 📝
          </Typography>
        </Box>

        {/* Note Form */}
        <Card sx={{ 
          mb: 4, 
          p: 3,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          backgroundColor: 'white',
          border: '1px solid #E8E6E1'
        }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#3A3D42',
            fontWeight: 'bold',
            mb: 3,
            fontFamily: '"Outfit", "Inter", sans-serif',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Send size={24} style={{ marginRight: 12 }} />
            Send New Note
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
  <FormControl fullWidth>
    <InputLabel 
      shrink={Boolean(selectedChild)}
      sx={{
        fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
        color: '#5B7C99',
        backgroundColor: 'white',
        paddingLeft: '4px',
        paddingRight: '4px'
      }}
    >
      Select Child
    </InputLabel>
    <Select
      value={selectedChild}
      onChange={(e) => setSelectedChild(e.target.value)}
      displayEmpty
      renderValue={(selected) => {
        if (!selected) {
          return (
            <span style={{
              color: '#5B7C99',
              fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
            }}>
              Select Child
            </span>
          );
        }
        const selectedChildData = children.find(child => child.value === selected);
        return selectedChildData ? selectedChildData.label : selected;
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
      {children.map(child => (
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

            <Grid item xs={12} md={6}>
              <TextField 
                label="Parent Email" 
                fullWidth 
                value={parentEmail} 
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                    '& fieldset': {
                      borderColor: '#E8E6E1',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#FAF8F5',
                    }
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
                label="Note Title"
                fullWidth
                value={note.title}
                onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
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
                label="Note Content"
                fullWidth
                multiline
                rows={4}
                value={note.content}
                onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
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
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleAddNote}
                disabled={loading || !note.title || !note.content || !selectedChild}
                sx={{
                  backgroundColor: '#8FA998',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                  borderRadius: 2,
                  px: 4,
                  py: 1,
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
                {loading ? 'Sending...' : 'Send Note'}
              </Button>
            </Grid>
          </Grid>
        </Card>

        {/* Notes Table */}
        <Card sx={{ 
          p: 3,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          backgroundColor: 'white',
          border: '1px solid #E8E6E1'
        }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#3A3D42',
            fontWeight: 'bold',
            mb: 3,
            fontFamily: '"Outfit", "Inter", sans-serif',
            display: 'flex',
            alignItems: 'center'
          }}>
            <FileText size={24} style={{ marginRight: 12 }} />
            All Notes Sent to Parent
          </Typography>
          
          {notesLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100px">
              <CircularProgress sx={{ color: '#5B7C99' }} />
              <Typography sx={{ 
                ml: 2, 
                color: '#5B7C99',
                fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
              }}>
                Loading notes...
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ 
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid #E8E6E1'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#FAF8F5' }}>
                    <TableCell sx={{ 
                      fontFamily: '"Outfit", "Inter", sans-serif',
                      fontWeight: 600,
                      color: '#3A3D42',
                      borderColor: '#E8E6E1'
                    }}>
                      <Box display="flex" alignItems="center">
                        <User size={16} style={{ marginRight: 8 }} />
                        Child Email
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: '"Outfit", "Inter", sans-serif',
                      fontWeight: 600,
                      color: '#3A3D42',
                      borderColor: '#E8E6E1'
                    }}>
                      Title
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: '"Outfit", "Inter", sans-serif',
                      fontWeight: 600,
                      color: '#3A3D42',
                      borderColor: '#E8E6E1'
                    }}>
                      Content
                    </TableCell>
                    <TableCell sx={{ 
                      fontFamily: '"Outfit", "Inter", sans-serif',
                      fontWeight: 600,
                      color: '#3A3D42',
                      borderColor: '#E8E6E1'
                    }}>
                      <Box display="flex" alignItems="center">
                        <Calendar size={16} style={{ marginRight: 8 }} />
                        Date
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notesList.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={4} 
                        align="center"
                        sx={{ 
                          color: '#5B7C99',
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          py: 4,
                          borderColor: '#E8E6E1'
                        }}
                      >
                        No notes sent yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    notesList.map((n, index) => (
                      <TableRow 
                        key={n.id} 
                        sx={{ 
                          backgroundColor: index % 2 === 0 ? 'white' : '#FAF8F5',
                          '&:hover': {
                            backgroundColor: '#F5F5F5'
                          }
                        }}
                      >
                        <TableCell sx={{ 
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          color: '#5B7C99',
                          borderColor: '#E8E6E1',
                          fontWeight: 600
                        }}>
                          {n.child_email || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          color: '#3A3D42',
                          borderColor: '#E8E6E1',
                          fontWeight: 600
                        }}>
                          {n.title || 'Untitled'}
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          color: '#5B7C99',
                          borderColor: '#E8E6E1',
                          maxWidth: '300px'
                        }}>
                          {(() => {
                            const content = n.notes || '';
                            const isExpanded = !!expandedNotes[n.id];
                            const previewLength = 80;
                            if (!content) return '-';
                            if (isExpanded) {
                              return (
                                <Box>
                                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>{content}</Typography>
                                  {content.length > previewLength && (
                                    <Button size="small" onClick={() => setExpandedNotes(prev => ({ ...prev, [n.id]: false }))} sx={{ textTransform: 'none', mt: 1 }}>
                                      Show less
                                    </Button>
                                  )}
                                </Box>
                              );
                            }

                            const preview = content.length > previewLength ? `${content.slice(0, previewLength)}...` : content;
                            return (
                              <Box>
                                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{preview}</Typography>
                                {content.length > previewLength && (
                                  <Button size="small" onClick={() => setExpandedNotes(prev => ({ ...prev, [n.id]: true }))} sx={{ textTransform: 'none', mt: 1 }}>
                                    Show more
                                  </Button>
                                )}
                              </Box>
                            );
                          })()}
                        </TableCell>
                        <TableCell sx={{ 
                          fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif',
                          color: '#5B7C99',
                          borderColor: '#E8E6E1'
                        }}>
                          {formatDate(n.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Summary Card */}
        {notesList.length > 0 && (
          <Card sx={{ 
            mt: 4,
            p: 3,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            backgroundColor: 'white',
            border: '1px solid #E8E6E1'
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: '#3A3D42',
              fontWeight: 'bold',
              mb: 3,
              fontFamily: '"Outfit", "Inter", sans-serif'
            }}>
              Notes Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" sx={{ 
                    color: '#5B7C99', 
                    fontWeight: 'bold',
                    fontFamily: '"Outfit", "Inter", sans-serif'
                  }}>
                    {notesList.length}
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
                    {new Set(notesList.map(n => n.child_email)).size}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#8FA998',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Children
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
                    {notesList.filter(n => n.title && n.title.length > 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#C67B5C',
                    fontFamily: '"Nunito Sans", "Source Sans Pro", sans-serif'
                  }}>
                    Titled Notes
                  </Typography>
                </Box>
              </Grid>
              {/* 'This Month' tile removed per design request */}
            </Grid>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default Notes;