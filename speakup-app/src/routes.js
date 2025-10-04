import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLES } from './constants';

import Login from './pages/auth/Login';
import RoleSelector from './pages/auth/RoleSelector';
import SignupChild from './pages/auth/SignupChild';
import SignupParent from './pages/auth/SignupParent';
import SignupTherapist from './pages/auth/SignupTherapist';

import ChildDashboard from './pages/child/ChildDashboard';
import Practice from './pages/child/Practice';
import Progress from './pages/child/Progress';
import Goals from './pages/child/Goals';
import GamesMenu from './pages/child/games/GamesMenu';
import WordMatch from './pages/child/games/WordMatch';
import BalloonPop from './pages/child/games/BalloonPop';
import TreasureHunt from './pages/child/games/TreasureHunt';

import ParentDashboard from './pages/parent/ParentDashboard';
import ChildProgress from './pages/parent/ChildProgress';
import AssignGoals from './pages/parent/AssignGoals';
import Notes from './pages/parent/Notes';

import TherapistDashboard from './pages/therapist/TherapistDashboard';
import AssignedChildren from './pages/therapist/AssignedChildren';
import ChildAnalytics from './pages/therapist/ChildAnalytics';
import TherapistNotes from './pages/therapist/Notes';

import Profile from './pages/common/Profile';
import Settings from './pages/common/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/role-selector" element={<RoleSelector />} />
      <Route path="/signup/child" element={<SignupChild />} />
      <Route path="/signup/parent" element={<SignupParent />} />
      <Route path="/signup/therapist" element={<SignupTherapist />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ChildDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/practice" element={
        <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
          <Practice />
        </ProtectedRoute>
      } />
      
      <Route path="/progress" element={
        <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
          <Progress />
        </ProtectedRoute>
      } />
      
      <Route path="/goals" element={
        <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
          <Goals />
        </ProtectedRoute>
      } />
      
      <Route path="/games" element={
        <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
          <GamesMenu />
        </ProtectedRoute>
      } />
      
      <Route path="/games/word-match" element={
        <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
          <WordMatch />
        </ProtectedRoute>
      } />
      
      <Route path="/games/balloon-pop" element={
        <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
          <BalloonPop />
        </ProtectedRoute>
      } />
      
      <Route path="/games/treasure-hunt" element={
        <ProtectedRoute allowedRoles={[ROLES.CHILD]}>
          <TreasureHunt />
        </ProtectedRoute>
      } />
      
      <Route path="/parent" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
          <ParentDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/parent/progress" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
          <ChildProgress />
        </ProtectedRoute>
      } />
      
      <Route path="/parent/goals" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
          <AssignGoals />
        </ProtectedRoute>
      } />
      
      <Route path="/parent/notes" element={
        <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
          <Notes />
        </ProtectedRoute>
      } />
      
      <Route path="/therapist" element={
        <ProtectedRoute allowedRoles={[ROLES.THERAPIST]}>
          <TherapistDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/therapist/children" element={
        <ProtectedRoute allowedRoles={[ROLES.THERAPIST]}>
          <AssignedChildren />
        </ProtectedRoute>
      } />
      
      <Route path="/therapist/analytics" element={
        <ProtectedRoute allowedRoles={[ROLES.THERAPIST]}>
          <ChildAnalytics />
        </ProtectedRoute>
      } />
      
      <Route path="/therapist/notes" element={
        <ProtectedRoute allowedRoles={[ROLES.THERAPIST]}>
          <TherapistNotes />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
