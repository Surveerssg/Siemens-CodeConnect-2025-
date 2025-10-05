import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  IconButton
} from '@mui/material';
import { 
  ArrowLeft, 
  Save,
  Edit,
  Camera,
  User
} from 'lucide-react';

const Profile = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    avatar: '👤',
    bio: '',
    phone: '',
    institution: '',
    specialization: ''
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save profile logic here
    setIsEditing(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'child': return '👶';
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'therapist': return '👩‍⚕️';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'child': return '#FF6B6B';
      case 'parent': return '#4ECDC4';
      case 'therapist': return '#9B59B6';
      default: return '#95A5A6';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'child': return 'Child';
      case 'parent': return 'Parent';
      case 'therapist': return 'Therapist';
      default: return 'User';
    }
  };

  return (
    <Container maxWidth="md" sx={{ 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 2,
      py: 4
    }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate(-1)}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ 
          color: '#2C3E50',
          fontWeight: 'bold'
        }}>
          My Profile 👤
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${getRoleColor(userRole)}15, ${getRoleColor(userRole)}05)`,
            textAlign: 'center',
            p: 4
          }}>
            <Box position="relative" display="inline-block" mb={3}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  fontSize: '4rem',
                  background: `linear-gradient(45deg, ${getRoleColor(userRole)}, ${getRoleColor(userRole)}CC)`,
                  mb: 2
                }}
              >
                {profileData.avatar}
              </Avatar>
              {isEditing && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.9)',
                    '&:hover': {
                      background: 'rgba(255,255,255,1)'
                    }
                  }}
                >
                  <Camera size={20} />
                </IconButton>
              )}
            </Box>

            <Typography variant="h5" sx={{ 
              color: getRoleColor(userRole),
              fontWeight: 'bold',
              mb: 1
            }}>
              {profileData.name}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {getRoleLabel(userRole)}
            </Typography>

            <Box display="flex" justifyContent="center" gap={1} mb={3}>
              <Typography variant="h3">
                {getRoleIcon(userRole)}
              </Typography>
            </Box>

            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<Edit size={20} />}
                onClick={() => setIsEditing(true)}
                sx={{
                  background: `linear-gradient(45deg, ${getRoleColor(userRole)}, ${getRoleColor(userRole)}CC)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${getRoleColor(userRole)}CC, ${getRoleColor(userRole)})`,
                  }
                }}
              >
                Edit Profile
              </Button>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
              }}>
                Profile Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <User size={20} style={{ marginRight: 8, color: '#4ECDC4' }} />
                    }}
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself..."
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>

                {userRole === 'parent' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>
                )}

                {userRole === 'therapist' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Institution/Clinic"
                        value={profileData.institution}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                        disabled={!isEditing}
                        sx={{ borderRadius: 3 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Specialization"
                        value={profileData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        disabled={!isEditing}
                        sx={{ borderRadius: 3 }}
                      />
                    </Grid>
                  </>
                )}

                {userRole === 'child' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Favorite Avatar"
                      value={profileData.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.value)}
                      disabled={!isEditing}
                      placeholder="👶"
                      sx={{ borderRadius: 3 }}
                    />
                  </Grid>
                )}
              </Grid>

              {isEditing && (
                <Box mt={4} display="flex" justifyContent="center" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<Save size={20} />}
                    onClick={handleSave}
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
                    onClick={() => setIsEditing(false)}
                    sx={{ color: '#FF6B6B' }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ 
            color: '#2C3E50',
            fontWeight: 'bold',
            mb: 3
          }}>
            Account Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" sx={{ color: '#4ECDC4', fontWeight: 'bold' }}>
                  {userRole === 'child' ? '1250' : userRole === 'parent' ? '2' : '3'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userRole === 'child' ? 'Total XP' : userRole === 'parent' ? 'Children' : 'Patients'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" sx={{ color: '#FF6B6B', fontWeight: 'bold' }}>
                  {userRole === 'child' ? '5' : userRole === 'parent' ? '45' : '85'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userRole === 'child' ? 'Day Streak' : userRole === 'parent' ? 'Total Words' : 'Avg Progress %'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" sx={{ color: '#9B59B6', fontWeight: 'bold' }}>
                  {userRole === 'child' ? '3' : userRole === 'parent' ? '78' : '12'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userRole === 'child' ? 'Level' : userRole === 'parent' ? 'Avg Score %' : 'Sessions This Week'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" sx={{ color: '#F39C12', fontWeight: 'bold' }}>
                  {userRole === 'child' ? '8' : userRole === 'parent' ? '5' : '2'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userRole === 'child' ? 'Badges' : userRole === 'parent' ? 'Goals Set' : 'Years Experience'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
