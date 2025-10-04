# 🎤 SpeakUp - AI-Powered Speech Practice Platform

An innovative React-based web application designed to help hearing-impaired children improve their speech through interactive games, real-time feedback, and comprehensive progress tracking.

## 🌟 Features

### 👶 **For Children**
- **Interactive Speech Practice** - Practice pronunciation with AI-powered feedback
- **3 Engaging Games**:
  - 🎯 **Word Match** - Match words with pictures
  - 🎈 **Balloon Pop** - Pop balloons by saying words correctly
  - 🏴‍☠️ **Treasure Hunt** - Find treasures by completing word challenges
- **Gamification** - Earn XP, badges, and maintain streaks
- **Animated Avatars** - Interactive characters that react to performance
- **Progress Tracking** - Visual charts showing improvement over time
- **Goal Setting** - Work towards achievable speech goals

### 👨‍👩‍👧‍👦 **For Parents**
- **Real-time Progress Monitoring** - Track your child's speech development
- **Goal Assignment** - Set and manage practice goals for your child
- **Detailed Analytics** - Comprehensive reports on speech improvement
- **Note-taking System** - Record observations and milestones
- **Performance Insights** - Understand your child's strengths and areas for improvement

### 👩‍⚕️ **For Therapists**
- **Professional Dashboard** - Manage multiple patients efficiently
- **Advanced Analytics** - Detailed speech analysis and progress reports
- **Patient Management** - Track assigned children and their progress
- **Session Notes** - Document therapy sessions and observations
- **AI Recommendations** - Get insights on therapy approaches

## 🎨 **UI/UX Highlights**
- **Child-Friendly Design** - Bright colors, Comic Sans font, and engaging animations
- **Floating Letter Animations** - Interactive elements throughout the app
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Accessibility Features** - Designed with hearing-impaired users in mind
- **Gamification Elements** - Badges, streaks, stars, and XP system

## 🛠️ **Technology Stack**

### Frontend
- **React 19** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Material-UI** - Beautiful, accessible components
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization and progress charts
- **Lucide React** - Beautiful, customizable icons

### Backend (Ready for Integration)
- **Firebase Authentication** - User management and security
- **Firestore** - Real-time database for progress tracking
- **Firebase Storage** - Audio file storage
- **Cloud Functions** - Serverless backend logic

### AI/ML (Planned Integration)
- **Whisper API** - Speech-to-text conversion
- **MFCC/DTW** - Speech scoring and analysis
- **Real-time Feedback** - Instant pronunciation assessment

## 🚀 **Getting Started**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Surveerssg/Siemens-CodeConnect-2025-.git
   cd Siemens-CodeConnect-2025-/speakup-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Firebase Setup (Optional)
To enable full functionality, configure Firebase:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Update `src/firebase.js` with your Firebase configuration
3. Enable Authentication, Firestore, and Storage in your Firebase console

## 📁 **Project Structure**

```
speakup-app/
├── src/
│   ├── pages/
│   │   ├── auth/           # Authentication pages
│   │   ├── child/          # Child-specific pages
│   │   ├── parent/         # Parent dashboard and tools
│   │   ├── therapist/      # Therapist professional tools
│   │   └── common/         # Shared pages (Profile, Settings)
│   ├── context/            # React Context providers
│   ├── components/         # Reusable UI components
│   ├── styles/            # Global CSS and animations
│   └── constants.js       # App constants and configuration
├── public/                # Static assets
└── package.json          # Dependencies and scripts
```

## 🎮 **How to Use**

1. **Choose Your Role** - Select Child, Parent, or Therapist
2. **Create Account** - Sign up with your details
3. **Start Practicing** - Children can begin with speech practice or games
4. **Track Progress** - Parents and therapists can monitor development
5. **Set Goals** - Establish achievable speech improvement targets

## 🎯 **Key Features in Detail**

### Speech Practice
- Interactive word pronunciation with visual feedback
- Real-time scoring and encouragement
- Progress tracking with detailed analytics
- Customizable difficulty levels

### Gamification
- **XP System** - Earn experience points for completed activities
- **Badges** - Unlock achievements for milestones
- **Streaks** - Maintain daily practice streaks
- **Leaderboards** - Friendly competition (optional)

### Analytics Dashboard
- **Progress Charts** - Visual representation of improvement
- **Performance Metrics** - Detailed speech analysis
- **Goal Tracking** - Monitor achievement of set objectives
- **Export Reports** - Generate progress reports for therapists

## 🔧 **Development**

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🌟 **Future Enhancements**

- **Voice Recognition** - Real-time speech analysis
- **Multi-language Support** - Support for different languages
- **Advanced AI** - Machine learning for personalized feedback
- **Mobile App** - Native mobile applications
- **Offline Mode** - Practice without internet connection
- **Social Features** - Connect with other families and therapists

## 📄 **License**

This project is part of the Siemens CodeConnect 2025 competition.

## 👥 **Team**

Developed with ❤️ for hearing-impaired children and their families.
