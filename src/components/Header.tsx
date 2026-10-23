import React from 'react';
import { Screen, TransitionType } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen, transition?: TransitionType) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate }) => {
  const { setIsSearchOpen, setActiveModal, unreadCount, searchQuery, setSearchQuery } = useApp();

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-white/90 backdrop-blur-md border-b border-[#c6c6cd]/30 z-40 px-6 flex items-center justify-between">
      {/* Breadcrumbs matching prototype & exact navigation xpath */}
      <div className="flex items-center gap-2">
        <span
          className="text-[13px] text-[#45464d] hover:text-[#0b1c30] cursor-pointer transition-colors"
          onClick={() => onNavigate('overview', 'push_back')}
        >
          Dashboard
        </span>
        <span className="text-[11px] text-[#c6c6cd]">/</span>

        {currentScreen === 'overview' && (
          <span className="text-[13px] text-[#0b1c30] font-semibold">Overview</span>
        )}

        {currentScreen === 'verify-a-bill' && (
          <>
            <span
              className="text-[13px] text-[#45464d] hover:text-[#0b1c30] cursor-pointer transition-colors"
              onClick={() => onNavigate('overview', 'push_back')}
            >
              Overview
            </span>
            <span className="text-[11px] text-[#c6c6cd]">/</span>
            <span className="text-[13px] text-[#0b1c30] font-semibold">Verify a Bill</span>
          </>
        )}

        {currentScreen === 'verification-results' && (
          <>
            <span
              className="text-[13px] text-[#0051d5] hover:underline cursor-pointer font-medium transition-colors"
              onClick={() => onNavigate('overview', 'push_back')}
            >
              Overview
            </span>
            <span className="text-[11px] text-[#c6c6cd]">/</span>
            <span className="text-[13px] text-[#0b1c30] font-semibold">Verification Results</span>
          </>
        )}
      </div>

      {/* Right Toolbar */}
      <div className="flex items-center gap-4">
        {/* Search Input with ⌘K palette opener */}
        <div
          className="relative flex items-center cursor-pointer"
          onClick={() => setIsSearchOpen(true)}
        >
          <span className="material-symbols-outlined absolute left-3 text-[#45464d] text-[18px]">
            search
          </span>
          <input
            className="w-80 h-[38px] pl-9 pr-12 bg-white border border-[#c6c6cd] rounded-lg text-[13px] text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] transition-all cursor-pointer"
            placeholder="Search bills, contracts, or merchants..."
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          <kbd
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchOpen(true);
            }}
            className="absolute right-2.5 px-1.5 py-0.5 bg-[#eff4ff] border border-[#c6c6cd]/60 rounded text-[11px] text-[#45464d] font-semibold uppercase hover:bg-[#dce9ff]"
          >
            ⌘K
          </kbd>
        </div>

        {/* Environment Badge */}
        <span
          onClick={() => setActiveModal('methodology')}
          className="text-[11px] tracking-wide bg-[#dce9ff] hover:bg-[#cbdbf5] text-[#0b1c30] px-3 py-1 rounded-full border border-[#c6c6cd]/50 font-semibold select-none cursor-pointer transition-colors"
          title="Click to view Zero-Knowledge Environment Specs"
        >
          DEMO ENVIRONMENT
        </span>

        {/* Notifications */}
        <button
          onClick={() => setActiveModal('activity')}
          className="relative p-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors cursor-pointer"
          type="button"
          aria-label="Notifications"
          title="Open Activity & Alerts"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#316bf3] ring-2 ring-white" />
          )}
        </button>

        {/* Avatar */}
        <div
          onClick={() => setActiveModal('account')}
          className="flex items-center pl-1 cursor-pointer"
          title="Account Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center font-bold text-xs ring-1 ring-[#c6c6cd]/50 hover:ring-[#0051d5] transition-all">
            EA
          </div>
        </div>
      </div>
    </header>
  );
};
