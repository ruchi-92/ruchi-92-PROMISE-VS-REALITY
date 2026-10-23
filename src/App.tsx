import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { AppModals } from './components/AppModals.tsx';
import { SignInScreen } from './screens/SignInScreen.tsx';
import { DashboardScreen } from './screens/DashboardScreen.tsx';
import { VerifyBillScreen } from './screens/VerifyBillScreen.tsx';
import { VerificationResultsScreen } from './screens/VerificationResultsScreen.tsx';

function AppContent() {
  const { currentScreen, transitionType, navigate, toastMessage } = useApp();

  const getVariants = () => {
    if (transitionType === 'push') {
      return {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
        transition: { duration: 0.25, ease: 'easeOut' as const },
      };
    }
    if (transitionType === 'push_back') {
      return {
        initial: { opacity: 0, x: -40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 40 },
        transition: { duration: 0.25, ease: 'easeOut' as const },
      };
    }
    return {
      initial: { opacity: 1, x: 0 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 1, x: 0 },
      transition: { duration: 0 },
    };
  };

  const variants = getVariants();

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] relative">
      {/* Dynamic Toast Feedback Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-2.5 rounded-lg shadow-xl text-[13px] font-medium flex items-center gap-2 border border-[#c6c6cd]/40 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-[#4edea3]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Router with transition animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={variants.transition}
          className="w-full min-h-screen"
        >
          {currentScreen === 'login' && (
            <SignInScreen onNavigate={navigate} />
          )}
          {currentScreen === 'overview' && (
            <DashboardScreen onNavigate={navigate} />
          )}
          {currentScreen === 'verify-a-bill' && (
            <VerifyBillScreen onNavigate={navigate} />
          )}
          {currentScreen === 'verification-results' && (
            <VerificationResultsScreen onNavigate={navigate} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Interactive Global Modals, ⌘K search, AI Assistant, and Vaults */}
      <AppModals />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
