import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ROLES } from '../../constants';
import { Mic, ArrowRight, Loader2, AlertCircle, Sparkles, Star, Heart } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      let userRole = ROLES.CHILD;

      if (userDoc.exists()) {
        const userData = userDoc.data();
        userRole = userData.role || ROLES.CHILD;
      }

      // Navigate based on user role
      switch (userRole) {
        case ROLES.CHILD:
          navigate('/dashboard');
          break;
        case ROLES.PARENT:
          navigate('/parent');
          break;
        case ROLES.THERAPIST:
          navigate('/therapist');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-green-50 to-orange-100 flex items-center justify-center px-4 py-8 relative overflow-hidden">
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
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-lg rounded-[32px] shadow-2xl p-8 md:p-10 border-2 border-white/80 relative overflow-hidden">
          {/* Decorative Corner Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#ffe588] to-[#f79d65] rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-[#5ef2d5] to-[#60b5ff] rounded-full opacity-30 blur-2xl" />

          {/* Logo & Header */}
          <div className="text-center mb-8 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] rounded-full blur-xl opacity-30"
                />
                <div className="relative bg-gradient-to-br from-[#f79d65] to-[#f35252] rounded-full p-5 shadow-xl">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] bg-clip-text text-transparent"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Welcome Back!
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 text-lg font-semibold"
            >
              Let's continue your adventure!
            </motion.p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#f79d65] focus:ring-4 focus:ring-[#f79d65]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                placeholder="your@email.com"
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-[#5ef2d5] focus:ring-4 focus:ring-[#5ef2d5]/10 outline-none transition-all text-gray-800 font-semibold placeholder-gray-400"
                placeholder="••••••••"
              />
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#f79d65] to-[#f35252] text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-gray-600 font-semibold">
              Don't have an account?{' '}
              <Link
                to="/role-selector"
                className="text-[#f79d65] font-black hover:text-[#f35252] transition-colors hover:underline"
              >
                Sign up here! 🚀
              </Link>
            </p>
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

export default Login;