import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save,
  Volume2,
  Bell,
  Palette,
  Accessibility,
  Shield,
  X
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

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatLabel = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const SettingCard = ({ icon: Icon, title, children }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Icon className="text-white w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </motion.div>
  );

  const ToggleSetting = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <label className="text-slate-700 font-medium cursor-pointer">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
          value ? 'bg-indigo-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectSetting = ({ label, value, onChange, options }) => (
    <div className="py-4 border-b border-slate-100 last:border-b-0">
      <label className="block text-slate-700 font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-slate-800 focus:border-indigo-500 focus:outline-none transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-[Arial,sans-serif]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-slate-200"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Settings
          </h1>
        </motion.div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3"
          >
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <p className="text-emerald-700 font-semibold">Settings saved successfully!</p>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >

          {/* Parent-Specific Settings */}
          {userRole === 'parent' && (
            <SettingCard icon={Bell} title="Parent Controls">
              <ToggleSetting
                label="Weekly Progress Reports"
                value={settings.notifications.weeklyReports}
                onChange={(val) => handleSettingChange('notifications', 'weeklyReports', val)}
              />
            </SettingCard>
          )}

          {/* Notifications Card */}
          <SettingCard icon={Bell} title="Notifications">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <ToggleSetting
                key={key}
                label={formatLabel(key)}
                value={value}
                onChange={(val) => handleSettingChange('notifications', key, val)}
              />
            ))}
          </SettingCard>

          {/* Audio Card */}
          <SettingCard icon={Volume2} title="Audio">
            <ToggleSetting
              label="Enable Audio"
              value={settings.audio.enabled}
              onChange={(val) => handleSettingChange('audio', 'enabled', val)}
            />
            
            <div className="py-4 border-b border-slate-100">
              <label className="block text-slate-700 font-medium mb-3">Volume</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audio.volume}
                  onChange={(e) => handleSettingChange('audio', 'volume', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-slate-700 font-semibold min-w-12 text-right">{settings.audio.volume}%</span>
              </div>
            </div>

            <ToggleSetting
              label="Sound Effects"
              value={settings.audio.soundEffects}
              onChange={(val) => handleSettingChange('audio', 'soundEffects', val)}
            />
            
            <ToggleSetting
              label="Voice Feedback"
              value={settings.audio.voiceFeedback}
              onChange={(val) => handleSettingChange('audio', 'voiceFeedback', val)}
            />
          </SettingCard>

          {/* Display Card */}
          <SettingCard icon={Palette} title="Display">
            <SelectSetting
              label="Theme"
              value={settings.display.theme}
              onChange={(val) => handleSettingChange('display', 'theme', val)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' }
              ]}
            />

            <SelectSetting
              label="Font Size"
              value={settings.display.fontSize}
              onChange={(val) => handleSettingChange('display', 'fontSize', val)}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' }
              ]}
            />

            <ToggleSetting
              label="Animations"
              value={settings.display.animations}
              onChange={(val) => handleSettingChange('display', 'animations', val)}
            />

            <ToggleSetting
              label="High Contrast"
              value={settings.display.highContrast}
              onChange={(val) => handleSettingChange('display', 'highContrast', val)}
            />
          </SettingCard>

          {/* Accessibility Card */}
          <SettingCard icon={Accessibility} title="Accessibility">
            {Object.entries(settings.accessibility).map(([key, value]) => (
              <ToggleSetting
                key={key}
                label={formatLabel(key)}
                value={value}
                onChange={(val) => handleSettingChange('accessibility', key, val)}
              />
            ))}
          </SettingCard>

          {/* Privacy & Security Card */}
          <SettingCard icon={Shield} title="Privacy & Security">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <ToggleSetting
                key={key}
                label={formatLabel(key)}
                value={value}
                onChange={(val) => handleSettingChange('privacy', key, val)}
              />
            ))}
          </SettingCard>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save size={20} />
              Save Settings
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-slate-700 rounded-xl font-bold border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <X size={20} />
              Cancel
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Settings;