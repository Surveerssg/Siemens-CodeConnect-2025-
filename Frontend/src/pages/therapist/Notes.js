import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI, parentAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, FileText, Calendar, User, MessageSquare, BookOpen, Loader
} from 'lucide-react';

const Notes = () => {
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [note, setNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const therapistEmail = "therapist@example.com";

  // Load therapist's children
  useEffect(() => {
    const loadChildren = async () => {
      try {
        const res = await therapistAPI.listChildren(); 
        const list = (res.data || []).map(c => ({
          value: c.id,
          label: c.name || c.email || c.id
        }));
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].value);
      } catch (err) {
        console.error('Failed to load children:', err);
      }
    };
    loadChildren();
  }, []);

  // Fetch parent email and notes when child is selected
  useEffect(() => {
    const fetchParentInfo = async () => {
      if (!selectedChild) return;
      try {
        const res = await therapistAPI.getParentEmail(selectedChild);
        const email = res.data?.parentEmail || '';
        setParentEmail(email);

        // Fetch all notes for this parent
        if (email) fetchNotes(email);
      } catch (err) {
        console.error('Failed to fetch parent info:', err);
        setParentEmail('');
        setNotesList([]);
      }
    };
    fetchParentInfo();
  }, [selectedChild]);

  // Fetch notes by parent email
  const fetchNotes = async (email) => {
    try {
      setNotesLoading(true);
      const res = await parentAPI.getNotes(email);
      if (res.success && Array.isArray(res.data)) {
        setNotesList(res.data);
      } else {
        setNotesList([]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotesList([]);
    } finally {
      setNotesLoading(false);
    }
  };

  // Send note
  const handleAddNote = async () => {
    if (!note.title || !note.content || !selectedChild) {
      return alert('Please fill all fields');
    }

    setLoading(true);
    try {
      const res = await therapistAPI.sendNote(selectedChild, note.title, note.content, therapistEmail);
      alert(res.message || 'Note sent successfully!');
      setNote({ title: '', content: '' });

      // Refresh notes after sending
      if (parentEmail) fetchNotes(parentEmail);
    } catch (err) {
      console.error('Error sending note:', err);
      alert('Failed to send note: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => navigate('/therapist')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-slate-200"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800">
              Send Notes
            </h1>
          </div>
        </motion.div>

        {/* Note Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Plus className="text-white w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Create New Note
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Select Child */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Child
              </label>
              <div className="relative">
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none transition-colors appearance-none cursor-pointer hover:border-slate-300"
                >
                  {children.map(child => (
                    <option key={child.value} value={child.value}>
                      {child.label}
                    </option>
                  ))}
                </select>
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Parent Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Parent Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={parentEmail}
                  disabled
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Note Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={note.title}
              onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Note Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Note Content
            </label>
            <textarea
              value={note.content}
              onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note here..."
              rows={6}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNote}
            disabled={loading || !note.title || !note.content || !selectedChild}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 ${
              loading || !note.title || !note.content || !selectedChild
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            <Plus size={20} />
            {loading ? 'Sending...' : 'Send Note'}
          </motion.button>
        </motion.div>

        {/* Notes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-white w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              All Notes Sent
            </h2>
          </div>

          {notesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
              </div>
              <p className="mt-6 text-lg text-slate-600 font-medium">Loading notes...</p>
            </div>
          ) : notesList.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="text-slate-400" size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Notes Yet</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Start by creating and sending a note to a parent. Your notes will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notesList.map((note, index) => (
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

        {/* Stats Overview */}
        {notesList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8"
          >
            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="text-white w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Total Notes</h3>
                <p className="text-4xl font-bold text-indigo-600">{notesList.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <User className="text-white w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Children</h3>
                <p className="text-4xl font-bold text-emerald-600">
                  {new Set(notesList.map(n => n.child_email)).size}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="text-white w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Titled Notes</h3>
                <p className="text-4xl font-bold text-violet-600">
                  {notesList.filter(n => n.title && n.title.length > 0).length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notes;