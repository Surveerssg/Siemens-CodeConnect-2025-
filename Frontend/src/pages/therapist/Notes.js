import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistAPI, parentAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Send, User, Calendar, FileText, Sparkles, Mail, BookOpen, Users
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
  const [expandedNotes, setExpandedNotes] = useState({});

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
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
    return new Date(timestamp).toLocaleString();
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
            Therapist Notes
            <Sparkles className="text-yellow-500 w-7 h-7" />
          </h1>
        </motion.div>

        {/* Note Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Send className="text-blue-500 w-7 h-7" />
            Send New Note
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Select Child */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Child
              </label>
              <div className="relative">
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-800 focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  {children.map(child => (
                    <option key={child.value} value={child.value}>
                      {child.label}
                    </option>
                  ))}
                </select>
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Parent Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Parent Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={parentEmail}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 cursor-not-allowed"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Note Title */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note Title
            </label>
            <input
              type="text"
              value={note.title}
              onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Note Content */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note Content
            </label>
            <textarea
              value={note.content}
              onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note here..."
              rows={6}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-800 focus:border-blue-500 focus:outline-none transition-colors resize-none"
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
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-400 to-green-600 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            <Plus size={20} />
            {loading ? 'Sending...' : 'Send Note'}
          </motion.button>
        </motion.div>

        {/* Notes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FileText className="text-purple-500 w-7 h-7" />
            All Notes Sent to Parent
          </h2>
          
          {notesLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading notes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <User size={16} />
                        Child Email
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left font-bold text-gray-800">
                      Title
                    </th>
                    <th className="px-4 py-4 text-left font-bold text-gray-800">
                      Content
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 font-bold text-gray-800">
                        <Calendar size={16} />
                        Date
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notesList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-600 font-semibold">
                        No notes sent yet. 📝
                      </td>
                    </tr>
                  ) : (
                    notesList.map((n, index) => (
                      <motion.tr
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-4 font-semibold text-blue-600">
                          {n.child_email || 'N/A'}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-800">
                          {n.title || 'Untitled'}
                        </td>
                        <td className="px-4 py-4 text-gray-700 max-w-md">
                          {(() => {
                            const content = n.notes || '';
                            const isExpanded = !!expandedNotes[n.id];
                            const previewLength = 80;
                            if (!content) return '-';
                            if (isExpanded) {
                              return (
                                <div>
                                  <p className="whitespace-pre-wrap">{content}</p>
                                  {content.length > previewLength && (
                                    <button
                                      onClick={() => setExpandedNotes(prev => ({ ...prev, [n.id]: false }))}
                                      className="mt-2 text-blue-600 font-semibold hover:text-blue-700 text-sm"
                                    >
                                      Show less
                                    </button>
                                  )}
                                </div>
                              );
                            }

                            const preview = content.length > previewLength ? `${content.slice(0, previewLength)}...` : content;
                            return (
                              <div>
                                <p className="whitespace-pre-wrap">{preview}</p>
                                {content.length > previewLength && (
                                  <button
                                    onClick={() => setExpandedNotes(prev => ({ ...prev, [n.id]: true }))}
                                    className="mt-2 text-blue-600 font-semibold hover:text-blue-700 text-sm"
                                  >
                                    Show more
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-4 text-gray-600 font-medium">
                          {formatDate(n.createdAt)}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Summary Card */}
        {notesList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <BookOpen className="text-orange-500 w-7 h-7" />
              Notes Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Total Notes */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-6 shadow-lg text-white text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">📝</div>
                <div className="relative">
                  <p className="text-5xl font-black mb-2">{notesList.length}</p>
                  <p className="text-lg font-semibold opacity-90">Total Notes</p>
                </div>
              </motion.div>

              {/* Children */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl p-6 shadow-lg text-white text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">👶</div>
                <div className="relative">
                  <p className="text-5xl font-black mb-2">
                    {new Set(notesList.map(n => n.child_email)).size}
                  </p>
                  <p className="text-lg font-semibold opacity-90">Children</p>
                </div>
              </motion.div>

              {/* Titled Notes */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-lg text-white text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">✍️</div>
                <div className="relative">
                  <p className="text-5xl font-black mb-2">
                    {notesList.filter(n => n.title && n.title.length > 0).length}
                  </p>
                  <p className="text-lg font-semibold opacity-90">Titled Notes</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Notes;