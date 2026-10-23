import React, { useState } from 'react';
import { Screen, TransitionType } from '../types.ts';
import { Sidebar } from '../components/Sidebar.tsx';
import { Header } from '../components/Header.tsx';
import { useApp } from '../context/AppContext.tsx';

interface DashboardScreenProps {
  onNavigate: (screen: Screen, transition?: TransitionType) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { setActiveModal, loadAudit, showToast, documents } = useApp();
  const [dismissedItems, setDismissedItems] = useState<string[]>([]);
  const [resolvedItems, setResolvedItems] = useState<string[]>([]);
  const [activityFilter, setActivityFilter] = useState<'All' | 'Discrepancy' | 'Needs Review' | 'Match Verified'>('All');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [disputeModalRecord, setDisputeModalRecord] = useState<'cloudfiber' | 'apex' | null>(null);

  const handleDismiss = (id: string, name: string) => {
    setDismissedItems((prev) => [...prev, id]);
    showToast(`Marked ${name} as expected.`);
  };

  const handleResolve = (id: string, name: string) => {
    setResolvedItems((prev) => [...prev, id]);
    showToast(`Marked ${name} as resolved.`);
  };

  const activeReviewCount = Math.max(
    0,
    2 - (dismissedItems.includes('cloudfiber') ? 1 : 0) - (resolvedItems.includes('apex') ? 1 : 0)
  );

  const filteredRecentDocs = documents.filter((doc) => {
    if (activityFilter === 'All') return true;
    if (activityFilter === 'Discrepancy') return doc.status === 'Discrepancy';
    if (activityFilter === 'Needs Review') return doc.status === 'Needs Review';
    if (activityFilter === 'Match Verified') return doc.status === 'Match Verified' || doc.status === 'Terms Match' || doc.status === 'Rate Locked';
    return true;
  });

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen">
      {/* Sidebar with data-path="verify-a-bill" */}
      <Sidebar currentScreen="overview" onNavigate={onNavigate} />

      {/* Main app offset by sidebar */}
      <div className="pl-[260px]">
        {/* Header */}
        <Header currentScreen="overview" onNavigate={onNavigate} />

        <main className="relative pt-16 bg-[#f8f9ff] min-h-screen pb-16">
          <div className="max-w-[1400px] mx-auto p-6 md:p-8">
            <div className="flex flex-col w-full">
              
