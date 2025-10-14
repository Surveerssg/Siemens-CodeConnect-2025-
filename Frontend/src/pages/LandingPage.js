import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Star, Heart, Zap, Trophy, Target, Users, Book, Volume2, Smile, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const y3 = useTransform(scrollY, [0, 300], [0, 30]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const characters = [
    { emoji: '🦁', color: '#FFD700', delay: 0 },
    { emoji: '🐼', color: '#FF69B4', delay: 0.2 },
    { emoji: '🦊', color: '#FF6347', delay: 0.4 },
    { emoji: '🐨', color: '#87CEEB', delay: 0.6 },
    { emoji: '🐸', color: '#90EE90', delay: 0.8 },
  ];

  const features = [
    {
      icon: <Volume2 className="w-8 h-8" />,
      title: "Speech Practice",
      description: "Practice pronunciation with fun AI feedback!",
      color: "#FF6B9D"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Fun Games",
      description: "Play exciting games while learning to speak!",
      color: "#FFA500"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Earn Rewards",
      description: "Collect badges, stars, and level up!",
      color: "#FFD700"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Track Progress",
      description: "See how awesome you're becoming!",
      color: "#00CED1"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Family Support",
      description: "Parents and therapists help you grow!",
      color: "#9370DB"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Made with Love",
      description: "Designed specially for amazing kids like you!",
      color: "#FF69B4"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-300 overflow-hidden relative font-comic">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 50 - 25, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <div
              className="text-2xl opacity-30"
              style={{
                filter: 'blur(1px)',
              }}
            >
              {['⭐', '🌟', '✨', '💫', '🎈', '🎨', '🎪', '🎭'][Math.floor(Math.random() * 8)]}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 pt-20 pb-32">
        {/* Floating Characters */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {characters.map((char, index) => (
            <motion.div
              key={index}
              className="absolute text-6xl"
              style={{
                left: `${15 + index * 17}%`,
                top: '10%',
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: char.delay,
                ease: "easeInOut"
              }}
            >
              <div
                className="relative"
                style={{
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                }}
              >
                {char.emoji}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: char.delay }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: char.color }} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10 mt-32"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <div className="text-8xl font-bold text-white" style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.2)' }}>
              SpeakUp! 🎤
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-6"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Your Amazing Speech Adventure Starts Here! 🚀
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl text-white mb-12 max-w-2xl mx-auto"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}
          >
            Practice speaking, play fun games, and become a speech superstar! 🌟
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/role-selector')}
              className="px-12 py-6 bg-gradient-to-r from-green-400 to-blue-500 text-white text-2xl font-bold rounded-full shadow-2xl flex items-center gap-3"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
            >
              <Smile className="w-8 h-8" />
              Start Learning!
              <ArrowRight className="w-8 h-8" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-12 py-6 bg-white text-purple-600 text-2xl font-bold rounded-full shadow-2xl"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
            >
              Sign In
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative bg-white py-24">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            What Makes SpeakUp Awesome? ✨
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                className="relative"
              >
                <div
                  className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-xl cursor-pointer"
                  style={{
                    border: `4px solid ${feature.color}`,
                    boxShadow: `0 10px 30px ${feature.color}40`
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4 p-4 rounded-2xl"
                    style={{ backgroundColor: feature.color + '20' }}
                  >
                    <div style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: feature.color }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="relative py-24 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl font-bold text-center mb-16 text-white"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Who Can Join? 👨‍👩‍👧‍👦
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '👶', title: 'Kids', desc: 'Learn and play!', color: '#FF6B9D' },
              { emoji: '👨‍👩‍👧', title: 'Parents', desc: 'Track progress!', color: '#FFD700' },
              { emoji: '👩‍⚕️', title: 'Therapists', desc: 'Guide learning!', color: '#00CED1' }
            ].map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                className="bg-white rounded-3xl p-12 text-center shadow-2xl cursor-pointer"
              >
                <div className="text-8xl mb-6">{role.emoji}</div>
                <h3 className="text-3xl font-bold mb-3" style={{ color: role.color }}>
                  {role.title}
                </h3>
                <p className="text-xl text-gray-600">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative py-24 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="text-9xl">🎉</div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl font-bold text-white mb-6"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Ready to Become a Speech Star? 🌟
          </motion.h2>

          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/role-selector')}
            animate={{
              boxShadow: [
                '0 10px 30px rgba(0,0,0,0.3)',
                '0 15px 40px rgba(0,0,0,0.4)',
                '0 10px 30px rgba(0,0,0,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-16 py-8 bg-white text-purple-600 text-3xl font-bold rounded-full shadow-2xl"
          >
            Join SpeakUp Today! 🚀
          </motion.button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');
        .font-comic {
          font-family: 'Comic Neue', 'Comic Sans MS', cursive;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;