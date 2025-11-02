import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ROLES } from '../../constants';
import { Mic, ArrowRight, ArrowLeft, Loader2, AlertCircle, Sparkles, Star, Heart } from 'lucide-react';

const SPECIALIZATION_LABELS = {
  'speech-language-pathology': 'Speech-Language Pathology',
  'pediatric-therapy': 'Pediatric Therapy',
  'hearing-impaired': 'Hearing Impaired',
  'autism-spectrum': 'Autism Spectrum',
  'general': 'General Therapy'
};

const SignupTherapist = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    license: '',
    institution: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const waitForUserDoc = async (uid, maxAttempts = 12, intervalMs = 250) => {
    const ref = doc(db, 'users', uid);
    let attempts = 0;
    while (attempts < maxAttempts) {
      const snap = await getDoc(ref);
      if (snap.exists()) return snap;
      attempts++;
      await sleep(intervalMs);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const payload = {
        name: formData.name,
        email: formData.email,
        role: ROLES.THERAPIST,
        license: formData.license || '',
        institution: formData.institution || '',
        specialization: formData.specialization || '',
        createdAt: new Date(),
        assignedChildren: []
      };

      await setDoc(userDocRef, payload, { merge: true });

      const docSnap = await waitForUserDoc(userCredential.user.uid, 12, 250);
      if (!docSnap) {
        console.warn('Timed out waiting for user doc to be readable.');
      }

      try {
        if (auth.currentUser && typeof auth.currentUser.reload === 'function') {
          await auth.currentUser.reload();
        }
        if (auth.currentUser && typeof auth.currentUser.getIdToken === 'function') {
          await auth.currentUser.getIdToken(true);
        }
      } catch (reloadErr) {
        console.warn('Error reloading auth user or refreshing token:', reloadErr);
      }

      navigate('/therapist', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-green-50 to-orange-100 flex items-center justify-center px-4 py-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-[#ffe588] to-[#f79d65] rounded-full opacity-20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-40 right-20 w-56 h-56 bg-gradient-to-br from-[#60b5ff] to-[#5ef2d5] rounded-full opacity-20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-40 left-1/4 w-48 h-48 bg-gradient-to-br from-[#f79d65] to-[#f35252] rounded-full opacity-15 blur-3xl"
      />

      {/* Floating Emojis */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-[15%] text-5xl"
      >
        🎨
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-32 right-[20%] text-5xl"
      >
        ✨
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 left-[10%] text-5xl"
      >
        🌟
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-20 right-[15%] text-5xl"
      >
        🎯
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-lg rounded-[32px] shadow-2xl p-6 md:p-8 border-2 border-white/80 relative overflow-hidden">
          {/* Decorative Corner Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#ffe588] to-[#f79d65] rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-[#5ef2d5] to-[#60b5ff] rounded-full opacity-30 blur-2xl" />

          {/* Logo & Header */}
          <div className="text-center mb-6 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-flex items-center justify-center mb-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] rounded-full blur-xl opacity-30" />
                <div className="relative bg-gradient-to-br from-[#ffe588] to-[#f79d65] rounded-full p-5 shadow-xl">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-[#ffe588] via-[#f79d65] to-[#f35252] bg-clip-text text-transparent"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Join as a Therapist!
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 text-lg font-semibold"
            >
              Help children grow and succeed!
            </motion.p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-5 p-3 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </motion.div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3 mb-5">
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#ffe588] focus:ring-4 focus:ring-[#ffe588]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                  placeholder="Enter your name"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  License Number
                </label>
                <input
                  type="text"
                  name="license"
                  value={formData.license}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#f79d65] focus:ring-4 focus:ring-[#f79d65]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                  placeholder="License #"
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#ffe588] focus:ring-4 focus:ring-[#ffe588]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                placeholder="your@email.com"
              />
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Institution / Clinic
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#5ef2d5] focus:ring-4 focus:ring-[#5ef2d5]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                  placeholder="Institution name"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#60b5ff] focus:ring-4 focus:ring-[#60b5ff]/10 outline-none transition-all text-gray-800 font-semibold appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
                >
                  <option value="">Select specialization</option>
                  <option value="speech-language-pathology">Speech-Language Pathology</option>
                  <option value="pediatric-therapy">Pediatric Therapy</option>
                  <option value="hearing-impaired">Hearing Impaired</option>
                  <option value="autism-spectrum">Autism Spectrum</option>
                  <option value="general">General Therapy</option>
                </select>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#5ef2d5] focus:ring-4 focus:ring-[#5ef2d5]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                  placeholder="••••••••"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-gray-700 font-bold mb-2 text-sm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#5ef2d5] focus:ring-4 focus:ring-[#5ef2d5]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                  placeholder="••••••••"
                />
              </motion.div>
            </div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.75 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#ffe588] to-[#f79d65] text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group mt-5"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Back to Role Selection */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center pt-5 border-t-2 border-gray-100"
          >
            <Link
              to="/role-selector"
              className="inline-flex items-center gap-2 text-gray-600 font-semibold hover:text-[#ffe588] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Role Selection</span>
            </Link>
          </motion.div>

          {/* Decorative Stars */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-8 right-8"
          >
            <Sparkles className="w-6 h-6 text-[#ffe588]" fill="currentColor" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.3, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-8 left-8"
          >
            <Star className="w-5 h-5 text-[#5ef2d5]" fill="currentColor" />
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-6 text-gray-600 font-semibold"
        >
          Made with <Heart className="w-4 h-4 inline text-red-500" fill="currentColor" /> for children everywhere ✨
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignupTherapist;