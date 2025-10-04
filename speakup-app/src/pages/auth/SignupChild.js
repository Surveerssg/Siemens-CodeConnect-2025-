import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ROLES } from '../../constants';
import { 
  Container, Paper, TextField, Button, Typography, Box, Alert,
  CircularProgress, FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';

const SignupChild = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    parentEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.age) {
      setError('Please fill all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: ROLES.CHILD,
        age: Number(formData.age),
        parentEmail: formData.parentEmail || null,
        createdAt: new Date(),
        avatar: '👶',
        level: 1,
        xp: 0,
        streak: 0,
        badges: []
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" textAlign="center" mb={3}>👶 Join as a Child</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parent's Email (Optional)"
                name="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Age</InputLabel>
                <Select
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  label="Age"
                >
                  {[...Array(12)].map((_, i) => (
                    <MenuItem key={i + 4} value={i + 4}>{i + 4} years</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
        </Box>

        <Box mt={2} textAlign="center">
          <Button component={Link} to="/role-selector" startIcon={<ArrowLeft />}>
            Back to Role Selection
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupChild;
