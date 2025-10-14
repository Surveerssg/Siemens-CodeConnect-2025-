import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, BookOpen, Zap, CheckCircle } from 'lucide-react';

export default function TherapistPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ childEmail: '', type: 'word', text: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await therapistAPI.listChildren();
        if (!mounted) return;
        setChildren(res.data || []);
      } catch (e) {
        console.error('Failed to load children:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAssign = async () => {
    if (!form.childEmail || !form.text) {
      setMessage({ type: 'error', text: 'Please choose a child and enter text' });
      return;
    }

    try {
      const payload = {
        childId: form.childEmail,
        type: form.type,
        text: form.text
      };
      await therapistAPI.assignPractice(payload);
      setMessage({ type: 'success', text: 'Assigned successfully' });
      setForm({ childEmail: '', type: 'word', text: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      console.error('Failed to assign practice:', e);
      setMessage({ type: 'error', text: e?.message || 'Failed to assign' });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-10"
        >
          <button
            onClick={() => navigate('/therapist')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-slate-200"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
            Assign Practice
          </h1>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-slate-600 font-medium">Loading children...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Alert Messages */}
            {message.text && (
              <motion.div
                variants={itemVariants}
                className={`mb-6 rounded-2xl p-4 sm:p-6 border-l-4 shadow-lg ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-red-50 border-red-500 text-red-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {message.type === 'success' ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Zap size={24} />
                  )}
                  <p className="font-semibold text-sm sm:text-base">{message.text}</p>
                </div>
              </motion.div>
            )}

            {/* Main Form Card */}
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
                {/* Form Title */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-white w-6 h-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    Assign Words & Sentences
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Select Child */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Select Child
                    </label>
                    <div className="relative">
                      <select
                        value={form.childEmail}
                        onChange={(e) => handleChange('childEmail', e.target.value)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 appearance-none cursor-pointer hover:border-slate-300"
                      >
                        <option value="">Choose a child...</option>
                        {children.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name || c.email}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Select Type */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Practice Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { value: 'word', label: 'Word', gradient: 'from-emerald-500 to-teal-600' },
                        { value: 'sentence', label: 'Sentence', gradient: 'from-amber-500 to-orange-600' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleChange('type', option.value)}
                          className={`relative py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold text-lg transition-all duration-300 border-2 ${
                            form.type === option.value
                              ? `bg-gradient-to-br ${option.gradient} text-white border-transparent shadow-lg scale-105`
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Text Input */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      {form.type === 'sentence' ? 'Enter Sentence' : 'Enter Word'}
                    </label>
                    <textarea
                      value={form.text}
                      onChange={(e) => handleChange('text', e.target.value)}
                      placeholder={form.type === 'sentence' ? 'Type a sentence here...' : 'Type a word here...'}
                      rows={form.type === 'sentence' ? 4 : 2}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                    />
                  </motion.div>

                  {/* Assign Button */}
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={handleAssign}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                      <span>Assign Practice to Child</span>
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Info Cards */}
            <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Words</h3>
                    <p className="text-sm text-slate-600">Assign individual words for focused pronunciation and spelling practice.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Sentences</h3>
                    <p className="text-sm text-slate-600">Create comprehensive practice sessions with full sentences for contextual learning.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}