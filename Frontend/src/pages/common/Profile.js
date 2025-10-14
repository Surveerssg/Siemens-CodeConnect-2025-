import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Save,
  Edit,
  Camera,
  User,
  Mail,
  Phone,
  Briefcase,
  Star,
  Trophy,
  Flame,
  Sparkles
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
      case 'child': return { gradient: 'from-blue-400 to-blue-600', light: 'from-blue-100 to-blue-50', accent: 'blue-600' };
      case 'parent': return { gradient: 'from-teal-400 to-teal-600', light: 'from-teal-100 to-teal-50', accent: 'teal-600' };
      case 'therapist': return { gradient: 'from-purple-400 to-purple-600', light: 'from-purple-100 to-purple-50', accent: 'purple-600' };
      default: return { gradient: 'from-gray-400 to-gray-600', light: 'from-gray-100 to-gray-50', accent: 'gray-600' };
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

  const colors = getRoleColor(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-2">
            My Profile 
            <span className="text-3xl sm:text-4xl">👤</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Avatar & Role */}
          <div className={`bg-gradient-to-br ${colors.light} rounded-3xl p-8 shadow-lg border border-white/50`}>
            <div className="text-center">
              {/* Avatar Section */}
              <div className="relative inline-block mb-6">
                <div className={`w-32 h-32 mx-auto mb-4 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center text-6xl shadow-xl relative overflow-hidden`}>
                  <div className="absolute inset-0 animate-pulse opacity-20"></div>
                  {profileData.avatar}
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white">
                    <Camera size={18} className={`text-${colors.accent}`} />
                  </button>
                )}
              </div>

              {/* Role Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md mb-4 border-2 border-${colors.accent}`}>
                <span className="text-2xl">{getRoleIcon(userRole)}</span>
                <span className={`font-bold text-${colors.accent}`}>{getRoleLabel(userRole)}</span>
              </div>

              {/* Name */}
              <h2 className={`text-2xl sm:text-3xl font-bold text-${colors.accent} mb-6`}>
                {profileData.name}
              </h2>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${colors.gradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}
                >
                  <Edit size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User size={24} className={`text-${colors.accent}`} />
                Profile Information
              </h3>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                    <User size={18} className="text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 bg-transparent outline-none text-gray-800 font-medium disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <Mail size={18} className="text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="flex-1 bg-transparent outline-none text-gray-800 font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-gray-800 font-medium disabled:cursor-not-allowed transition-colors"
                  />
                </div>

                {/* Role-Specific Fields */}
                {userRole === 'parent' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                      <Phone size={18} className="text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 bg-transparent outline-none text-gray-800 font-medium disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {userRole === 'therapist' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Institution/Clinic</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                        <Briefcase size={18} className="text-gray-400" />
                        <input
                          type="text"
                          value={profileData.institution}
                          onChange={(e) => handleInputChange('institution', e.target.value)}
                          disabled={!isEditing}
                          className="flex-1 bg-transparent outline-none text-gray-800 font-medium disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                        <Star size={18} className="text-gray-400" />
                        <input
                          type="text"
                          value={profileData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          disabled={!isEditing}
                          className="flex-1 bg-transparent outline-none text-gray-800 font-medium disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </>
                )}

                {userRole === 'child' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Favorite Avatar</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                      <Sparkles size={18} className="text-gray-400" />
                      <input
                        type="text"
                        value={profileData.avatar}
                        onChange={(e) => handleInputChange('avatar', e.target.value)}
                        disabled={!isEditing}
                        placeholder="👶"
                        className="flex-1 bg-transparent outline-none text-gray-800 font-medium disabled:cursor-not-allowed text-center text-2xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <Trophy size={24} className="text-yellow-500" />
            Account Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1 */}
            <div className={`bg-gradient-to-br ${colors.light} rounded-2xl p-6 text-center border border-white/50 hover:shadow-lg transition-all duration-300`}>
              <div className={`text-4xl sm:text-5xl font-black text-${colors.accent} mb-2`}>
                {userRole === 'child' ? '1250' : userRole === 'parent' ? '2' : '3'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {userRole === 'child' ? 'Total XP' : userRole === 'parent' ? 'Children' : 'Patients'}
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl p-6 text-center border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl sm:text-5xl font-black text-orange-600 mb-2">
                {userRole === 'child' ? '5' : userRole === 'parent' ? '45' : '85'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {userRole === 'child' ? 'Day Streak' : userRole === 'parent' ? 'Total Words' : 'Avg Progress %'}
              </p>
            </div>

            {/* Stat 3 */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-6 text-center border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl sm:text-5xl font-black text-purple-600 mb-2">
                {userRole === 'child' ? '3' : userRole === 'parent' ? '78' : '12'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {userRole === 'child' ? 'Level' : userRole === 'parent' ? 'Avg Score %' : 'Sessions This Week'}
              </p>
            </div>

            {/* Stat 4 */}
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-6 text-center border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl sm:text-5xl font-black text-yellow-600 mb-2">
                {userRole === 'child' ? '8' : userRole === 'parent' ? '5' : '2'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                {userRole === 'child' ? 'Badges' : userRole === 'parent' ? 'Goals Set' : 'Years Experience'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;