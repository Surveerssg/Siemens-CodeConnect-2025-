import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { parentAPI, goalsAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar, 
  Star, 
  Zap,
  Trophy,
  Activity,
  CheckCircle,
  Gamepad2,
  BookOpen
} from 'lucide-react';

const ChildDetail = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await parentAPI.getChildSummary(childId);
        setSummary(res.data || null);
      } catch (e) {
        console.error('Failed to load child summary:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [childId]);

  // Mock data for recent activities
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
      gradient: 'from-indigo-500 to-blue-600',
      action: () => navigate('/parent/progress') 
    },
    { 
      title: 'Set Goals', 
      description: 'Assign practice goals', 
      icon: Target, 
      gradient: 'from-emerald-500 to-teal-600',
      action: () => navigate('/parent/goals') 
    },
    { 
      title: 'Add Notes', 
      description: 'Record observations', 
      icon: Award, 
      gradient: 'from-amber-500 to-orange-600',
      action: () => navigate('/parent/notes') 
    }
  ];

  // Calculate stats from summary data
  const totalXP = Number(summary?.games?.Total_XP || 0);
  const totalDays = Number(summary?.progress?.Practice_Days || 0);
  const avgScore = totalDays > 0 ? Math.round((totalXP / totalDays) * 100) / 100 : 0;
  const bestScore = totalXP;
  const practiceDays = totalDays;
  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const levelProgress = (totalXP % 1000) / 10;

  const getActivityIcon = (type) => {
    switch(type) {
      case 'achievement':
        return { icon: Trophy, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' };
      case 'game':
        return { icon: Gamepad2, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' };
      default:
        return { icon: BookOpen, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600' };
    }
  };

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
              <span className="hidden sm:inline">Back to Dashboard</span>
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
              Child Overview
            </h1>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-slate-600 font-medium">Loading overview...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Weekly Progress Overview Section */}
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
                Weekly Progress Overview
              </h2>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-8">
              {/* Level Progress Card */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-4"
              >
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4">
                      {currentLevel}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      Level {currentLevel}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap size={18} className="text-amber-500" />
                      <p className="text-lg text-slate-600 font-medium">
                        {totalXP} XP Total
                      </p>
                    </div>
                    <div className="w-full space-y-2">
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                        />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        {1000 - (totalXP % 1000)} XP to next level
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="text-white w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">
                        Average Score
                      </h3>
                      <p className="text-3xl font-bold text-emerald-600">
                        {avgScore}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Star className="text-white w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">
                        Best Score
                      </h3>
                      <p className="text-3xl font-bold text-amber-600">
                        {bestScore}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="text-white w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-2">
                        Practice Days
                      </h3>
                      <p className="text-3xl font-bold text-indigo-600">
                        {practiceDays}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="text-white w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Quick Actions
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={action.action}
                        className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-16 h-16 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="text-white w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {action.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {action.description}
                          </p>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activities */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="text-white w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Recent Activities
                </h2>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <Activity className="w-12 h-12 text-slate-400" />
                    </div>
                    <p className="text-lg text-slate-600">No recent activities yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => {
                      const activityType = getActivityIcon(activity.type);
                      const ActivityIcon = activityType.icon;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${activityType.color} group-hover:scale-110 transition-transform duration-300`}>
                              <ActivityIcon className="text-white w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base sm:text-lg font-semibold text-slate-800 mb-1 truncate">
                                {activity.activity}
                              </h4>
                              <p className="text-sm text-slate-600">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                              {activity.score}
                            </span>
                            <span className="text-sm text-slate-600 font-medium">%</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChildDetail;