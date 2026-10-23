import React from 'react';
import { Screen, TransitionType } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen, transition?: TransitionType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate }) => {
  const { setActiveModal, unreadCount } = useApp();

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-[#c6c6cd]/30 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* App Logo & Header */}
        <div
          className="h-16 px-4 flex items-center gap-2 border-b border-[#c6c6cd]/20 cursor-pointer hover:bg-[#eff4ff]/40 transition-colors"
          onClick={() => onNavigate('overview', 'none')}
          title="Return to Overview"
        >
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[18px]">verified</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[15px] text-[#0b1c30] leading-none tracking-tight truncate">
              PROMISE vs REALITY
            </span>
            <span className="text-[11px] font-medium text-[#45464d] leading-tight truncate mt-1">
              Commitment Verification
            </span>
          </div>
        </div>

        {/* Audit Platform Nav Section */}
        <div className="px-4 pt-6 pb-2">
          <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider px-2">
            Audit Platform
          </span>
        </div>

        <nav className="px-2 flex flex-col gap-1">
          <a
            href="#"
            data-path="overview"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('overview', 'none');
            }}
            aria-current={currentScreen === 'overview' ? 'page' : undefined}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[14px] ${
              currentScreen === 'overview'
                ? 'bg-[#eff4ff] text-[#0051d5] font-semibold shadow-xs'
                : 'text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="font-medium">Overview</span>
          </a>

          <a
            href="#"
            data-path="verify-a-bill"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('verify-a-bill', 'none');
            }}
            aria-current={currentScreen === 'verify-a-bill' ? 'page' : undefined}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[14px] ${
              currentScreen === 'verify-a-bill'
                ? 'bg-[#eff4ff] text-[#0051d5] font-semibold shadow-xs'
                : 'text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
            <span className="font-medium">Verify a Bill</span>
          </a>

          <a
            href="#"
            data-path="my-documents"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('documents');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors text-[14px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">folder_open</span>
            <span className="font-medium">My Documents</span>
          </a>

          <a
            href="#"
            data-path="subscriptions"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('subscriptions');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors text-[14px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            <span className="font-medium">Subscriptions</span>
          </a>

          <a
            href="#"
            data-path="plan-optimizer"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('plan-optimizer');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors text-[14px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span className="font-medium">Plan Optimizer</span>
          </a>

          <a
            href="#"
            data-path="ai-assistant"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('ai-assistant');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors text-[14px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span className="font-medium">AI Assistant</span>
          </a>
        </nav>

        {/* Divider */}
        <div className="my-3 mx-4 border-t border-[#c6c6cd]/30" />

        {/* System & Controls */}
        <div className="px-4 pb-2">
          <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider px-2">
            System & Controls
          </span>
        </div>

        <nav className="px-2 flex flex-col gap-1">
          <a
            href="#"
            data-path="activity-and-alerts"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('activity');
            }}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors text-[14px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              <span className="font-medium">Activity & Alerts</span>
            </div>
            {unreadCount > 0 && (
              <span className="text-[11px] font-semibold bg-[#316bf3] text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </a>

          <a
            href="#"
            data-path="account-and-privacy"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('account');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors text-[14px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">security</span>
            <span className="font-medium">Account & Privacy</span>
          </a>

          <a
            href="#"
            data-path="settings"
            onClick={(e) => {
              e.preventDefault();
              setActiveModal('settings');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#45464d] hover:bg-[#e5eeff] hover:text-[#0b1c30] transition-colors text-[14px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="font-medium">Settings</span>
          </a>
        </nav>
      </div>

      {/* Profile & Switcher footer */}
      <div className="p-3 border-t border-[#c6c6cd]/30 bg-[#eff4ff]/40">
        <div className="flex items-center gap-2.5">
          <div
            onClick={() => setActiveModal('account')}
            className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-[#c6c6cd]/40 cursor-pointer"
            title="View Account Profile"
          >
            EA
          </div>
          <div
            onClick={() => setActiveModal('account')}
            className="flex flex-col min-w-0 flex-1 cursor-pointer"
          >
            <span className="text-[13px] text-[#0b1c30] font-semibold truncate leading-tight">
              Enterprise Auditor
            </span>
            <span className="text-[11px] text-[#45464d] truncate leading-tight">
              audit@consumerpromise.io
            </span>
          </div>
          <button
            onClick={() => onNavigate('login', 'push_back')}
            title="Lock Vault / Return to Sign In"
            className="p-1 hover:bg-[#dce9ff] rounded transition-colors text-[#45464d] hover:text-[#0b1c30] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
