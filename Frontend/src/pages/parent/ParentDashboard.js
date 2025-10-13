import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { parentAPI } from '../../services/api';
import { 
  Users, 
  TrendingUp, 
  Settings,
  LogOut,
  Mail,
  UserPlus,
  ArrowRight,
  Activity,
  BarChart3
} from 'lucide-react';

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [childSummary, setChildSummary] = useState(null);
  const [linkChildEmail, setLinkChildEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await logout();
      console.log('Logout successful, navigating to login...');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await parentAPI.listChildren();
        setChildren(res.data || []);
      } catch (e) {
        console.error('Failed to load linked children:', e);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  const loadChildSummary = async (childId) => {
    try {
      setSelectedChildId(childId);
      const res = await parentAPI.getChildSummary(childId);
      setChildSummary(res.data || null);
    } catch (e) {
      console.error('Failed to load child summary:', e);
    }
  };

  const getInitials = (text) => {
    if (!text) return '?';
    return text.charAt(0).toUpperCase();
  };

  const avatarColors = [
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
              Welcome, {user?.displayName || 'Parent'}
            </h1>
            <p className="text-lg sm:text-xl text-indigo-600 font-medium">
              Track your children's speech progress
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-slate-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-slate-200"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Link Child Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <UserPlus className="text-white w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              Link Your Child
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Child's Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="child@email.com"
                    value={linkChildEmail}
                    onChange={(e) => setLinkChildEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base font-medium"
                  />
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!linkChildEmail) return;
                  try {
                    await parentAPI.linkChildByEmail(linkChildEmail);
                    const res = await parentAPI.listChildren();
                    setChildren(res.data || []);
                    setLinkChildEmail('');
                  } catch (e) {
                    console.error('Failed to link by email:', e);
                    alert(e?.message || 'Failed to link by email');
                  }
                }}
                disabled={!linkChildEmail}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <UserPlus size={20} />
                Link Child
              </button>
            </div>
            <div className="flex items-start gap-3 mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <Activity className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                Enter your child's registered email address to link their account and view their progress.
              </p>
            </div>
          </div>
        </div>

        {/* Children Section */}
        <div>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="text-white w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
              Linked Children
            </h2>
          </div>

          {children.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-12 sm:p-16 shadow-xl text-center border-2 border-dashed border-slate-300">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">No Children Linked Yet</h3>
              <p className="text-lg text-slate-600 mb-6">
                Link your first child using the form above to start tracking their progress
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-xl font-semibold">
                <BarChart3 className="w-5 h-5" />
                Start by adding a child's email
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {children.map((child, index) => (
                <div
                  key={child.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${avatarColors[index % avatarColors.length]} rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {getInitials(child.name || child.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 truncate">
                        {child.name || 'Child'}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 truncate flex items-center gap-2">
                        <Mail size={16} />
                        {child.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/parent/child/${child.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <TrendingUp size={20} />
                    View Progress
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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

export default ParentDashboard;