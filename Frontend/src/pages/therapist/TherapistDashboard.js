import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { therapistAPI } from '../../services/api';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Avatar,
  TextField
} from '@mui/material';
import { 
  Settings,
  LogOut,
  UserPlus,
  Users,
  ClipboardList,
  Mail,
  Sparkles
} from 'lucide-react';

const TherapistDashboard = () => {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [linkChildEmail, setLinkChildEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Load all linked children
  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await therapistAPI.listChildren();
        setChildren(res.data || []);
      } catch (e) {
        console.error('Failed to load linked children:', e);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 flex items-center gap-3">
              Welcome, Dr. {user?.displayName || 'Therapist'}!
              <span className="text-4xl sm:text-5xl">🧑‍⚕️</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-600 font-medium">
              Track and monitor your assigned children's speech progress
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={() => navigate('/therapist/practice')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <ClipboardList size={18} />
              <span className="hidden sm:inline">Assign Practice</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">👥</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Users size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Total Children</h3>
              </div>
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                {children.length}
              </p>
              <p className="text-lg sm:text-xl font-semibold">
                Linked to your account
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden sm:col-span-2 lg:col-span-2">
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">✨</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Quick Actions</h3>
              </div>
              <p className="text-lg sm:text-xl font-semibold mb-4">
                Link new children, assign practice sessions, and monitor progress all in one place!
              </p>
            </div>
          </div>
        </div>

        {/* Link Child Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Link a Child
            <UserPlus className="text-green-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>
          
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border-2 border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    placeholder="child@email.com"
                    value={linkChildEmail}
                    onChange={(e) => setLinkChildEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-800 font-medium transition-all duration-200"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!linkChildEmail) return;
                  try {
                    await therapistAPI.linkChildByEmail(linkChildEmail);
                    const res = await therapistAPI.listChildren();
                    setChildren(res.data || []);
                    setLinkChildEmail('');
                  } catch (e) {
                    console.error('Failed to link by email:', e);
                    alert(e?.message || 'Failed to link by email');
                  }
                }}
                disabled={!linkChildEmail}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base transition-all duration-200 whitespace-nowrap ${
                  linkChildEmail
                    ? 'bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Link by Email
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              💡 Enter the child's registered email to link their account to your therapist profile.
            </p>
          </div>
        </div>

        {/* Linked Children Section */}
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Linked Children
            <Users className="text-blue-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>

          {children.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg border-2 border-gray-100 text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-5xl sm:text-6xl">
                👥
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                No Children Linked Yet
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Start by linking a child using their email address above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100"
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                      {child.name ? child.name.charAt(0).toUpperCase() : child.email.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">
                      {child.name || 'Child User'}
                    </h3>
                    {child.email && (
                      <p className="text-sm sm:text-base text-gray-600 break-words">
                        {child.email}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/therapist/child/${child.id}`)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-purple-600 text-white rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    📊 View Summary
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;