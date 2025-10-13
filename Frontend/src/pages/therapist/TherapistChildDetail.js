import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { therapistAPI, goalsAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, TrendingUp, Target, Award, Calendar, Star, Sparkles, Trophy, Flame
} from 'lucide-react';

const TherapistChildDetail = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [attemptsMap, setAttemptsMap] = useState({});
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await therapistAPI.getChildSummary(childId);
        setSummary(res.data || null);
        try {
          const aRes = await therapistAPI.listChildPractice(childId);
          setAssignments(aRes.data || []);
        } catch (e) {
          console.warn('Failed to load practice assignments:', e);
        }
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId]);

  const recentActivities = [
    { activity: 'Completed vowel exercises', time: '2 hours ago', score: 95, type: 'practice' },
    { activity: 'Played Word Match game', time: '1 day ago', score: 88, type: 'game' },
    { activity: 'Achieved 3-day streak', time: '2 days ago', score: 100, type: 'achievement' },
    { activity: 'Practiced consonant blends', time: '3 days ago', score: 78, type: 'practice' }
  ];

  const quickActions = [
    { 
      title: 'View Progress', 
      description: 'See detailed progress reports', 
      icon: TrendingUp, 
      color: 'from-blue-400 to-blue-600',
      hoverColor: 'hover:shadow-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: () => navigate('/therapist/analytics') 
    },
    { 
      title: 'Set Goals', 
      description: 'Assign practice goals', 
      icon: Target, 
      color: 'from-green-400 to-green-600',
      hoverColor: 'hover:shadow-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      action: () => navigate('/therapist/goals') 
    },
    { 
      title: 'Add Notes', 
      description: 'Record observations', 
      icon: Award, 
      color: 'from-orange-400 to-orange-600',
      hoverColor: 'hover:shadow-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      action: () => navigate('/therapist/notes') 
    }
  ];

  const totalXP = Number(summary?.games?.Total_XP || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
  const bestScore = totalXP;
  const practiceDays = totalDays;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/therapist')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
            Child Overview
            <Sparkles className="text-yellow-500 w-7 h-7" />
          </h1>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            Weekly Progress Overview
            <Trophy className="text-purple-500 w-7 h-7" />
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Level Card */}
            <motion.div variants={itemVariants} className="md:col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-100">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-5xl shadow-lg">
                    👶
                  </div>
                  {loading ? (
                    <p className="text-3xl font-bold text-gray-400">Loading...</p>
                  ) : (
                    <>
                      <h3 className="text-4xl font-bold text-blue-600 mb-2">
                        Level {currentLevel}
                      </h3>
                      <p className="text-lg font-semibold text-gray-700 mb-4">
                        {totalXP} XP Total
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {1000 - (totalXP % 1000)} XP to next level
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">📊</div>
                  <div className="relative">
                    <TrendingUp className="w-8 h-8 mb-2" />
                    <p className="text-sm font-semibold mb-1 opacity-90">Average Score</p>
                    <p className="text-4xl font-black">{avgScore}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">⭐</div>
                  <div className="relative">
                    <Star className="w-8 h-8 mb-2" />
                    <p className="text-sm font-semibold mb-1 opacity-90">Best Score</p>
                    <p className="text-4xl font-black">{bestScore}</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">📅</div>
                  <div className="relative">
                    <Calendar className="w-8 h-8 mb-2" />
                    <p className="text-sm font-semibold mb-1 opacity-90">Practice Days</p>
                    <p className="text-4xl font-black">{practiceDays}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            Quick Actions
            <Target className="text-green-500 w-7 h-7" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={action.action}
                className={`group bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${action.hoverColor} border border-gray-100`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 ${action.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className={`${action.iconColor} w-8 h-8`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  {action.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Assigned Practice Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            Assigned Practice Items ({assignments.length})
            <Award className="text-blue-500 w-7 h-7" />
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            {assignments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No practice items assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {assignments.slice(0, 6).map((a, idx) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-gray-800">
                          {a.type === 'sentence' ? 'Sentence' : 'Word'}: {a.text}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(a.createdAt || Date.now()).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          a.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {a.status === 'completed' ? 'Completed ✓' : (a.type === 'sentence' ? (a.latestScore ? `${a.latestScore}%` : 'Active') : 'Active')}
                        </p>
                        {a.type === 'sentence' && (
                          <button
                            onClick={async () => {
                              const target = expandedAssignment === a.id ? null : a.id;
                              setExpandedAssignment(target);
                              if (target) {
                                try {
                                  const res = await therapistAPI.getAssignmentAttempts(a.id);
                                  setAttemptsMap(prev => ({ ...prev, [a.id]: res.data || [] }));
                                } catch (e) {
                                  console.warn('Failed to fetch attempts for assignment', a.id, e);
                                }
                              }
                            }}
                            className="mt-2 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                          >
                            {expandedAssignment === a.id ? 'Hide history' : 'View history'}
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedAssignment === a.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="mt-4 pt-4 border-t border-blue-200"
                      >
                        {(attemptsMap[a.id] || []).length === 0 ? (
                          <p className="text-gray-600 text-sm">No attempts yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {(attemptsMap[a.id] || []).map(at => (
                              <div key={at.id} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                                <div>
                                  <p className="text-sm font-bold text-gray-800">
                                    {at.score !== null ? `${at.score}%` : '—'}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(at.timestamp || Date.now()).toLocaleString()}
                                  </p>
                                </div>
                                <div className="max-w-[60%]">
                                  <p className="text-sm text-gray-700">
                                    Heard: {at.predicted_text || '—'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            Recent Activities
            <Flame className="text-orange-500 w-7 h-7" />
          </h2>
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            {recentActivities.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No recent activities yet.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8, scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        activity.type === 'achievement' ? 'bg-yellow-100' :
                        activity.type === 'game' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {activity.type === 'achievement' ? '⭐' : activity.type === 'game' ? '🎮' : '📝'}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-800">{activity.activity}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-green-600">
                      {activity.score}%
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TherapistChildDetail;