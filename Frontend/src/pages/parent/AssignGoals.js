import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentGoalsAPI, parentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus,
  Calendar,
  User,
  Target,
  Award,
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';

const AssignGoals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parentGoals, setParentGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '1',
    xp_reward: '25',
    children_email: ''
  });

  const [children, setChildren] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const loadChildrenAndGoals = async () => {
      try {
        setLoading(true);
        const childrenRes = await parentAPI.listChildren();
        setChildren(childrenRes.data || []);

        const goalsRes = await parentGoalsAPI.list();
        const normalized = (goalsRes.data || []).map(g => ({
          ...g,
          assignedStatus: g.assignedStatus || null,
          assignedProgress: typeof g.assignedProgress !== 'undefined' ? g.assignedProgress : null
        }));
        setParentGoals(normalized);
      } catch (e) {
        console.error('Failed to load data:', e);
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };
    loadChildrenAndGoals();
  }, []);

  const childOptions = children.map(c => ({ 
    value: c.email || c.childEmail, 
    label: c.name || c.email || 'Unknown Child' 
  }));

  const handleInputChange = (field, value) => {
    setNewGoal(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssignGoal = async () => {
    if (!newGoal.children_email || !newGoal.title || !newGoal.target) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const payload = {
        title: newGoal.title,
        description: newGoal.description,
        target: parseInt(newGoal.target),
        xp_reward: parseInt(newGoal.xp_reward),
        children_email: newGoal.children_email
      };

      const res = await parentGoalsAPI.create(payload);
      
      const createdGoal = { 
        id: res.data.parentGoalId, 
        ...payload,
        createdAt: new Date(),
        status: 'active'
      };
      
      setParentGoals(prev => [createdGoal, ...prev]);
      
      setNewGoal({
        title: '',
        description: '',
        target: '1',
        xp_reward: '25',
        children_email: ''
      });
      
      setMessage({ type: 'success', text: 'Goal assigned successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      console.error('Failed to assign goal:', e);
      setMessage({ type: 'error', text: e?.response?.data?.error || 'Failed to assign goal' });
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await parentGoalsAPI.delete(goalId);
      setParentGoals(prev => prev.filter(goal => goal.id !== goalId));
      setMessage({ type: 'success', text: 'Goal deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      console.error('Failed to delete goal:', e);
      setMessage({ type: 'error', text: 'Failed to delete goal' });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChildName = (childEmail) => {
    const child = children.find(c => (c.email || c.childEmail) === childEmail);
    return child?.name || childEmail || 'Unknown Child';
  };

  const getDisplayedStatus = (goal) => {
    if (goal.assignedStatus) return goal.assignedStatus;
    return goal.status || 'active';
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
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
              Assign Goals to Children
            </h1>
          </div>
        </motion.div>

        {/* Alert Message */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Create New Goal Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Plus className="text-white w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Create New Goal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Select Child */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Child *
                </label>
                <div className="relative">
                  <select
                    value={newGoal.children_email}
                    onChange={(e) => handleInputChange('children_email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base font-medium appearance-none bg-white"
                  >
                    <option value="">Choose a child...</option>
                    {childOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Goal Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter goal title"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter goal description"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base resize-none"
                />
              </div>

              {/* Target Value */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Value *
                </label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => handleInputChange('target', e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base"
                />
              </div>

              {/* XP Reward */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  XP Reward
                </label>
                <input
                  type="number"
                  value={newGoal.xp_reward}
                  onChange={(e) => handleInputChange('xp_reward', e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-base"
                />
              </div>

              {/* Assign Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleAssignGoal}
                  disabled={!newGoal.children_email || !newGoal.title || !newGoal.target}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Assign Goal
                </button>
              </div>
            </div>
          </motion.div>

          {/* Assigned Goals List */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="text-white w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Your Assigned Goals ({parentGoals.length})
              </h2>
            </div>

            {parentGoals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="text-slate-400" size={40} />
                </div>
                <p className="text-lg text-slate-600">
                  No goals assigned yet. Create your first goal above!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {parentGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          {goal.title}
                        </h3>
                        
                        {goal.description && (
                          <p className="text-slate-600 mb-3">
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700">
                            <User size={14} />
                            {getChildName(goal.children_email)}
                          </span>
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-emerald-200 rounded-lg text-sm font-semibold text-emerald-700">
                            <Target size={14} />
                            Target: {goal.target}
                          </span>
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-amber-200 rounded-lg text-sm font-semibold text-amber-700">
                            <Award size={14} />
                            {goal.xp_reward} XP
                          </span>
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold ${
                            getDisplayedStatus(goal) === 'completed' 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-indigo-500 text-white'
                          }`}>
                            {getDisplayedStatus(goal) === 'completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                            {getDisplayedStatus(goal)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar size={14} className="mr-2" />
                          Created: {formatDate(goal.createdAt)}
                        </div>
                      </div>
                      
                      <div className="lg:ml-4">
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-all duration-200 hover:scale-105"
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Statistics Card */}
          {parentGoals.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">Goals Overview</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="text-white w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-indigo-600 mb-1">
                    {parentGoals.length}
                  </p>
                  <p className="text-sm font-semibold text-slate-600">Total Goals</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 text-center border border-emerald-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="text-white w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-emerald-600 mb-1">
                    {parentGoals.filter(g => getDisplayedStatus(g) === 'active').length}
                  </p>
                  <p className="text-sm font-semibold text-slate-600">Active Goals</p>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 text-center border border-violet-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <User className="text-white w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-violet-600 mb-1">
                    {new Set(parentGoals.map(g => g.children_email)).size}
                  </p>
                  <p className="text-sm font-semibold text-slate-600">Children with Goals</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center border border-amber-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Award className="text-white w-6 h-6" />
                  </div>
                  <p className="text-4xl font-bold text-amber-600 mb-1">
                    {parentGoals.reduce((sum, goal) => sum + parseInt(goal.xp_reward), 0)}
                  </p>
                  <p className="text-sm font-semibold text-slate-600">Total XP Available</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AssignGoals;