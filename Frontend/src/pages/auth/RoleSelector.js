import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Users, Hospital, ArrowRight, Sparkles, Star } from 'lucide-react';

const RoleSelector = () => {
  const roles = [
    {
      id: 'child',
      title: 'I\'m a Child',
      description: 'Practice speaking with fun games and activities!',
      icon: Mic,
      color: 'from-[#f79d65] to-[#f35252]',
      link: '/signup/child',
      emoji: '👶'
    },
    {
      id: 'parent',
      title: 'I\'m a Parent',
      description: 'Track your child\'s progress and support their journey!',
      icon: Users,
      color: 'from-[#60b5ff] to-[#5ef2d5]',
      link: '/signup/parent',
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      id: 'therapist',
      title: 'I\'m a Therapist',
      description: 'Monitor progress and provide professional guidance!',
      icon: Hospital,
      color: 'from-[#ffe588] to-[#f79d65]',
      link: '/signup/therapist',
      emoji: '👩‍⚕️'
    }
  ];

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
        🚀
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-lg rounded-[32px] shadow-2xl p-8 md:p-10 border-2 border-white/80 relative overflow-hidden">
          {/* Decorative Corner Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#ffe588] to-[#f79d65] rounded-full opacity-30 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-br from-[#5ef2d5] to-[#60b5ff] rounded-full opacity-30 blur-2xl" />

          {/* Header */}
          <div className="text-center mb-10 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-flex items-center justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] rounded-full blur-xl opacity-30" />
                <div className="relative bg-gradient-to-br from-[#f79d65] to-[#f35252] rounded-full p-5 shadow-xl">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] bg-clip-text text-transparent"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Choose Your Role!
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 text-lg font-semibold"
            >
              Let's get you started on your journey
            </motion.p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="relative group"
              >
                <Link to={role.link} className="block">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-transparent relative overflow-hidden h-full">
                    {/* Hover Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative z-10 text-center flex flex-col h-full">
                      {/* Emoji */}
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                        className="text-5xl mb-3"
                      >
                        {role.emoji}
                      </motion.div>

                      {/* Icon */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-4 shadow-md mx-auto`}>
                        <role.icon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-black mb-2 text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        {role.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm font-semibold mb-4 leading-relaxed flex-grow">
                        {role.description}
                      </p>

                      {/* Button */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-3 bg-gradient-to-r ${role.color} text-white font-black text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer`}
                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                      >
                        <span>Select</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Login Link */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center pt-6 border-t-2 border-gray-100"
          >
            <p className="text-gray-600 font-semibold">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#f79d65] font-black hover:text-[#f35252] transition-colors hover:underline"
              >
                Sign in here! 👤
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
      </motion.div>
    </div>
  );
};

export default RoleSelector;