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
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import { 
  ArrowLeft, 
  Save,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Palette,
  Accessibility,
  Shield
} from 'lucide-react';

const Settings = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      practiceReminders: true,
      achievementAlerts: true,
      weeklyReports: true
    },
    audio: {
      enabled: true,
      volume: 70,
      soundEffects: true,
      voiceFeedback: true
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      animations: true,
      highContrast: false
    },
    accessibility: {
      screenReader: false,
      keyboardNavigation: true,
      voiceCommands: false,
      largeText: false
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      personalizedAds: false
    }
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const getRoleSpecificSettings = () => {
    switch (userRole) {
      case 'child':
        return (
          <Card className="game-card" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
              }}>
                <Palette size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Child Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.display.animations}
                        onChange={(e) => handleSettingChange('display', 'animations', e.target.checked)}
                      />
                    }
                    label="Enable Animations"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.audio.soundEffects}
                        onChange={(e) => handleSettingChange('audio', 'soundEffects', e.target.checked)}
                      />
                    }
                    label="Sound Effects"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Practice Session Duration (minutes)
                  </Typography>
                  <Slider
                    value={15}
                    onChange={(e, value) => console.log('Duration:', value)}
                    min={5}
                    max={60}
                    step={5}
                    marks={[
                      { value: 5, label: '5min' },
                      { value: 15, label: '15min' },
                      { value: 30, label: '30min' },
                      { value: 60, label: '60min' }
                    ]}
                    sx={{ color: '#4ECDC4' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      
      case 'parent':
        return (
          <Card className="game-card" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
              }}>
                <Bell size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Parent Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.weeklyReports}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                      />
                    }
                    label="Weekly Progress Reports"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.practiceReminders}
                        onChange={(e) => handleSettingChange('notifications', 'practiceReminders', e.target.checked)}
                      />
                    }
                    label="Practice Reminders"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Report Frequency</InputLabel>
                    <Select
                      value="weekly"
                      label="Report Frequency"
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      
      case 'therapist':
        return (
          <Card className="game-card" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                color: '#2C3E50',
                fontWeight: 'bold',
                mb: 3
              }}>
                <Shield size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Therapist Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.privacy.dataSharing}
                        onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                      />
                    }
                    label="Share Anonymous Data"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Session Reminder Time</InputLabel>
                    <Select
                      value="30"
                      label="Session Reminder Time"
                      sx={{ borderRadius: 3 }}
                    >
                      <MenuItem value="15">15 minutes before</MenuItem>
                      <MenuItem value="30">30 minutes before</MenuItem>
                      <MenuItem value="60">1 hour before</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
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
            Settings ⚙️
          </Typography>
        </Box>

        {getRoleSpecificSettings()}

        <Card className="game-card" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              mb: 3
            }}>
              <Bell size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Notifications
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.achievementAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'achievementAlerts', e.target.checked)}
                    />
                  }
                  label="Achievement Alerts"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className="game-card" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              mb: 3
            }}>
              <Volume2 size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Audio Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.audio.enabled}
                      onChange={(e) => handleSettingChange('audio', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Audio"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.audio.voiceFeedback}
                      onChange={(e) => handleSettingChange('audio', 'voiceFeedback', e.target.checked)}
                    />
                  }
                  label="Voice Feedback"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Volume Level
                </Typography>
                <Slider
                  value={settings.audio.volume}
                  onChange={(e, value) => handleSettingChange('audio', 'volume', value)}
                  min={0}
                  max={100}
                  step={10}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                  sx={{ color: '#4ECDC4' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className="game-card" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              mb: 3
            }}>
              <Palette size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Display Settings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.display.theme}
                    onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
                    label="Theme"
                    sx={{ borderRadius: 3 }}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={settings.display.fontSize}
                    onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
                    label="Font Size"
                    sx={{ borderRadius: 3 }}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.display.highContrast}
                      onChange={(e) => handleSettingChange('display', 'highContrast', e.target.checked)}
                    />
                  }
                  label="High Contrast Mode"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className="game-card" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              mb: 3
            }}>
              <Accessibility size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Accessibility
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.screenReader}
                      onChange={(e) => handleSettingChange('accessibility', 'screenReader', e.target.checked)}
                    />
                  }
                  label="Screen Reader Support"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.keyboardNavigation}
                      onChange={(e) => handleSettingChange('accessibility', 'keyboardNavigation', e.target.checked)}
                    />
                  }
                  label="Keyboard Navigation"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.voiceCommands}
                      onChange={(e) => handleSettingChange('accessibility', 'voiceCommands', e.target.checked)}
                    />
                  }
                  label="Voice Commands"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.largeText}
                      onChange={(e) => handleSettingChange('accessibility', 'largeText', e.target.checked)}
                    />
                  }
                  label="Large Text"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className="game-card" sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#2C3E50',
              fontWeight: 'bold',
              mb: 3
            }}>
              <Shield size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Privacy & Security
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.analytics}
                      onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                    />
                  }
                  label="Usage Analytics"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.personalizedAds}
                      onChange={(e) => handleSettingChange('privacy', 'personalizedAds', e.target.checked)}
                    />
                  }
                  label="Personalized Ads"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            startIcon={<Save size={20} />}
            onClick={handleSave}
            className="child-friendly-button"
            sx={{
              background: 'linear-gradient(45deg, #4CAF50, #45A049)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45A049, #4CAF50)',
              }
            }}
          >
            Save Settings
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ color: '#FF6B6B' }}
          >
            Cancel
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default Settings;
