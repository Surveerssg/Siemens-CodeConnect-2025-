import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { parentAPI } from '../../services/api';

const Notes = () => {
  const { user } = useAuth(); // logged-in parent
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        console.log("📤 Fetching parent notes for:", user.email);

        const res = await parentAPI.getNotes(user.email);

        // Handle backend response format
        if (res?.success && Array.isArray(res.data)) {
          setNotes(res.data);
          console.log(`✅ Received ${res.data.length} notes.`);
        } else {
          console.warn("⚠️ Unexpected response format:", res);
          setNotes([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch notes:", err);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user?.email]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toDate) return timestamp.toDate().toLocaleString();
      if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C3E50' }}>
          Therapist Notes for Your Child 📝
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading notes...</Typography>
        </Box>
      ) : (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f6fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Child Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Content</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="textSecondary">
                          No notes received yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    notes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>{note.child_email || 'N/A'}</TableCell>
                        <TableCell>{note.title || 'Untitled'}</TableCell>
                        <TableCell>{note.notes || '-'}</TableCell>
                        <TableCell>{formatDate(note.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Notes;
