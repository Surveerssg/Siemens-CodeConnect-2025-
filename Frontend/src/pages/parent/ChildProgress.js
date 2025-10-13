import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  Activity,
  Zap,
  Trophy,
  Star
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChildProgress = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await parentAPI.listChildren();
        const list = (res.data || []).map(c => ({ value: c.id, label: c.name || c.email || c.id }));
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].value);
      } catch (e) {
        console.error('Failed to load children:', e);
      } finally {
        setLoading(false);
      }
    };
    loadChildren();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedChild) return;
      try {
        setLoading(true);
        const res = await parentAPI.getChildSummary(selectedChild);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [selectedChild]);

  // Mock data for charts
  const weeklyProgressData = [
    { day: 'Mon', score: 75, words: 12 },
    { day: 'Tue', score: 82, words: 15 },
    { day: 'Wed', score: 68, words: 10 },
    { day: 'Thu', score: 91, words: 18 },
    { day: 'Fri', score: 88, words: 16 },
    { day: 'Sat', score: 95, words: 20 },
    { day: 'Sun', score: 78, words: 14 }
  ];

  const activityDistribution = [
    { name: 'Practice', value: 60, color: '#6366f1' },
    { name: 'Games', value: 25, color: '#8b5cf6' },
    { name: 'Assessments', value: 15, color: '#ec4899' }
  ];

  // Calculate stats from summary data
  const totalXP = Number(summary?.games?.Total_XP || summary?.games?.Total_XP_Earned || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || summary?.progress?.Practice_Days || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : (summary?.progress?.Average_Score || 0);
  const bestScore = summary?.progress?.Best_Score || summary?.games?.Best_Score || totalXP;
  const practiceDays = totalDays || summary?.progress?.Practice_Days || 0;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;
  const selectedChildData = children.find(child => child.value === selectedChild);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/parent')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-slate-200"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
              Progress Tracking 📈
            </h1>
          </div>
        </motion.div>

        {/* Child Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Child
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full sm:w-96 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base font-medium"
            >
              {children.map((child) => (
                <option key={child.value} value={child.value}>
                  {child.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-slate-600 font-medium">Loading progress data...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Level Progress Card */}
            {selectedChildData && (
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 mb-8"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${avatarColors[children.findIndex(c => c.value === selectedChild) % avatarColors.length]} rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-lg flex-shrink-0`}>
                    {getInitials(selectedChildData.label)}
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                      {selectedChildData.label}
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 justify-center sm:justify-start">
                      <span className="text-lg sm:text-xl font-semibold text-indigo-600">
                        Level {currentLevel}
                      </span>
                      <span className="hidden sm:inline text-slate-400">•</span>
                      <span className="text-base sm:text-lg text-slate-600 flex items-center gap-1">
                        <Zap size={18} className="text-amber-500" />
                        {totalXP} XP Total
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                        />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        {1000 - (totalXP % 1000)} XP to Level {currentLevel + 1}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Average Score</h3>
                  <p className="text-4xl font-bold text-emerald-600 mb-1">{avgScore}</p>
                  <p className="text-sm text-slate-600">Per session</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Best Score</h3>
                  <p className="text-4xl font-bold text-amber-600 mb-1">{bestScore}</p>
                  <p className="text-sm text-slate-600">Highest achievement</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Practice Days</h3>
                  <p className="text-4xl font-bold text-indigo-600 mb-1">{practiceDays}</p>
                  <p className="text-sm text-slate-600">This month</p>
                </div>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Weekly Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748b"
                      style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
                    />
                    <YAxis 
                      stroke="#64748b"
                      style={{ fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        fontFamily: 'Arial, sans-serif',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 text-center">Activity Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif' }}
                    >
                      {activityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Target className="text-white w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Words Mastered</h3>
                </div>
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-violet-600 mb-2">
                    {summary?.progress?.Words_Learned || 0}
                  </p>
                  <p className="text-sm text-slate-600">Total words successfully practiced</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="text-white w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Current Streak</h3>
                </div>
                <div className="text-center py-4">
                  <p className="text-5xl font-bold text-fuchsia-600 mb-2">
                    {summary?.progress?.Current_Streak || 0}
                  </p>
                  <p className="text-sm text-slate-600">Consecutive days of practice</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChildProgress;