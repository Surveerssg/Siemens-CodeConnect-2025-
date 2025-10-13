import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { parentAPI } from '../../services/api';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  MessageSquare,
  BookOpen,
  Loader
} from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        console.log("📤 Fetching parent notes for:", user.email);

        const res = await parentAPI.getNotes(user.email);

        if (res?.success && Array.isArray(res.data)) {
          setNotes(res.data);
          console.log(`✅ Received ${res.data.length} notes.`);
        } else {
          console.warn("⚠️ Unexpected response format:", res);
          setNotes([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch notes:", err);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user?.email]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toDate) return timestamp.toDate().toLocaleString();
      if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
      return new Date(timestamp).toLocaleString();
    } catch {
      return 'Invalid Date';
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

  const getInitials = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  const avatarColors = [
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-fuchsia-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
  ];

  const getColorForEmail = (email) => {
    if (!email) return avatarColors[0];
    const index = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatarColors[index % avatarColors.length];
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
              Therapist Notes
            </h1>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
            </div>
            <p className="mt-6 text-lg text-slate-600 font-medium">Loading notes...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Overview */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Total Notes</h3>
                  <p className="text-4xl font-bold text-indigo-600">{notes.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <User className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Children</h3>
                  <p className="text-4xl font-bold text-emerald-600">
                    {new Set(notes.map(n => n.child_email)).size}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="text-white w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Recent Notes</h3>
                  <p className="text-4xl font-bold text-violet-600">
                    {notes.filter(n => {
                      const noteDate = n.createdAt?.seconds 
                        ? new Date(n.createdAt.seconds * 1000) 
                        : new Date(n.createdAt);
                      const daysDiff = (Date.now() - noteDate) / (1000 * 60 * 60 * 24);
                      return daysDiff <= 7;
                    }).length}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Notes List */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-white w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  All Notes
                </h2>
              </div>

              {notes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="text-slate-400" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No Notes Yet</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Your child's therapist hasn't shared any notes yet. Check back later for updates on your child's progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 bg-gradient-to-br ${getColorForEmail(note.child_email)} rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                            {getInitials(note.child_email)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                            <h3 className="text-xl font-bold text-slate-800">
                              {note.title || 'Untitled Note'}
                            </h3>
                            <div className="flex items-center text-sm text-slate-600 flex-shrink-0">
                              <Calendar size={14} className="mr-2" />
                              {formatDate(note.createdAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-blue-200 rounded-lg text-sm font-semibold text-blue-700">
                              <User size={14} />
                              {note.child_email || 'Unknown'}
                            </span>
                          </div>

                          <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {note.notes || 'No content provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Desktop Table View (Hidden on Mobile) */}
            {notes.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="hidden xl:block bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 mt-8"
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Table View</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Child
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Content
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {notes.map((note, index) => (
                        <motion.tr
                          key={note.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-blue-50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-br ${getColorForEmail(note.child_email)} rounded-lg flex items-center justify-center text-sm font-bold text-white`}>
                                {getInitials(note.child_email)}
                              </div>
                              <span className="text-sm font-medium text-slate-800">
                                {note.child_email || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-slate-800">
                              {note.title || 'Untitled'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 line-clamp-2">
                              {note.notes || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">
                              {formatDate(note.createdAt)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notes;