              {/* Subtle Environment & Global Notice Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#c6c6cd]/30">
                <div
                  onClick={() => setActiveModal('methodology')}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#c6c6cd]/40 cursor-pointer transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                  <span className="text-[11px] text-[#45464d] font-medium tracking-normal">
                    Showing demonstration data — no live financial accounts connected
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#45464d] text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#009668]" />
                    Audit Engine v2.4 Active
                  </span>
                  <span className="text-[#c6c6cd]">|</span>
                  <span>Last sync: Today at 09:42 EST</span>
                </div>
              </div>

              {/* Hero Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex flex-col max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 text-[#0051d5] text-[11px] font-semibold tracking-wider uppercase mb-1">
                    <span className="material-symbols-outlined text-[16px]">verified_user</span>
                    Automated Contract Auditing
                  </div>
                  <h1 className="text-3xl lg:text-4xl text-[#0b1c30] tracking-tight font-bold">
                    Know what you were promised.
                  </h1>
                  <p className="text-[15px] text-[#45464d] mt-1.5 leading-relaxed">
                    Verify charges, track contractual commitments, and surface unexpected discrepancies before payment cycles close.
                  </p>
                </div>

                {/* Action Toolbar with required Verify a Bill button */}
                <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                  <button
                    onClick={() => setActiveModal('documents')}
                    className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-white border border-[#c6c6cd]/60 text-[13px] font-medium text-[#0b1c30] hover:bg-[#eff4ff] hover:border-[#76777d] transition-all shadow-xs cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">upload_file</span>
                    <span>Upload Document</span>
                  </button>

                  <button
                    onClick={() => onNavigate('verify-a-bill', 'push')}
                    className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-[#131b2e] text-white text-[13px] font-semibold hover:bg-black transition-all shadow-sm group cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#6ffbbe] transition-transform group-hover:scale-110">
                      add_moderator
                    </span>
                    <span>Verify a Bill</span>
                  </button>
                </div>
              </div>

              {/* 4-Column Metric Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {/* Card 1: Documents Analyzed */}
                <div
                  onClick={() => setActiveModal('documents')}
                  className="bg-white rounded-xl p-5 border border-[#c6c6cd]/40 shadow-xs hover:border-[#0051d5] transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#eff4ff] group-hover:bg-[#dce9ff] flex items-center justify-center text-[#0b1c30] transition-colors">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#eff4ff] text-[#0051d5] font-semibold border border-[#c6c6cd]/30">
                      +4 this month
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-[28px] text-[#0b1c30] font-bold tracking-tight tabular-nums">
                      28
                    </div>
                    <div className="text-[14px] text-[#0b1c30] font-semibold mt-0.5">
                      Documents Analyzed
                    </div>
                    <div className="text-[12px] text-[#45464d] mt-1 flex items-center gap-1.5">
                      <span>12 statements</span>
                      <span className="text-[#c6c6cd]">•</span>
                      <span>16 contracts</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Items Requiring Review */}
                <div
                  onClick={() => {
                    const el = document.getElementById('needs-attention-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white rounded-xl p-5 border border-[#c6c6cd]/40 shadow-xs hover:border-[#ba1a1a] transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#ffdad6]/40 group-hover:bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] transition-colors">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#ffdad6]/60 text-[#93000a] font-bold border border-[#ffdad6]">
                      Attention Needed
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-[28px] text-[#ba1a1a] font-bold tracking-tight tabular-nums">
                      {activeReviewCount}
                    </div>
                    <div className="text-[14px] text-[#0b1c30] font-semibold mt-0.5">
                      Items Requiring Review
                    </div>
                    <div className="text-[12px] text-[#45464d] mt-1">
                      Potential rate changes detected
                    </div>
                  </div>
                </div>

                {/* Card 3: Upcoming Renewals */}
                <div
                  onClick={() => setActiveModal('subscriptions')}
                  className="bg-white rounded-xl p-5 border border-[#c6c6cd]/40 shadow-xs hover:border-[#0051d5] transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#eff4ff] group-hover:bg-[#dce9ff] flex items-center justify-center text-[#0b1c30] transition-colors">
                      <span className="material-symbols-outlined text-[20px]">event_repeat</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#eff4ff] text-[#45464d] font-medium border border-[#c6c6cd]/30">
                      Within 30 days
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-[28px] text-[#0b1c30] font-bold tracking-tight tabular-nums">
                      5
                    </div>
                    <div className="text-[14px] text-[#0b1c30] font-semibold mt-0.5">
                      Upcoming Renewals
                    </div>
                    <div className="text-[12px] text-[#45464d] mt-1 truncate">
                      Next: Cloud Storage on Nov 18
                    </div>
                  </div>
                </div>

                {/* Card 4: Active Subscriptions */}
                <div
                  onClick={() => setActiveModal('subscriptions')}
                  className="bg-white rounded-xl p-5 border border-[#c6c6cd]/40 shadow-xs hover:border-[#009668] transition-all flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-[#eff4ff] group-hover:bg-[#dce9ff] flex items-center justify-center text-[#009668] transition-colors">
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#eff4ff] text-[#009668] font-bold border border-[#c6c6cd]/30">
                      100% audited
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-[28px] text-[#0b1c30] font-bold tracking-tight tabular-nums">
                      14
                    </div>
                    <div className="text-[14px] text-[#0b1c30] font-semibold mt-0.5">
                      Active Subscriptions
                    </div>
                    <div className="text-[12px] text-[#45464d] mt-1 tabular-nums">
                      $342.50 / mo verified baseline
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Section: Needs Your Attention */}
              <section id="needs-attention-section" className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[18px] md:text-[20px] text-[#0b1c30] font-semibold tracking-tight">
                        Needs Your Attention
                      </h2>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold">
                        {activeReviewCount}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#45464d] mt-0.5">
                      Potential discrepancy found between agreed contract terms and recent invoice billings.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-[#45464d]">
                    <span className="material-symbols-outlined text-[16px] text-[#76777d]">tune</span>
                    <span>Sorted by financial variance impact</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Discrepancy Card 1: CloudFiber Broadband */}
                  <article
                    className={`bg-white rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-all hover:border-[#76777d] ${
                      dismissedItems.includes('cloudfiber') ? 'opacity-60 bg-[#eff4ff]/20' : ''
                    }`}
                  >
                    <div className="p-5 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Header & Context */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6]/60 text-[#93000a] border border-[#ffdad6]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                              Potential Discrepancy
                            </span>
                            <span className="text-[12px] text-[#45464d] font-medium">Home Broadband & Fiber</span>
                            <span className="text-[#c6c6cd]">•</span>
                            <span className="text-[12px] text-[#45464d] font-mono">Invoice #INV-9942</span>
                          </div>
                          <h3 className="text-[16px] text-[#0b1c30] font-semibold tracking-tight">
                            CloudFiber Broadband — Subscription renewal rate exceeded promotional lock-in
                          </h3>
                          <p className="text-[13px] text-[#45464d] mt-2 max-w-4xl leading-relaxed">
                            The 24-month promotional guarantee contract submitted in January 2024 states an explicit price lock through January 2026. The latest November invoice removed the discount voucher line item prematurely.
                          </p>
                        </div>

                        {/* Quantitative Comparison Panel */}
                        <div className="bg-[#eff4ff]/70 rounded-xl p-3.5 border border-[#c6c6cd]/30 flex items-center divide-x divide-[#c6c6cd]/40 shrink-0">
                          <div className="pr-5">
                            <div className="text-[11px] text-[#45464d] font-semibold uppercase tracking-wider">
                              Billed Amount
                            </div>
                            <div className="text-[18px] text-[#0b1c30] font-bold tabular-nums mt-0.5">
                              $89.99 <span className="text-[12px] font-normal text-[#45464d]">/ mo</span>
                            </div>
                            <div className="text-[11px] text-[#45464d] mt-0.5">Nov 04, 2025</div>
                          </div>
                          <div className="px-5">
                            <div className="text-[11px] text-[#45464d] font-semibold uppercase tracking-wider">
                              Promised Terms
                            </div>
                            <div className="text-[18px] text-[#0051d5] font-bold tabular-nums mt-0.5">
                              $65.00 <span className="text-[12px] font-normal text-[#45464d]">/ mo</span>
                            </div>
                            <div className="text-[11px] text-[#45464d] mt-0.5 truncate max-w-[150px]">
                              Lock until Jan 2026
                            </div>
                          </div>
                          <div className="pl-5 text-right">
                            <div className="text-[11px] text-[#45464d] font-semibold uppercase tracking-wider">
                              Net Variance
                            </div>
                            <div className="text-[18px] text-[#ba1a1a] font-bold tabular-nums mt-0.5">
                              +$24.99 <span className="text-[12px] font-normal text-[#ba1a1a]">/ mo</span>
                            </div>
                            <div className="text-[11px] text-[#ba1a1a] font-semibold mt-0.5">Unexpected increase</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Meta & Actions Divider */}
                      <div className="mt-5 pt-4 border-t border-[#c6c6cd]/30 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-[12px] text-[#45464d]">
                          <span className="flex items-center gap-1 text-[#0b1c30] font-semibold">
                            <span className="material-symbols-outlined text-[16px] text-[#0051d5]">verified</span>
                            Contract #CF-88219 (Locked)
                          </span>
                          <span>Matched against 4 previous statements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDismiss('cloudfiber', 'CloudFiber Broadband')}
                            className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] px-3 py-1.5 transition-colors cursor-pointer"
                            type="button"
                          >
                            {dismissedItems.includes('cloudfiber') ? 'Dismissed' : 'Dismiss as Expected'}
                          </button>
                          <button
                            onClick={() => setDisputeModalRecord('cloudfiber')}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-[#c6c6cd]/60 text-[13px] font-medium text-[#0b1c30] hover:bg-[#eff4ff] transition-colors shadow-xs cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#45464d]">file_download</span>
                            <span>Dispute Summary</span>
                          </button>
                          {/* Required Review Details button */}
                          <button
                            onClick={() => {
                              loadAudit('cloudfiber');
                              onNavigate('verification-results', 'push');
                            }}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#131b2e] text-white text-[13px] font-semibold hover:bg-black transition-all shadow-xs cursor-pointer"
                            type="button"
                          >
                            <span>Review Details</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* Discrepancy Card 2: Apex Mobile Care */}
                  <article
                    className={`bg-white rounded-xl border border-[#c6c6cd]/50 shadow-xs overflow-hidden transition-all hover:border-[#76777d] ${
                      resolvedItems.includes('apex') ? 'opacity-60 bg-[#eff4ff]/20' : ''
                    }`}
                  >
                    <div className="p-5 lg:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Header & Context */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff4ff] text-[#0051d5] border border-[#c6c6cd]/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                              Discount Verification Needed
                            </span>
                            <span className="text-[12px] text-[#45464d] font-medium">Wireless Family Plan</span>
                            <span className="text-[#c6c6cd]">•</span>
                            <span className="text-[12px] text-[#45464d] font-mono">Invoice #APX-4109</span>
                          </div>
                          <h3 className="text-[16px] text-[#0b1c30] font-semibold tracking-tight">
                            Apex Mobile Care — Auto-pay and paperless discount ($10.00/line) missing from statement
                          </h3>
                          <p className="text-[13px] text-[#45464d] mt-2 max-w-4xl leading-relaxed">
                            Enrolled agreement shows active auto-pay enrollment confirmed on Oct 12, but the statement dated Nov 01 reflects standard non-discounted pricing across 2 active mobile lines.
                          </p>
                        </div>

                        {/* Quantitative Comparison Panel */}
                        <div className="bg-[#eff4ff]/70 rounded-xl p-3.5 border border-[#c6c6cd]/30 flex items-center divide-x divide-[#c6c6cd]/40 shrink-0">
                          <div className="pr-5">
                            <div className="text-[11px] text-[#45464d] font-semibold uppercase tracking-wider">
                              Billed Amount
                            </div>
                            <div className="text-[18px] text-[#0b1c30] font-bold tabular-nums mt-0.5">
                              $165.00
                            </div>
                            <div className="text-[11px] text-[#45464d] mt-0.5">Nov 01, 2025</div>
                          </div>
                          <div className="px-5">
                            <div className="text-[11px] text-[#45464d] font-semibold uppercase tracking-wider">
                              Promised Terms
                            </div>
                            <div className="text-[18px] text-[#0051d5] font-bold tabular-nums mt-0.5">
                              $145.00
                            </div>
                            <div className="text-[11px] text-[#45464d] mt-0.5 truncate max-w-[150px]">
                              With Auto-Pay enrolled
                            </div>
                          </div>
                          <div className="pl-5 text-right">
                            <div className="text-[11px] text-[#45464d] font-semibold uppercase tracking-wider">
                              Net Variance
                            </div>
                            <div className="text-[18px] text-[#ba1a1a] font-bold tabular-nums mt-0.5">
                              +$20.00
                            </div>
                            <div className="text-[11px] text-[#ba1a1a] font-semibold mt-0.5">Unapplied discount</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Meta & Actions Divider */}
                      <div className="mt-5 pt-4 border-t border-[#c6c6cd]/30 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-[12px] text-[#45464d]">
                          <span className="flex items-center gap-1 text-[#0b1c30] font-semibold">
                            <span className="material-symbols-outlined text-[16px] text-[#45464d]">receipt_long</span>
                            Confirmation #APX-CONF-128
                          </span>
                          <span>2 lines affected (Lines ending in 8831, 8832)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolve('apex', 'Apex Mobile Care')}
                            className="text-[13px] font-medium text-[#45464d] hover:text-[#0b1c30] px-3 py-1.5 transition-colors cursor-pointer"
                            type="button"
                          >
                            {resolvedItems.includes('apex') ? '✓ Resolved' : 'Mark Resolved'}
                          </button>
                          {/* Required Review Details button */}
                          <button
                            onClick={() => {
                              loadAudit('apex');
                              onNavigate('verification-results', 'push');
                            }}
                            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-[#c6c6cd]/60 text-[13px] font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors shadow-xs cursor-pointer"
                            type="button"
                          >
                            <span>Review Details</span>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </section>

              {/* Lower Section: 2-Column Balanced Architecture */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Upcoming Renewals */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#0051d5]">update</span>
                      <h2 className="text-[16px] text-[#0b1c30] font-semibold tracking-tight">
                        Upcoming Renewals
                      </h2>
                    </div>
                    <span className="text-[12px] text-[#45464d] font-medium">Next 45 Days</span>
                  </div>

                  <div className="bg-white rounded-xl border border-[#c6c6cd]/40 shadow-xs flex flex-col divide-y divide-[#c6c6cd]/30 overflow-hidden">
                    {/* Item 1: StreamPulse Premier */}
                    <div
                      onClick={() => setActiveModal('subscriptions')}
                      className="p-4 flex items-start gap-3 hover:bg-[#eff4ff]/40 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center shrink-0 text-[#0051d5] mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-[#0b1c30] font-semibold truncate">
                            StreamPulse Premier
                          </span>
                          <span className="font-mono text-[13px] text-[#0b1c30] font-semibold tabular-nums">
                            $19.99/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#45464d] text-[12px] mt-0.5">
                          <span>Renews Nov 18, 2025</span>
                          <span>•</span>
                          <span className="truncate">Annual lock guarantee active</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[#009668] text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          <span>Verified Rate Protection</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 2: Apex Cloud Backup 2TB */}
                    <div
                      onClick={() => setActiveModal('plan-optimizer')}
                      className="p-4 flex items-start gap-3 hover:bg-[#eff4ff]/40 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center shrink-0 text-[#0b1c30] mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">cloud</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-[#0b1c30] font-semibold truncate">
                            Apex Cloud Backup 2TB
                          </span>
                          <span className="font-mono text-[13px] text-[#0b1c30] font-semibold tabular-nums">
                            $9.99/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#45464d] text-[12px] mt-0.5">
                          <span>Renews Nov 24, 2025</span>
                          <span>•</span>
                          <span className="truncate">Introductory rate expires next cycle</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[#ba1a1a] text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[15px]">info</span>
                          <span>Rate scheduled to adjust to $14.99/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 3: Metro Health Club */}
                    <div
                      onClick={() => setActiveModal('subscriptions')}
                      className="p-4 flex items-start gap-3 hover:bg-[#eff4ff]/40 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center shrink-0 text-[#0b1c30] mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">fitness_center</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-[#0b1c30] font-semibold truncate">
                            Metro Health Club
                          </span>
                          <span className="font-mono text-[13px] text-[#0b1c30] font-semibold tabular-nums">
                            $65.00/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#45464d] text-[12px] mt-0.5">
                          <span>Renews Dec 01, 2025</span>
                          <span>•</span>
                          <span className="truncate">Month-to-month agreement</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[#45464d] text-[11px]">
                          <span className="material-symbols-outlined text-[15px]">notifications</span>
                          <span>Requires 30-day notice for changes</span>
                        </div>
                      </div>
                    </div>

                    {/* Item 4: CodeFlow Team Pro */}
                    <div
                      onClick={() => setActiveModal('subscriptions')}
                      className="p-4 flex items-start gap-3 hover:bg-[#eff4ff]/40 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center shrink-0 text-[#0b1c30] mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">terminal</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] text-[#0b1c30] font-semibold truncate">
                            CodeFlow Team Pro
                          </span>
                          <span className="font-mono text-[13px] text-[#0b1c30] font-semibold tabular-nums">
                            $24.00/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#45464d] text-[12px] mt-0.5">
                          <span>Renews Dec 15, 2025</span>
                          <span>•</span>
                          <span className="truncate">Annual seat commitment</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[#009668] text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          <span>Locked Contract Terms</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Link */}
                    <div className="p-3 bg-[#eff4ff]/30 text-center">
                      <button
                        className="text-[13px] text-[#0051d5] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        onClick={() => setActiveModal('subscriptions')}
                      >
                        <span>View all 14 active subscriptions</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Recent Document Activity */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#0b1c30]">history_toggle_off</span>
                      <h2 className="text-[16px] text-[#0b1c30] font-semibold tracking-tight">
                        Recent Document Activity
                      </h2>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="text-[11px] font-semibold text-[#45464d] hover:text-[#0b1c30] px-2.5 py-1 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/30 flex items-center gap-1 cursor-pointer"
                        type="button"
                      >
                        <span>Filter: {activityFilter} ({filteredRecentDocs.length})</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                      </button>

                      {isFilterDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-[#c6c6cd]/50 z-20 py-1 text-[12px]">
                          {(['All', 'Discrepancy', 'Needs Review', 'Match Verified'] as const).map((filterOption) => (
                            <button
                              key={filterOption}
                              onClick={() => {
                                setActivityFilter(filterOption);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-[#eff4ff] transition-colors ${
                                activityFilter === filterOption ? 'font-bold text-[#0051d5]' : 'text-[#45464d]'
                              }`}
                            >
                              {filterOption}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-[#c6c6cd]/40 shadow-xs overflow-hidden flex flex-col justify-between flex-1">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#eff4ff]/50 border-b border-[#c6c6cd]/30">
                            <th className="py-2.5 px-4 text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                              Document / Merchant
                            </th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                              Analyzed
                            </th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                              Status
                            </th>
                            <th className="py-2.5 px-4 text-[11px] font-semibold text-[#45464d] uppercase tracking-wider text-right">
                              Variance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c6c6cd]/20 text-[13px]">
                          {filteredRecentDocs.slice(0, 5).map((doc) => (
                            <tr
                              key={doc.id}
                              className="hover:bg-[#eff4ff]/30 transition-colors cursor-pointer"
                              onClick={() => {
                                if (doc.name.includes('Fiber')) {
                                  loadAudit('apex');
                                  onNavigate('verification-results', 'push');
                                } else if (doc.name.includes('CloudFiber')) {
                                  loadAudit('cloudfiber');
                                  onNavigate('verification-results', 'push');
                                } else {
                                  setActiveModal('documents');
                                }
                              }}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="material-symbols-outlined text-[18px] text-[#76777d]">
                                    {doc.type === 'contract' ? 'description' : 'picture_as_pdf'}
                                  </span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-[#0b1c30] truncate">
                                      {doc.name}
                                    </span>
                                    <span className="text-[11px] text-[#45464d]">{doc.category}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-[#45464d] whitespace-nowrap">
                                {doc.date}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                    doc.status === 'Discrepancy'
                                      ? 'bg-[#ffdad6]/60 text-[#93000a]'
                                      : doc.status === 'Needs Review'
                                      ? 'bg-[#eff4ff] text-[#0051d5] border border-[#c6c6cd]/30'
                                      : 'bg-[#eff4ff] text-[#009668] border border-[#c6c6cd]/30'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      doc.status === 'Discrepancy'
                                        ? 'bg-[#ba1a1a]'
                                        : doc.status === 'Needs Review'
                                        ? 'bg-[#0051d5]'
                                        : 'bg-[#009668]'
                                    }`}
                                  />
                                  {doc.status}
                                </span>
                              </td>
                              <td
                                className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                                  doc.variance?.includes('+') ? 'text-[#ba1a1a]' : 'text-[#45464d]'
                                }`}
                              >
                                {doc.variance || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer */}
                    <div className="p-3 bg-[#eff4ff]/30 border-t border-[#c6c6cd]/30 flex items-center justify-between">
                      <span className="text-[11px] text-[#45464d]">Showing {Math.min(5, filteredRecentDocs.length)} of {documents.length} analyzed documents</span>
                      <button
                        className="text-[13px] text-[#0051d5] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        onClick={() => setActiveModal('documents')}
                      >
                        <span>View all documents in vault</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Dispute Summary PDF Download / Preview Modal */}
      {disputeModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-[#c6c6cd] p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">description</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">
                  Formal Dispute Summary — {disputeModalRecord === 'cloudfiber' ? 'CloudFiber Broadband' : 'Apex Mobile Care'}
                </h3>
              </div>
              <button onClick={() => setDisputeModalRecord(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 bg-[#eff4ff] rounded-lg font-mono text-[12px] space-y-2 leading-relaxed">
              <div className="font-bold text-[#0b1c30]">DISPUTE NOTICE & RATE ENFORCEMENT CLAIM</div>
              <div>Timestamp: {new Date().toLocaleDateString()} | Auditor: Enterprise Auditor</div>
              <div className="p-2 bg-white rounded border border-[#c6c6cd]/30">
                <div>Contract Reference: {disputeModalRecord === 'cloudfiber' ? '#CF-88219 (Locked until Jan 2026)' : '#APX-CONF-128'}</div>
                <div>Alleged Variance: {disputeModalRecord === 'cloudfiber' ? '+$24.99/mo unapplied voucher' : '+$20.00 unapplied autopay discount'}</div>
                <div>Status: Admissible claim prepared with SHA-256 OCR evidence hashes</div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => {
                  window.print();
                  setDisputeModalRecord(null);
                }}
                className="px-4 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-[13px] font-semibold rounded-lg flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Dossier</span>
              </button>
              <button
                onClick={() => {
                  showToast('Dispute summary dossier downloaded.');
                  setDisputeModalRecord(null);
                }}
                className="px-4 py-1.5 bg-[#131b2e] hover:bg-black text-white text-[13px] font-semibold rounded-lg flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download PDF Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
