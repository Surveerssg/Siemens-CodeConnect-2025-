import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Mic,
  Trophy,
  Target,
  Heart,
  Star,
  Zap,
  Award,
  TrendingUp,
  Users,
  BarChart3,
  Smile,
  Sparkles,
  Volume2,
  Gamepad2,
  Baby,
  PartyPopper
} from 'lucide-react';

const LandingPage = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(smoothProgress, [0, 1], [0, -300]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, -200]);
  const y3 = useTransform(smoothProgress, [0, 1], [0, -100]);
  const opacity1 = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.5], [1, 0.8]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: Mic,
      title: "AI Speech Practice",
      description: "Real-time pronunciation feedback powered by advanced AI",
      color: "from-[#f79d65] to-[#f35252]"
    },
    {
      icon: Gamepad2,
      title: "2 Fun Games",
      description: "Word Match and Karate Combat adventures",
      color: "from-[#60b5ff] to-[#5ef2d5]"
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Earn XP, unlock badges, and maintain streaks",
      color: "from-[#ffe588] to-[#f79d65]"
    },
    {
      icon: Sparkles,
      title: "Animated Avatars",
      description: "Characters that react to your child's performance",
      color: "from-[#5ef2d5] to-[#60b5ff]"
    }
  ];

  const games = [
    {
      emoji: "🎯",
      name: "Word Match",
      description: "Match words with colorful pictures",
      color: "bg-gradient-to-br from-[#f79d65] to-[#f35252]"
    },
    {
      emoji: "🥋",
      name: "Karate Combat",
      description: "Master words through martial arts challenges",
      color: "bg-gradient-to-br from-[#5ef2d5] to-[#60b5ff]"
    }
  ];

  const userTypes = [
    {
      icon: Baby,
      title: "For Children",
      features: [
        "Interactive speech practice",
        "2 engaging games",
        "Earn badges & rewards",
        "Track your progress"
      ],
      color: "from-[#f79d65] to-[#f35252]"
    },
    {
      icon: Heart,
      title: "For Parents",
      features: [
        "Monitor progress real-time",
        "Set practice goals",
        "Detailed analytics",
        "Track milestones"
      ],
      color: "from-[#60b5ff] to-[#5ef2d5]"
    },
    {
      icon: Users,
      title: "For Therapists",
      features: [
        "Manage multiple patients",
        "Advanced analytics",
        "Session documentation",
        "AI recommendations"
      ],
      color: "from-[#ffe588] to-[#f79d65]"
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Children", icon: Smile },
    { number: "95%", label: "Success Rate", icon: TrendingUp },
    { number: "50K+", label: "Sessions", icon: Award },
    { number: "4.9", label: "Rating", icon: Star }
  ];

  return (
    <div ref={containerRef} className="relative bg-gradient-to-b from-orange-50 via-green-50 to-orange-100 overflow-hidden">

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-32 bg-[#ffe588] rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 w-48 h-48 bg-[#f79d65] rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-1/4 w-40 h-40 bg-[#5ef2d5] rounded-full opacity-20 blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-1/3 w-36 h-36 bg-[#60b5ff] rounded-full opacity-20 blur-xl"
        />
      </div>

      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center px-6 py-20"
        style={{ scale, opacity: opacity1 }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] rounded-full blur-2xl opacity-30"
              />
              <div className="relative bg-white rounded-full p-8 shadow-2xl">
                <Mic className="w-20 h-20 text-[#f79d65]" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl md:text-8xl font-black mb-6 tracking-tight"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            <span className="bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] bg-clip-text text-transparent">
              SpeakUp
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-8"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Make Speech Therapy Fun & Magical! ✨
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
          >
            An AI-powered speech therapy platform designed for children, parents, and therapists
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/role-selector'}
              className="px-12 py-5 bg-gradient-to-r from-[#f79d65] to-[#f35252] text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started 🚀</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#f35252] to-[#f79d65]"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/login'}
              className="px-12 py-5 bg-white text-[#f79d65] text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all border-4 border-[#ffe588]"
            >
              Sign In 👤
            </motion.button>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-6xl"
            style={{ x: mousePosition.x, y: mousePosition.y }}
          >
            🎨
          </motion.div>
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-40 right-20 text-6xl"
            style={{ x: -mousePosition.x, y: -mousePosition.y }}
          >
            🌟
          </motion.div>
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 15, 0]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-40 left-20 text-6xl"
            style={{ x: mousePosition.x * 0.5, y: mousePosition.y * 0.5 }}
          >
            🥋
          </motion.div>
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-20 right-32 text-6xl"
            style={{ x: -mousePosition.x * 0.5, y: -mousePosition.y * 0.5 }}
          >
            🏆
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        style={{ y: y3 }}
        className="relative py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-white rounded-3xl p-8 shadow-xl text-center relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#ffe588] to-[#f79d65] opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                />
                <div className="relative z-10">
                  <stat.icon className="w-12 h-12 mx-auto mb-4 text-[#f79d65]" />
                  <div className="text-5xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        style={{ y: y2 }}
        className="relative py-32 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl font-black text-center mb-20 bg-gradient-to-r from-[#f79d65] to-[#5ef2d5] bg-clip-text text-transparent"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Amazing Features! 🎉
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 rounded-3xl blur-xl transition-all duration-300`} />
                <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black mb-4 text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Games Section */}
      <motion.section
        style={{ y: y1 }}
        className="relative py-32 px-6 bg-gradient-to-br from-[#ffe588] via-[#5ef2d5] to-[#f79d65]"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl font-black text-center mb-8 text-gray-800"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            2 Super Fun Games! 🎮
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl text-center text-gray-700 mb-20 max-w-3xl mx-auto"
          >
            Learn while playing exciting adventures!
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="relative group cursor-pointer"
              >
                <div className={`${game.color} rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-6 text-center"
                  >
                    {game.emoji}
                  </motion.div>
                  <h3 className="text-3xl font-black text-white text-center mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {game.name}
                  </h3>
                  <p className="text-white text-lg text-center font-semibold">
                    {game.description}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-8 bg-white text-gray-800 px-8 py-4 rounded-full text-center font-black text-lg cursor-pointer shadow-lg"
                  >
                    Play Now! →
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* User Types Section */}
      <motion.section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl font-black text-center mb-20 bg-gradient-to-r from-[#5ef2d5] to-[#f79d65] bg-clip-text text-transparent"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Built For Everyone! 👨‍👩‍👧‍👦
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -15 }}
                className="relative group"
              >
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-20 h-20 bg-gradient-to-br ${type.color} rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto`}
                    >
                      <type.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-center mb-8 text-gray-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      {type.title}
                    </h3>
                    <ul className="space-y-4">
                      {type.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex items-start gap-3"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                          >
                            <Star className="w-6 h-6 text-[#ffe588] flex-shrink-0" fill="currentColor" />
                          </motion.div>
                          <span className="text-gray-700 text-lg font-semibold">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="relative py-32 px-6 bg-gradient-to-r from-[#f79d65] via-[#5ef2d5] to-[#ffe588] overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-white rounded-full opacity-10"
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 1 }}
            className="mb-8"
          >
            <PartyPopper className="w-24 h-24 text-white mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl font-black text-white mb-8"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            Ready to Start the Adventure?
          </motion.h2>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl text-white mb-12 font-semibold"
          >
            Join thousands of happy families today! 🌈
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 3 }}
              whileTap={{ scale: 0.9 }}
              className="px-16 py-6 bg-white text-[#f79d65] text-2xl font-black rounded-full shadow-2xl hover:shadow-3xl transition-all"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              Get Started Free! 🚀
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative py-12 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <Mic className="w-12 h-12 text-[#f79d65] mx-auto" />
          </motion.div>
          <h3 className="text-3xl font-black text-white mb-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            SpeakUp
          </h3>
          <p className="text-gray-400 text-lg mb-8">
            Making speech therapy magical for every child ✨
          </p>
          <div className="flex justify-center gap-6 flex-wrap text-gray-400">
            <a href="#" className="hover:text-[#f79d65] transition-colors font-semibold">About</a>
            <a href="#" className="hover:text-[#f79d65] transition-colors font-semibold">Features</a>
            <a href="#" className="hover:text-[#f79d65] transition-colors font-semibold">Pricing</a>
            <a href="#" className="hover:text-[#f79d65] transition-colors font-semibold">Contact</a>
            <a href="#" className="hover:text-[#f79d65] transition-colors font-semibold">Privacy</a>
          </div>
          <p className="text-gray-500 mt-8">
            © 2025 SpeakUp. Made with ❤️ for children everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;