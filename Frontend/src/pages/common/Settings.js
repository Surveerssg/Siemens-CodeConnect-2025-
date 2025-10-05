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
  InputLabel
} from '@mui/material';
import { 
  ArrowLeft, 
  Save,
  Volume2,
  Bell,
  Palette,
  Accessibility,
  Shield
} from 'lucide-react';

const Settings = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: { email: true, push: true, practiceReminders: true, achievementAlerts: true, weeklyReports: true },
    audio: { enabled: true, volume: 70, soundEffects: true, voiceFeedback: true },
    display: { theme: 'light', fontSize: 'medium', animations: true, highContrast: false },
    accessibility: { screenReader: false, keyboardNavigation: true, voiceCommands: false, largeText: false },
    privacy: { dataSharing: false, analytics: true, personalizedAds: false }
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
    console.log('Settings saved:', settings);
  };

  // Role-specific settings (example for future customization)
  const getRoleSpecificSettings = () => {
    if (userRole === 'parent') {
      return (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Parent Controls</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                />
              }
              label="Weekly Progress Reports"
            />
          </CardContent>
        </Card>
      );
    }
    return null; // No extra settings for other roles
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate(-1)}
          sx={{ color: '#4ECDC4', mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ color: '#2C3E50', fontWeight: 'bold' }}>
          Settings ⚙️
        </Typography>
      </Box>

      {getRoleSpecificSettings()}

      {/* Notifications Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Bell size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Notifications
          </Typography>
          {Object.keys(settings.notifications).map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={settings.notifications[key]}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                />
              }
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          ))}
        </CardContent>
      </Card>

      {/* Audio Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Volume2 size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Audio
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.audio.enabled}
                onChange={(e) => handleSettingChange('audio', 'enabled', e.target.checked)}
              />
            }
            label="Enable Audio"
          />
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Volume</Typography>
            <Slider
              value={settings.audio.volume}
              onChange={(e, val) => handleSettingChange('audio', 'volume', val)}
              min={0}
              max={100}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={settings.audio.soundEffects}
                onChange={(e) => handleSettingChange('audio', 'soundEffects', e.target.checked)}
              />
            }
            label="Sound Effects"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.audio.voiceFeedback}
                onChange={(e) => handleSettingChange('audio', 'voiceFeedback', e.target.checked)}
              />
            }
            label="Voice Feedback"
          />
        </CardContent>
      </Card>

      {/* Display Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Palette size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Display
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Theme</InputLabel>
            <Select
              value={settings.display.theme}
              onChange={(e) => handleSettingChange('display', 'theme', e.target.value)}
              label="Theme"
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Font Size</InputLabel>
            <Select
              value={settings.display.fontSize}
              onChange={(e) => handleSettingChange('display', 'fontSize', e.target.value)}
              label="Font Size"
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={settings.display.animations}
                onChange={(e) => handleSettingChange('display', 'animations', e.target.checked)}
              />
            }
            label="Animations"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.display.highContrast}
                onChange={(e) => handleSettingChange('display', 'highContrast', e.target.checked)}
              />
            }
            label="High Contrast"
          />
        </CardContent>
      </Card>

      {/* Accessibility Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Accessibility size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Accessibility
          </Typography>
          {Object.keys(settings.accessibility).map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={settings.accessibility[key]}
                  onChange={(e) => handleSettingChange('accessibility', key, e.target.checked)}
                />
              }
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          ))}
        </CardContent>
      </Card>

      {/* Privacy & Security Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Shield size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Privacy & Security
          </Typography>
          {Object.keys(settings.privacy).map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={settings.privacy[key]}
                  onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                />
              }
              label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          ))}
        </CardContent>
      </Card>

      {/* Save / Cancel Buttons */}
      <Box display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          startIcon={<Save size={20} />}
          onClick={handleSave}
          sx={{
            background: 'linear-gradient(45deg, #4CAF50, #45A049)',
            '&:hover': { background: 'linear-gradient(45deg, #45A049, #4CAF50)' },
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
  );
};

export default Settings;
