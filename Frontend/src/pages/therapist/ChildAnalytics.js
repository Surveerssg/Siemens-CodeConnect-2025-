import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Award,
  Sparkles,
  User,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChildAnalytics = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        const res = await therapistAPI.listChildren();
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
        const res = await therapistAPI.getChildSummary(selectedChild);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [selectedChild]);

  const weeklyProgressData = [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 68 },
    { day: 'Thu', score: 91 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 95 },
    { day: 'Sun', score: 78 }
  ];

  const activityDistribution = [
    { name: 'Practice', value: 60, color: '#10b981' },
    { name: 'Games', value: 25, color: '#3b82f6' },
    { name: 'Assessments', value: 15, color: '#f59e0b' }
  ];

  const totalXP = Number(summary?.games?.Total_XP || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
  const bestScore = totalXP;
  const practiceDays = totalDays;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;
  const selectedChildData = children.find(child => child.value === selectedChild);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading && !selectedChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl mb-6"
          >
            📊
          </motion.div>
          <p className="text-3xl font-bold text-gray-700">
            Loading analytics...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/therapist')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </motion.button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
            Child Analytics
            <Sparkles className="text-yellow-500 w-7 h-7" />
          </h1>
        </motion.div>

        {/* Child Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <label className="text-lg font-bold text-gray-800 mb-3 inline-flex items-center gap-2">
              <User className="text-blue-500 w-6 h-6" />
              Select Child
            </label>
            <div className="relative">
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl font-bold text-gray-800 text-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer hover:border-blue-400"
              >
                {children.map((child) => (
                  <option key={child.value} value={child.value}>
                    {child.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level Progress Card */}
        {selectedChildData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 border-2 border-purple-200 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl sm:text-6xl font-black shadow-xl"
              >
                {selectedChildData.label.charAt(0).toUpperCase()}
              </motion.div>
              <div className="flex-grow text-center sm:text-left w-full">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">
                  {selectedChildData.label}
                </h2>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-4">
                  Level {currentLevel} • {totalXP} XP Total
                </p>
                <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden mb-2 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-full rounded-full shadow-md"
                  />
                </div>
                <p className="text-sm sm:text-base font-bold text-gray-600">
                  {1000 - (totalXP % 1000)} XP to Level {currentLevel + 1}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8"
        >
          {/* Average Score Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10 -mt-4 -mr-4">📊</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={28} className="sm:w-8 sm:h-8" />
                <h3 className="text-xl sm:text-2xl font-bold">Average Score</h3>
              </div>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-5xl sm:text-6xl font-black mb-2"
              >
                {avgScore}
              </motion.p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">Per session 🎯</p>
              </div>
            </div>
          </motion.div>

          {/* Best Score Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10 -mt-4 -mr-4">🏆</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Award size={28} className="sm:w-8 sm:h-8" />
                <h3 className="text-xl sm:text-2xl font-bold">Best Score</h3>
              </div>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-5xl sm:text-6xl font-black mb-2"
              >
                {bestScore}
              </motion.p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">Highest achievement ⭐</p>
              </div>
            </div>
          </motion.div>

          {/* Practice Days Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10 -mt-4 -mr-4">📅</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={28} className="sm:w-8 sm:h-8" />
                <h3 className="text-xl sm:text-2xl font-bold">Practice Days</h3>
              </div>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-5xl sm:text-6xl font-black mb-2"
              >
                {practiceDays}
              </motion.p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">This month 🔥</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-purple-100 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <BarChart3 className="text-blue-500 w-7 h-7" />
              Weekly Progress
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Arial' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'Arial' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '3px solid #3b82f6',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: 'Arial',
                    padding: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-purple-100 hover:shadow-2xl transition-all duration-300"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
              <PieChartIcon className="text-purple-500 w-7 h-7" />
              Activity Mix
            </h2>
            
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ 
                    fontSize: '13px', 
                    fontWeight: '700',
                    fontFamily: 'Arial',
                    fill: '#374151'
                  }}
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '3px solid #a855f7',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '700',
                    fontFamily: 'Arial',
                    padding: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Words Mastered */}
          <motion.div
            whileHover={{ scale: 1.03, y: -6 }}
            className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10 -mt-4 -mr-4">📚</div>
            <div className="relative">
              <h3 className="text-2xl font-bold mb-4">Words Mastered</h3>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="text-6xl font-black"
              >
                {summary?.progress?.Words_Learned || 0}
              </motion.p>
              <p className="text-lg font-semibold mt-3 opacity-90">Keep learning! 📖</p>
            </div>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            whileHover={{ scale: 1.03, y: -6 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-10 -mt-4 -mr-4">🔥</div>
            <div className="relative">
              <h3 className="text-2xl font-bold mb-4">Current Streak</h3>
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="text-6xl font-black"
              >
                {summary?.progress?.Current_Streak || 0}
              </motion.p>
              <p className="text-lg font-semibold mt-3 opacity-90">Days in a row! 🚀</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChildAnalytics;