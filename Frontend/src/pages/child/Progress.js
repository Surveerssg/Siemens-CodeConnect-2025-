import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI, gamesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, TrendingUp, Calendar, Award, Trophy, Flame, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load current child's progress (the logged-in user)
  useEffect(() => {
    const loadSummary = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // fetch progress and games data in parallel so we can compute Total_XP correctly
        const [progressRes, gamesRes] = await Promise.all([
          progressAPI.getProgress(),
          gamesAPI.getGameData()
        ]);

        // Both endpoints return { success: true, data: { ... } }
        const progressData = progressRes?.data || progressRes || null;
        const gamesData = gamesRes?.data || gamesRes || null;

        // Normalize to same shape parent page expects: { progress, games }
        setSummary({ progress: progressData, games: gamesData });
      } catch (e) {
        console.error('Failed to load progress/games summary:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [user]);

  // Mock data for charts (replace with actual from summary if available)
  // Use values from summary when available; fallback to mock data
  const weeklyProgressData = summary?.weeklyProgress || [
    { day: 'Mon', score: 75, words: 12 },
    { day: 'Tue', score: 82, words: 15 },
    { day: 'Wed', score: 68, words: 10 },
    { day: 'Thu', score: 91, words: 18 },
    { day: 'Fri', score: 88, words: 16 },
    { day: 'Sat', score: 95, words: 20 },
    { day: 'Sun', score: 78, words: 14 }
  ];

  const activityDistribution = summary?.activityDistribution || [
    { name: 'Practice', value: 60, color: '#8FA998' },
    { name: 'Games', value: 25, color: '#5B7C99' },
    { name: 'Assessments', value: 15, color: '#C67B5C' }
  ];

  // Stats calculations
  // Calculate stats from summary data (align with parent page logic)
  const totalXP = Number(summary?.games?.Total_XP || summary?.totalXP || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || summary?.practiceDays || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
  const bestScore = summary?.games?.Best_Score || summary?.bestScore || totalXP;
  const practiceDays = totalDays;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;
  const selectedChildData = user ? { label: user.displayName || user.email || user.uid } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📈</div>
          <p className="text-2xl font-bold text-gray-700">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
              Progress Tracking
            </h1>
            <span className="text-4xl sm:text-5xl animate-bounce">📈</span>
          </div>
        </div>

        {/* Level Progress Card */}
        {selectedChildData && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg mb-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg">
                {selectedChildData.label.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow text-center sm:text-left w-full">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {selectedChildData.label}
                </h2>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-3">
                  Level {currentLevel} • {totalXP} XP Total
                </p>
                <div className="w-full bg-gray-200 rounded-full h-4 sm:h-5 overflow-hidden mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-600">
                  {1000 - (totalXP % 1000)} XP to Level {currentLevel + 1}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Average Score Card */}
          <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">📊</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Average Score</h3>
              </div>
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                {avgScore}
              </p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">
                  Per session 🎯
                </p>
              </div>
            </div>
          </div>

          {/* Best Score Card */}
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">🏆</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Award size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Best Score</h3>
              </div>
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                {bestScore}
              </p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">
                  Highest achievement ⭐
                </p>
              </div>
            </div>
          </div>

          {/* Practice Days Card */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">📅</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Calendar size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Practice Days</h3>
              </div>
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                {practiceDays}
              </p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">
                  This month 🔥
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Weekly Progress Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              Weekly Progress
              <Sparkles className="text-yellow-500 w-6 h-6 sm:w-7 sm:h-7" />
            </h2>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="day" 
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: '600' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '14px', fontWeight: '600' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Distribution */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              Activity Distribution
            </h2>
            
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={activityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelStyle={{ fontSize: '12px', fontWeight: '600' }}
                >
                  {activityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;