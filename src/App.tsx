import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/Landing';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');

  // Handle routing logic
  useEffect(() => {
    if (loading) return;

    if (!user) {
      setCurrentPage('landing');
    } else if (!profile) {
      setCurrentPage('login');
    } else {
      if (currentPage === 'landing' || currentPage === 'login') {
        setCurrentPage('dashboard');
      }
    }
  }, [user, profile, loading, currentPage]);

  const renderPage = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-slate-400 font-medium text-sm animate-pulse tracking-widest uppercase">Initialising Hub...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNav={setCurrentPage} />;
      case 'login':
        return <LoginPage onComplete={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <LandingPage onNav={setCurrentPage} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
