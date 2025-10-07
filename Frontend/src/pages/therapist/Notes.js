import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI, parentAPI } from '../../services/api'; // import parentAPI for fetching notes
import { 
  Container, Typography, Box, Grid, Card, Button,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from '@mui/material';
import { ArrowLeft, Plus } from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [note, setNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate('/therapist')} sx={{ mr: 2 }}>
          Back to Dashboard
        </Button>
        <Typography variant="h4" fontWeight="bold">Therapist Notes 📝</Typography>
      </Box>

      {/* Note Form */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Child</InputLabel>
              <Select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
              >
                {children.map(child => (
                  <MenuItem key={child.value} value={child.value}>{child.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField label="Parent Email" fullWidth value={parentEmail} disabled />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Note Title"
              fullWidth
              value={note.title}
              onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
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
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={handleAddNote}
              disabled={loading}
              sx={{ backgroundColor: '#4ECDC4', '&:hover': { backgroundColor: '#44A08D' } }}
            >
              {loading ? 'Sending...' : 'Send Note'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Notes Table */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>All Notes Sent to Parent</Typography>
        {notesLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100px">
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading notes...</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Child Email</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notesList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No notes sent yet.</TableCell>
                  </TableRow>
                ) : (
                  notesList.map(n => (
                    <TableRow key={n.id}>
                      <TableCell>{n.child_email || 'N/A'}</TableCell>
                      <TableCell>{n.title || 'Untitled'}</TableCell>
                      <TableCell>{n.notes || '-'}</TableCell>
                      <TableCell>{formatDate(n.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Container>
  );
};

export default Notes;
