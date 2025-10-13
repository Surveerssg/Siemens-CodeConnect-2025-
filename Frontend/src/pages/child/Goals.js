import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { goalsAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle, 
  Circle,
  Calendar,
  User,
  Award,
  Sparkles,
  Trophy,
  Flame
} from 'lucide-react';

const Goals = () => {
  const { gameProgress } = useGame();
  const navigate = useNavigate();
  
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const toDateAny = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'string' || typeof v === 'number') {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    if (v.seconds) return new Date(v.seconds * 1000);
    if (v._seconds) return new Date(v._seconds * 1000);
    return null;
  };

  useEffect(() => {
    const loadAssignedGoals = async () => {
      try {
        setLoading(true);
        const res = await goalsAPI.listMyAssigned();
        const mapped = (res.data || []).map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          target: g.targetValue || 1,
          current: g.progress || 0,
          type: 'assigned',
          completed: g.status === 'completed',
          xp: g.xpReward || 0,
          dueDate: toDateAny(g.dueDate),
          createdAt: toDateAny(g.createdAt),
          assignedBy: g.assignedByRole || 'parent',
          parentGoalId: g.parentGoalId
        }));
        setGoals(mapped);
      } catch (e) {
        console.error('Failed to load assigned goals:', e);
      } finally {
        setLoading(false);
      }
    };
    loadAssignedGoals();
  }, []);

  const handleGoalToggle = async (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newCompleted = !goal.completed;
    const newProgress = newCompleted ? goal.target : 0;
    
    try {
      await goalsAPI.updateMyAssignedProgress(goalId, { 
        status: newCompleted ? 'completed' : 'active', 
        progress: newProgress 
      });
      
      setGoals(goals.map(g => 
        g.id === goalId ? { 
          ...g, 
          completed: newCompleted, 
          current: newProgress 
        } : g
      ));
    } catch (e) {
      console.error('Failed to update goal progress:', e);
    }
  };

  const formatDate = (d) => {
    try {
      const date = typeof d === 'string' ? new Date(d) : d;
      if (!date) return null;
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  const totalXPEarned = goals.filter(g => g.completed).reduce((sum, goal) => sum + goal.xp, 0);
  const assignedGoals = goals.filter(goal => goal.type === 'assigned');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-6xl mb-4"
          >
            🎯
          </motion.div>
          <p className="text-2xl font-bold text-gray-700">
            Loading your goals...
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
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
              My Goals
            </h1>
            <motion.span 
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-4xl sm:text-5xl"
            >
              🎯
            </motion.span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          {/* Goals Completed Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">🎯</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Target size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Goals Completed</h3>
              </div>
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                {completedGoals}<span className="text-3xl sm:text-4xl opacity-75">/{totalGoals}</span>
              </p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">
                  {Math.round(completionRate)}% Complete 🌟
                </p>
              </div>
            </div>
          </motion.div>

          {/* XP Earned Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">⭐</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Award size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Total XP Earned</h3>
              </div>
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                {totalXPEarned}
              </p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">
                  From completed goals 🏆
                </p>
              </div>
            </div>
          </motion.div>

          {/* Assigned Goals Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -8 }}
            className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-white relative overflow-hidden sm:col-span-2 lg:col-span-1"
          >
            <div className="absolute top-0 right-0 text-8xl sm:text-9xl opacity-10 -mt-4 -mr-4">👨‍👦</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <User size={24} className="sm:w-7 sm:h-7" />
                <h3 className="text-xl sm:text-2xl font-bold">Assigned Goals</h3>
              </div>
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2">
                {assignedGoals.length}
              </p>
              <div className="pt-4 border-t-2 border-white/30">
                <p className="text-sm sm:text-base font-semibold">
                  From your parents 💜
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Assigned Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Parent-Assigned Goals
            <Sparkles className="text-yellow-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>
          
          {assignedGoals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg text-center border border-gray-100"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl sm:text-7xl mb-4"
              >
                📭
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                No Goals Yet!
              </h3>
              <p className="text-base sm:text-lg text-gray-600">
                Your parents will assign goals for you to complete soon! 🎉
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            >
              {assignedGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 ${
                    goal.completed 
                      ? 'border-2 border-green-400' 
                      : 'border-2 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGoalToggle(goal.id)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          goal.completed 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-200 hover:bg-blue-500'
                        }`}
                      >
                        {goal.completed ? (
                          <CheckCircle size={20} className="text-white sm:w-6 sm:h-6" />
                        ) : (
                          <Circle size={20} className="text-gray-400 sm:w-6 sm:h-6 group-hover:text-white" />
                        )}
                      </motion.button>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`text-lg sm:text-xl font-bold ${
                          goal.completed ? 'text-green-600 line-through' : 'text-gray-800'
                        }`}>
                          {goal.title}
                        </h3>
                        <span className="text-2xl flex-shrink-0">👨‍👦</span>
                      </div>
                      
                      <p className="text-sm sm:text-base text-gray-600 mb-4">
                        {goal.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs sm:text-sm font-bold text-gray-700">
                            Progress: {goal.current}/{goal.target}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-orange-600 flex items-center gap-1">
                            <Trophy size={14} className="sm:w-4 sm:h-4" />
                            {goal.xp} XP
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              goal.completed 
                                ? 'bg-gradient-to-r from-green-400 to-green-500' 
                                : 'bg-gradient-to-r from-blue-400 to-blue-600'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Date */}
                      {goal.createdAt && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <Calendar size={14} className="sm:w-4 sm:h-4" />
                          <span>Assigned: {formatDate(goal.createdAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Progress Overview */}
        {totalGoals > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              Overall Progress
              <Trophy className="text-yellow-500 w-7 h-7" />
            </h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg sm:text-xl font-bold text-gray-700">
                  Completion Rate
                </span>
                <span className="text-2xl sm:text-3xl font-black text-blue-600">
                  {Math.round(completionRate)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 sm:h-5 overflow-hidden mb-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full"
                />
              </div>
              <p className="text-center text-base sm:text-lg font-bold text-gray-700">
                {completedGoals} of {totalGoals} goals completed! 🎉
              </p>
            </div>

            {/* Motivational Message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 sm:p-6 text-center border-2 border-purple-200"
            >
              <p className="text-lg sm:text-xl font-bold text-gray-800">
                {completionRate === 100 
                  ? "Amazing work! You've completed all your goals! 🌟" 
                  : completionRate >= 75 
                  ? "You're doing great! Keep it up! 💪"
                  : completionRate >= 50
                  ? "Halfway there! You can do it! 🚀"
                  : "Every goal completed is a step forward! 🌈"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Goals;