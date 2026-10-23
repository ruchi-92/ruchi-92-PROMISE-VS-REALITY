import React, { useState } from 'react';
import { Screen, TransitionType } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';

interface SignInScreenProps {
  onNavigate: (screen: Screen, transition?: TransitionType) => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onNavigate }) => {
  const { setActiveModal, showToast } = useApp();
  const [email, setEmail] = useState('audit@consumerpromise.io');
  const [password, setPassword] = useState('masterkey2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [forgotKeyOpen, setForgotKeyOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regKey, setRegKey] = useState('');

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateEmail(email)) {
      setFormError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (!password || password.length < 6) {
      setFormError('Master vault key must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccess(true);
      showToast('Vault credentials authenticated via Hardware Enclave.');
      setTimeout(() => {
        onNavigate('overview', 'push');
      }, 350);
    }, 600);
  };

  const handlePasskeyAuth = () => {
    setIsLoading(true);
    setFormError(null);
    showToast('Platform authenticator (FIDO2 / TouchID / Windows Hello) verified.');
    setTimeout(() => {
      setIsLoading(false);
      onNavigate('overview', 'push');
    }, 550);
  };

  const handleSocialAuth = (provider: 'Apple' | 'Google') => {
    setIsLoading(true);
    showToast(`Authenticating with ${provider}...`);
    setTimeout(() => {
      setIsLoading(false);
      onNavigate('overview', 'push');
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      alert('Please enter a valid recovery email.');
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setForgotKeyOpen(false);
      setForgotSent(false);
      showToast(`Key recovery instructions sent to ${forgotEmail}`);
    }, 1500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(regEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    setEmail(regEmail);
    setPassword(regKey || 'masterkey2025!');
    setRegisterOpen(false);
    showToast('Account created. Sign in to access your audit vault.');
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col justify-between selection:bg-[#d3e4fe] selection:text-black">
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate('overview', 'push')}
              title="Open Dashboard"
            >
              <div className="w-7 h-7 bg-black flex items-center justify-center rounded">
                <span className="material-symbols-outlined text-white text-[16px]">verified</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[16px] font-semibold text-[#0b1c30] tracking-tight uppercase">
                  Promise
                </span>
                <span className="text-[11px] font-semibold text-[#76777d] uppercase">vs</span>
                <span className="text-[16px] font-semibold text-[#0051d5] tracking-tight uppercase">
                  Reality
                </span>
              </div>
            </div>

            <div className="h-4 w-px bg-[#c6c6cd] hidden sm:block" />

            <div
              onClick={() => setActiveModal('methodology')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors rounded-full cursor-pointer"
              title="Click to view Audit Trust Engine methodology"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
              <span className="text-[11px] font-semibold text-[#45464d] tracking-wider uppercase">
                Audit Trust Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div
              onClick={() => setActiveModal('account')}
              className="hidden md:flex items-center gap-1.5 text-[#45464d] hover:text-[#0b1c30] cursor-pointer transition-colors"
              title="256-Bit E2E Encrypted Vault"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0051d5]">lock</span>
              <span className="text-[13px] font-medium">256-Bit E2E Encrypted</span>
            </div>

            <nav className="flex items-center gap-4">
              <a
                className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
                href="#methodology"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal('methodology');
                }}
              >
                Methodology
              </a>
              <a
                className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
                href="#help"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveModal('help');
                }}
              >
                Help Center
              </a>
            </nav>

            <div
              onClick={() => onNavigate('overview', 'push')}
              className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white cursor-pointer hover:bg-[#131b2e] transition-colors"
              title="Quick Access to Auditor Vault"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-20 md:pt-24 pb-12 flex-1 flex flex-col justify-center bg-[#f8f9ff]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: VALUE & AUDIT VERIFICATION SHOWCASE */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pr-4">
              {/* Overline Tag & Status Pill */}
              <div className="flex items-center gap-2">
                <span
                  onClick={() => setActiveModal('methodology')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0051d5] text-[11px] font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-pulse" />
                  ACTIVE MONITORING ENGINE v4.2
                </span>
                <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  Zero-Knowledge Protocol
                </span>
              </div>

              {/* Headline & Subheading */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl lg:text-[42px] leading-tight text-[#0b1c30] tracking-tight font-bold">
                  Know exactly what you were promised.
                </h1>
                <p className="text-[15px] md:text-[16px] text-[#45464d] max-w-xl leading-relaxed">
                  Automated contract verification, subscription dispute preparation, and billing discrepancy detection in one bank-grade secure vault.
                </p>
              </div>

              {/* Interactive Live Audit Preview Card */}
              <div className="relative bg-white rounded-xl shadow-md p-6 space-y-4 overflow-hidden border border-[#c6c6cd]/30 hover:border-[#0051d5]/40 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0051d5]/5 rounded-full blur-2xl pointer-events-none" />

                {/* Card Header & Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                      <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                    </div>
                    <div>
                      <div className="text-[16px] font-semibold text-[#0b1c30]">Apex Mobile Care</div>
                      <div className="text-[12px] text-[#45464d]">Auto-pay discount missing ($10/line)</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6ffbbe]/30 text-[#009668] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] text-[#009668]">verified</span>
                    Audit Confirmed
                  </span>
                </div>

                {/* Metric Comparison Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Promised Side */}
                  <div className="p-3 rounded-lg bg-[#eff4ff] space-y-1">
                    <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider block">
                      Promised Tier
                    </span>
                    <div className="text-[26px] text-[#0b1c30] font-bold tracking-tight">
                      $145.00<span className="text-[12px] text-[#45464d] font-normal">/mo</span>
                    </div>
                    <span className="text-[12px] text-[#76777d] block">Contract executed Aug 12</span>
                  </div>

                  {/* Billed Reality Side */}
                  <div className="p-3 rounded-lg bg-[#dce9ff]/70 space-y-1">
                    <span className="text-[11px] font-semibold text-[#ba1a1a] uppercase tracking-wider block">
                      Billed Statement
                    </span>
                    <div className="text-[26px] text-[#ba1a1a] font-bold tracking-tight">
                      $165.00<span className="text-[12px] text-[#45464d] font-normal">/mo</span>
                    </div>
                    <span className="text-[12px] text-[#45464d] block">Statement closed Sep 28</span>
                  </div>
                </div>

                {/* Highlighted Net Variance Bar with required auto-claim drafted span */}
                <div className="p-3 rounded-lg bg-[#ffdad6]/70 flex items-center justify-between text-[#93000a]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span className="text-[14px] font-bold">+$20.00 Unapplied Discount</span>
                  </div>
                  <span
                    className="text-[13px] font-semibold underline cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onNavigate('verification-results', 'push')}
                    title="Inspect verification results"
                  >
                    Auto-claim drafted →
                  </span>
                </div>

                {/* Micro Visual Timeline Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-[#76777d]">
                    <span>Agreement signed</span>
                    <span>1st Cycle Overcharge</span>
                    <span className="text-[#0051d5] font-semibold">Rebate Requested</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#e5eeff] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#0051d5] w-2/3 rounded-l-full" />
                    <div className="h-full bg-[#ffdad6] w-1/3 rounded-r-full" />
                  </div>
                </div>
              </div>

              {/* Trust Badges & Metrics */}
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setActiveModal('account')}
                    className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-[#c6c6cd]/20 cursor-pointer hover:bg-[#dce9ff]/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#0051d5] text-[20px]">
                      enhanced_encryption
                    </span>
                    <span className="text-[13px] text-[#0b1c30] font-semibold">256-Bit E2E</span>
                    <span className="text-[11px] text-[#45464d]">Bank-grade vaulting</span>
                  </div>
                  <div
                    onClick={() => setActiveModal('methodology')}
                    className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-[#c6c6cd]/20 cursor-pointer hover:bg-[#dce9ff]/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#0051d5] text-[20px]">
                      visibility_off
                    </span>
                    <span className="text-[13px] text-[#0b1c30] font-semibold">Read-Only View</span>
                    <span className="text-[11px] text-[#45464d]">No transaction rights</span>
                  </div>
                  <div
                    onClick={() => setActiveModal('account')}
                    className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-[#c6c6cd]/20 cursor-pointer hover:bg-[#dce9ff]/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#0051d5] text-[20px]">
                      verified_user
                    </span>
                    <span className="text-[13px] text-[#0b1c30] font-semibold">SOC 2 Type II</span>
                    <span className="text-[11px] text-[#45464d]">Audited compliance</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white shadow-xs border border-[#c6c6cd]/30">
                  <div className="w-2 h-2 rounded-full bg-[#0051d5] shrink-0" />
                  <span className="text-[12px] md:text-[13px] text-[#0b1c30] font-medium">
                    Over $1.4M in billing discrepancies verified for everyday consumers this quarter.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AUTHENTICATION CONTAINER */}
            <div className="lg:col-span-6 w-full max-w-md mx-auto">
              <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 space-y-6 border border-[#c6c6cd]/40 relative">
                
                {/* Form Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[22px] md:text-[24px] text-[#0b1c30] font-semibold tracking-tight">
                      Sign in to your vault
                    </h2>
                    <span className="material-symbols-outlined text-[#0051d5] text-[20px]">
                      lock_clock
                    </span>
                  </div>
                  <p className="text-[13px] text-[#45464d]">
                    Enter your credentials to view active audits and renewal alerts.
                  </p>
                </div>

                {/* Quick Sign-in Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="w-full h-10 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors flex items-center justify-center gap-2 text-[#0b1c30] text-[13px] font-medium shadow-xs border border-[#c6c6cd]/30 cursor-pointer"
                    type="button"
                    onClick={() => handleSocialAuth('Apple')}
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.64-.78 1.08-1.86.96-2.95-1 .04-2.13.67-2.79 1.44-.58.67-1.09 1.76-.95 2.82 1.11.09 2.15-.55 2.78-1.31Z" />
                    </svg>
                    <span>Apple</span>
                  </button>

                  <button
                    className="w-full h-10 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors flex items-center justify-center gap-2 text-[#0b1c30] text-[13px] font-medium shadow-xs border border-[#c6c6cd]/30 cursor-pointer"
                    type="button"
                    onClick={() => handleSocialAuth('Google')}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full h-px bg-[#e5eeff]" />
                  <span className="absolute px-3 bg-white text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                    or sign in with email
                  </span>
                </div>

                {/* Error Banner */}
                {formError && (
                  <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#93000a] text-[12px] font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Form Fields with required submitAuthBtn */}
                <form className="space-y-4" id="vault-login-form" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] text-[#0b1c30] font-medium" htmlFor="email">
                      Institutional or Personal Email
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#76777d] text-[18px] pointer-events-none">
                        mail
                      </span>
                      <input
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-[#c6c6cd] text-[#0b1c30] text-[14px] placeholder:text-[#c6c6cd] outline-none shadow-xs transition-all focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/30"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="name@domain.com"
                        required
                        type="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[13px] text-[#0b1c30] font-medium" htmlFor="password">
                        Vault Master Key / Password
                      </label>
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-[#0051d5] hover:underline cursor-pointer"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotKeyOpen(true);
                        }}
                      >
                        Forgot key?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#76777d] text-[18px] pointer-events-none">
                        key
                      </span>
                      <input
                        className="w-full h-10 pl-9 pr-10 rounded-lg bg-white border border-[#c6c6cd] text-[#0b1c30] text-[14px] placeholder:text-[#c6c6cd] outline-none shadow-xs transition-all focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/30"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="••••••••••••"
                        required
                        type={showPassword ? 'text' : 'password'}
                      />
                      <button
                        aria-label="Toggle password visibility"
                        className="absolute right-3 text-[#76777d] hover:text-[#0b1c30] transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                        id="togglePasswordBtn"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]" id="passwordToggleIcon">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Trust Indicator */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 rounded text-[#0051d5] focus:ring-0 focus:outline-none accent-[#0051d5] cursor-pointer"
                        id="rememberDevice"
                        type="checkbox"
                      />
                      <span className="text-[13px] text-[#45464d]">Remember device (30 days)</span>
                    </label>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#eff4ff] text-[#45464d] text-[11px] font-medium border border-[#c6c6cd]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                      <span>Trust: High</span>
                    </div>
                  </div>

                  {/* Primary Action Button - EXACT xpath: //button[@id='submitAuthBtn'] */}
                  <button
                    className={`w-full h-11 rounded-lg text-white text-[13px] font-semibold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-md cursor-pointer ${
                      authSuccess
                        ? 'bg-[#4edea3] text-[#002113]'
                        : 'bg-black hover:bg-[#131b2e]'
                    }`}
                    id="submitAuthBtn"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block animate-spin material-symbols-outlined text-[18px]">
                          progress_activity
                        </span>
                        <span>Authenticating Vault...</span>
                      </>
                    ) : authSuccess ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Credentials Verified</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Alternative Authentication: Passkey / Hardware Key - EXACT xpath: //button[contains(., 'Sign in with Passkey')] */}
                <div className="pt-1">
                  <button
                    className="w-full py-2.5 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] flex items-center justify-center gap-2 text-[13px] font-medium transition-colors border border-[#c6c6cd]/30 cursor-pointer"
                    onClick={handlePasskeyAuth}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[#0051d5] text-[20px]">
                      fingerprint
                    </span>
                    <span>Sign in with Passkey or FIDO2 Key</span>
                  </button>
                </div>

                {/* Bottom Footer Navigation & Security Snippet */}
                <div className="pt-1 space-y-2 text-center">
                  <p className="text-[13px] text-[#45464d]">
                    New to PROMISE vs REALITY?{' '}
                    <button
                      className="text-[#0051d5] font-semibold hover:underline inline-flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
                      onClick={() => setRegisterOpen(true)}
                    >
                      Create a free audit account
                      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </button>
                  </p>
                  <div
                    onClick={() => setActiveModal('account')}
                    className="flex items-center justify-center gap-1.5 text-[#76777d] text-[11px] font-medium cursor-pointer hover:text-[#0b1c30]"
                    title="Hardware Enclave Security Protocols"
                  >
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    <span>Protected by hardware enclave encryption standards</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Forgot Key Modal */}
      {forgotKeyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-[#c6c6cd] p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Recover Vault Master Key</h3>
              <button onClick={() => setForgotKeyOpen(false)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#45464d]">
              Enter the email address registered with your vault. We will send a hardware cryptographic token link to restore access.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                className="w-full h-10 px-3 rounded-lg border border-[#c6c6cd] text-[13px] outline-none focus:border-[#0051d5]"
                placeholder="audit@consumerpromise.io"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                type="email"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotKeyOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="px-4 py-1.5 rounded-lg bg-[#131b2e] hover:bg-black text-white text-[13px] font-semibold"
                >
                  {forgotSent ? 'Dispatching Token...' : 'Send Recovery Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Free Audit Account Modal */}
      {registerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-[#c6c6cd] p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Create Free Audit Vault</h3>
              <button onClick={() => setRegisterOpen(false)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#45464d]">
              Set up your zero-knowledge commitment audit vault. All verification contracts run client-side with hardware isolation.
            </p>
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-[#0b1c30] mb-1">Email Address</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-[#c6c6cd] text-[13px] outline-none focus:border-[#0051d5]"
                  placeholder="auditor@organization.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#0b1c30] mb-1">Create Vault Master Key</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-[#c6c6cd] text-[13px] outline-none focus:border-[#0051d5]"
                  placeholder="Minimum 6 characters"
                  value={regKey}
                  onChange={(e) => setRegKey(e.target.value)}
                  required
                  type="password"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#131b2e] hover:bg-black text-white text-[13px] font-semibold"
                >
                  Initialize Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-white shadow-[0_-1px_6px_rgba(0,0,0,0.02)] py-6 border-t border-[#c6c6cd]/20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              onClick={() => setActiveModal('account')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors rounded border border-[#c6c6cd]/30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-[#0051d5]">verified_user</span>
              <span className="text-[11px] font-semibold text-[#0b1c30]">SOC 2 Type II Certified</span>
            </div>
            <span className="text-[13px] text-[#45464d]">
              © 2025 Promise vs Reality Inc. Institutional Verification Platform.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                setActiveModal('account');
              }}
            >
              Privacy Policy
            </a>
            <a
              className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                setActiveModal('methodology');
              }}
            >
              Terms of Service
            </a>
            <a
              className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
              href="#security"
              onClick={(e) => {
                e.preventDefault();
                setActiveModal('account');
              }}
            >
              Security Protocols
            </a>
            <a
              className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                setActiveModal('help');
              }}
            >
              Institutional Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
