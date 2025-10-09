import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Container, Card, CardContent, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { ArrowLeft, Plus } from 'lucide-react';

export default function TherapistPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ childEmail: '', type: 'word', text: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await therapistAPI.listChildren();
        if (!mounted) return;
        setChildren(res.data || []);
      } catch (e) {
        console.error('Failed to load children:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAssign = async () => {
    if (!form.childEmail || !form.text) {
      setMessage({ type: 'error', text: 'Please choose a child and enter text' });
      return;
    }

    try {
      const payload = {
        childId: form.childEmail,
        type: form.type,
        text: form.text
      };
      await therapistAPI.assignPractice(payload);
      setMessage({ type: 'success', text: 'Assigned successfully' });
      setForm({ childEmail: '', type: 'word', text: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      console.error('Failed to assign practice:', e);
      setMessage({ type: 'error', text: e?.message || 'Failed to assign' });
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '100vh', width: '100%' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Button startIcon={<ArrowLeft size={20} />} onClick={() => navigate('/therapist')} sx={{ mr: 2 }}>Back to Dashboard</Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Assign Practice (Words & Sentences)</Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>
        )}

        <Card sx={{ borderRadius: 3, p: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel shrink={Boolean(form.childEmail)}>Select Child</InputLabel>
                  <Select value={form.childEmail} onChange={(e) => handleChange('childEmail', e.target.value)}>
                    {children.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name || c.email}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel shrink>Type</InputLabel>
                  <Select value={form.type} onChange={(e) => handleChange('type', e.target.value)}>
                    <MenuItem value="word">Word</MenuItem>
                    <MenuItem value="sentence">Sentence</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label={form.type === 'sentence' ? 'Sentence' : 'Word'} value={form.text} onChange={(e) => handleChange('text', e.target.value)} />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" startIcon={<Plus />} onClick={handleAssign} sx={{ backgroundColor: '#8FA998' }}>Assign to Child</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
