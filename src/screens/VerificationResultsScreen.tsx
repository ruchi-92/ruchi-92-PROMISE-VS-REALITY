import React, { useState, useEffect } from 'react';
import { Screen, TransitionType } from '../types.ts';
import { Sidebar } from '../components/Sidebar.tsx';
import { Header } from '../components/Header.tsx';
import { useApp } from '../context/AppContext.tsx';

interface VerificationResultsScreenProps {
  onNavigate: (screen: Screen, transition?: TransitionType) => void;
}

export const VerificationResultsScreen: React.FC<VerificationResultsScreenProps> = ({ onNavigate }) => {
  const { activeAudit, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<'document' | 'breakdown' | 'evidence' | 'voucher-info' | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [customInquiry, setCustomInquiry] = useState(activeAudit.draftInquiry);

  // Synchronize inquiry text when activeAudit updates
  useEffect(() => {
    setCustomInquiry(activeAudit.draftInquiry);
  }, [activeAudit.draftInquiry]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customInquiry);
    setCopied(true);
    showToast('Copied clarification inquiry letter to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    showToast('Preparing PDF Audit Dossier...');
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 600);
  };

  const isVerifiedClean = !activeAudit.hasDiscrepancy && activeAudit.status === 'verified';

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen">
      {/* Sidebar with nav links to overview and verify-a-bill (none transitions) */}
      <Sidebar currentScreen="verification-results" onNavigate={onNavigate} />

      <div className="pl-[260px]">
        {/* Header containing exact xpath: //header//div[contains(@class, 'flex')]//span[text()='Overview'] */}
        <Header currentScreen="verification-results" onNavigate={onNavigate} />

        <main className="relative pt-16 bg-[#f8f9ff] min-h-screen pb-16">
          <div className="flex flex-col w-full">
            <div className="max-w-[1400px] w-full mx-auto px-6 md:px-8 py-8 flex flex-col gap-6">
              
              {/* Top Breadcrumb & Record Context */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 text-[#45464d] text-[11px] uppercase tracking-wider">
                    <span
                      className="cursor-pointer hover:text-[#0b1c30]"
                      onClick={() => onNavigate('overview', 'push_back')}
                    >
                      Dashboard
                    </span>
                    <span className="text-[#c6c6cd]">/</span>
                    <span
                      className="cursor-pointer hover:text-[#0b1c30]"
                      onClick={() => onNavigate('verify-a-bill', 'push_back')}
                    >
                      Verify a Bill
                    </span>
                    <span className="text-[#c6c6cd]">/</span>
                    <span className="text-[#0051d5] font-mono font-bold">
                      Verification Results #{activeAudit.referenceNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="text-2xl md:text-3xl text-[#0b1c30] font-bold tracking-tight">
                      Verification Results
                    </h1>
                    <span className="text-[11px] bg-[#dce9ff] text-[#0b1c30] px-2.5 py-0.5 rounded-full font-semibold">
                      Record #{activeAudit.referenceNumber}
                    </span>
                    {activeAudit.isSimulated ? (
                      <span className="text-[11px] bg-[#eff4ff] text-[#45464d] px-2.5 py-0.5 rounded-full font-semibold border border-[#c6c6cd]/40">
                        Demo Baseline
                      </span>
                    ) : (
                      <span className="text-[11px] bg-[#effdf5] text-[#166534] px-2.5 py-0.5 rounded-full font-bold border border-[#bbf7d0]">
                        Live AI Analysis
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-[#45464d]">
                    {activeAudit.description}
                  </p>
                </div>

                {/* Quick Header Actions & Meta with required Re-verify button */}
                <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                  {/* EXACT xpath: //button[contains(., 'Re-verify')] */}
                  <button
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0b1c30] rounded-lg shadow-xs hover:bg-[#eff4ff] transition-colors text-[13px] font-semibold border border-[#c6c6cd]/40 cursor-pointer"
                    type="button"
                    onClick={() => onNavigate('verify-a-bill', 'push_back')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">refresh</span>
                    <span>Re-verify</span>
                  </button>

                  <button
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0b1c30] rounded-lg shadow-xs hover:bg-[#eff4ff] transition-colors text-[13px] font-semibold border border-[#c6c6cd]/40 cursor-pointer"
                    type="button"
                    onClick={handleExportPDF}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">
                      {isExporting ? 'progress_activity' : 'picture_as_pdf'}
                    </span>
                    <span>{isExporting ? 'Generating PDF...' : 'Export Audit Summary (PDF)'}</span>
                  </button>
                </div>
              </div>

              {/* Metadata Pill Strip */}
              <div className="flex flex-wrap items-center gap-2 py-2 px-3.5 bg-[#eff4ff] rounded-lg text-[11px] text-[#45464d] border border-[#c6c6cd]/30">
                {activeAudit.isSimulated ? (
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#0051d5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                    DEMONSTRATION AUDIT RECORD
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#009668]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009668]" />
                    LIVE GEMINI AI AUDIT RECORD
                  </span>
                )}
                <span className="text-[#c6c6cd]">•</span>
                <span className="font-mono">Audit Timestamp: {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                <span className="text-[#c6c6cd]">•</span>
                <span className="font-mono">Protocol v2.4 (Gemini 3.8 Flash Multimodal OCR)</span>
                <span className="text-[#c6c6cd]">•</span>
                <span className="text-[#0b1c30] font-semibold">Merchant: {activeAudit.merchant}</span>
              </div>

              {/* Inverted Role Warning if applicable */}
              {activeAudit.roleInvertedWarning && (
                <div className="p-3 bg-[#eff4ff] border border-[#0051d5]/30 rounded-lg text-[12px] text-[#003ea8] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                  <span>{activeAudit.roleInvertedWarning}</span>
                </div>
              )}

              {/* Status & Core Variance Callout */}
              <div className={`rounded-xl shadow-xs border p-6 flex flex-col gap-4 ${
                isVerifiedClean
                  ? 'bg-[#f4fcf6] border-[#bbf7d0]'
                  : 'bg-white border-[#c6c6cd]/40'
              }`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isVerifiedClean
                        ? 'bg-[#dcfce7] text-[#166534]'
                        : 'bg-[#d3e4fe] text-[#0051d5]'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">
                        {isVerifiedClean ? 'check_circle' : 'flag'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isVerifiedClean
                            ? 'bg-[#dcfce7] text-[#166534] border-[#86efac]'
                            : 'bg-[#eff4ff] text-[#003ea8] border-[#0051d5]/20'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isVerifiedClean ? 'bg-[#166534]' : 'bg-[#0051d5]'}`} />
                          {activeAudit.statusLabel}
                        </span>
                        <span className="font-mono text-[12px] text-[#45464d]">
                          Ref: {activeAudit.contractRef || 'TERMS-VERIFIED'}
                        </span>
                      </div>
                      <p className="text-[16px] text-[#0b1c30] font-semibold mt-1">
                        {isVerifiedClean ? (
                          'No discrepancy was identified between the original commitment and the delivered invoice based on available evidence.'
                        ) : (
                          `The recorded invoice is ${activeAudit.currencySymbol}${activeAudit.varianceAmount.toFixed(2)} higher than the original documented amount. The available evidence does not yet explain the difference.`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex md:flex-col items-end justify-center">
                    <div className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                      Calculated Delta
                    </div>
                    <div className={`text-[26px] font-bold font-mono ${
                      isVerifiedClean
                        ? 'text-[#166534]'
                        : 'text-[#ba1a1a]'
                    }`}>
                      {isVerifiedClean
                        ? `${activeAudit.currencySymbol}0.00`
                        : `+${activeAudit.currencySymbol}${activeAudit.varianceAmount.toFixed(2)}`}
                    </div>
                  </div>
                </div>

                {/* Advisory Disclaimer Pill */}
                <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${
                  isVerifiedClean
                    ? 'bg-white/80 border-[#bbf7d0] text-[#166534]'
                    : 'bg-[#eff4ff] border-[#c6c6cd]/20 text-[#45464d]'
                }`}>
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-[#0051d5]">
                    info
                  </span>
                  <span className="text-[12px] leading-relaxed">
                    <strong className="text-[#0b1c30]">Notice:</strong> Differences require review and do not automatically indicate intentional overcharging or wrongdoing. Legitimate explanations may include uncredited introductory vouchers, mid-cycle prorations, or updated statutory tax rates. Note that this verification does not constitute a legal or accounting guarantee.
                  </span>
                </div>
              </div>

              {/* Missing Information & Ambiguous Terms Callouts (if identified) */}
              {((activeAudit.missingInformation && activeAudit.missingInformation.length > 0) ||
                (activeAudit.ambiguousTerms && activeAudit.ambiguousTerms.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Missing Info */}
                  {activeAudit.missingInformation && activeAudit.missingInformation.length > 0 && (
                    <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-5 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[#0b1c30]">
                        <span className="material-symbols-outlined text-[20px] text-[#0051d5]">help_outline</span>
                        <h3 className="text-[14px] font-bold">Missing Information / Verification Limits</h3>
                      </div>
                      <p className="text-[12px] text-[#45464d]">
                        The auditor identified the following details absent or unverified in the provided inputs:
                      </p>
                      <ul className="space-y-1.5 mt-1">
                        {activeAudit.missingInformation.map((item, idx) => (
                          <li key={idx} className="text-[12px] text-[#0b1c30] flex items-start gap-2 bg-[#eff4ff]/60 p-2 rounded">
                            <span className="material-symbols-outlined text-[14px] text-[#0051d5] shrink-0 mt-0.5">remove</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ambiguous Terms */}
                  {activeAudit.ambiguousTerms && activeAudit.ambiguousTerms.length > 0 && (
                    <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-5 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[#0b1c30]">
                        <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">warning_amber</span>
                        <h3 className="text-[14px] font-bold">Ambiguous Terms & Potential Conditions</h3>
                      </div>
                      <p className="text-[12px] text-[#45464d]">
                        The following contractual clauses contain conditions or exclusions requiring manual review:
                      </p>
                      <ul className="space-y-1.5 mt-1">
                        {activeAudit.ambiguousTerms.map((item, idx) => (
                          <li key={idx} className="text-[12px] text-[#0b1c30] flex items-start gap-2 bg-[#ffdad6]/20 p-2 rounded">
                            <span className="material-symbols-outlined text-[14px] text-[#ba1a1a] shrink-0 mt-0.5">info</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Side-by-Side Comparison Metrics (3-Column Clean Card Block) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Original Commitment */}
                <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#45464d]">
                        Original Commitment
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#009668] border border-[#4edea3]/30">
                        <span className="material-symbols-outlined text-[14px]">verified</span> Extracted Fact
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-[32px] text-[#0b1c30] font-mono font-bold tracking-tight">
                        {activeAudit.currencySymbol}{activeAudit.promisedAmount?.toFixed(2) || '0.00'}
                        <span className="text-[14px] text-[#45464d] font-normal">/mo</span>
                      </div>
                      <div className="text-[15px] font-semibold text-[#0b1c30] mt-1">
                        Documented Plan Rate
                      </div>
                      <div className="text-[12px] text-[#45464d] mt-1 leading-snug">
                        {activeAudit.promisedTerms || `Quoted in ${activeAudit.promiseDocument.name}`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-2.5 bg-[#eff4ff] rounded-lg p-2.5 flex items-center justify-between text-[12px] text-[#45464d]">
                    <span>Confidence Score</span>
                    <span className="font-mono font-bold text-[#0b1c30]">{activeAudit.confidenceScore || 98.5}% Match</span>
                  </div>
                </div>

                {/* 2. Actual Invoice Billed */}
                <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#45464d]">
                        Actual Invoice
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dce9ff] text-[#00174b] border border-[#0051d5]/20">
                        <span className="material-symbols-outlined text-[14px]">receipt_long</span> Confirmed Statement
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-[32px] text-[#0b1c30] font-mono font-bold tracking-tight">
                        {activeAudit.currencySymbol}{activeAudit.billedAmount?.toFixed(2) || '0.00'}
                        <span className="text-[14px] text-[#45464d] font-normal">/mo</span>
                      </div>
                      <div className="text-[15px] font-semibold text-[#0b1c30] mt-1">
                        Delivered Statement Charge
                      </div>
                      <div className="text-[12px] text-[#45464d] mt-1 leading-snug">
                        {activeAudit.merchant} • Billed {activeAudit.dateBilled || 'Current Cycle'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-2.5 bg-[#eff4ff] rounded-lg p-2.5 flex items-center justify-between text-[12px] text-[#45464d]">
                    <span>Billing Period</span>
                    <span className="font-mono font-bold text-[#0b1c30]">{activeAudit.billingPeriod || 'Current Period'}</span>
                  </div>
                </div>

                {/* 3. Difference / Net Variance */}
                <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#45464d]">
                        Net Variance
                      </span>
                      {isVerifiedClean ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#166534] border border-[#86efac]">
                          <span className="material-symbols-outlined text-[14px]">check</span> Match Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6]/60 text-[#93000a] border border-[#ffdad6]">
                          <span className="material-symbols-outlined text-[14px]">warning</span> Pending Review
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className={`text-[32px] font-mono font-bold tracking-tight ${isVerifiedClean ? 'text-[#166534]' : 'text-[#0051d5]'}`}>
                        {isVerifiedClean ? (
                          `${activeAudit.currencySymbol}0.00`
                        ) : (
                          `+${activeAudit.currencySymbol}${activeAudit.varianceAmount?.toFixed(2) || '0.00'}`
                        )}
                        <span className="text-[14px] text-[#45464d] font-normal">/mo</span>
                      </div>
                      <div className="text-[15px] font-semibold text-[#0b1c30] mt-1">
                        {isVerifiedClean
                          ? 'Zero Unexplained Variance'
                          : `Unexplained Variance (+${((activeAudit.varianceAmount / (activeAudit.promisedAmount || 1)) * 100).toFixed(2)}%)`}
                      </div>
                      <div className="text-[12px] text-[#45464d] mt-1 leading-snug">
                        {isVerifiedClean
                          ? 'All itemized charges match stated promotional baseline'
                          : `Identified rate increase or missing promotional credit`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-2.5 bg-[#eff4ff] rounded-lg p-2.5 flex items-center justify-between text-[12px] text-[#45464d]">
                    <span>Projected 12-mo Impact</span>
                    <span className={`font-mono font-bold ${isVerifiedClean ? 'text-[#166534]' : 'text-[#0051d5]'}`}>
                      {isVerifiedClean
                        ? `${activeAudit.currencySymbol}0.00 / year`
                        : `+${activeAudit.currencySymbol}${(activeAudit.projectedAnnualImpact || activeAudit.varianceAmount * 12).toFixed(2)} / year`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Quick Action Bar */}
              <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center shrink-0 text-[#0051d5]">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold text-[#0b1c30] truncate">
                      Recommended Audit Next Steps
                    </span>
                    <span className="text-[12px] text-[#45464d] truncate">
                      {isVerifiedClean
                        ? 'Archive confirmation or store statement in vault for future rate renewal monitoring.'
                        : 'Export formal inquiry file or request structured clarification from billing team.'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] rounded-lg transition-colors text-[13px] font-medium border border-[#c6c6cd]/30 cursor-pointer"
                    type="button"
                    onClick={() => setActiveModal('document')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">description</span>
                    <span>View Promise Document</span>
                  </button>

                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] rounded-lg transition-colors text-[13px] font-medium border border-[#c6c6cd]/30 cursor-pointer"
                    type="button"
                    onClick={() => setActiveModal('breakdown')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">list_alt</span>
                    <span>Inspect Line Breakdown</span>
                  </button>

                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] rounded-lg transition-colors text-[13px] font-medium border border-[#c6c6cd]/30 cursor-pointer"
                    type="button"
                    onClick={() => setActiveModal('evidence')}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">add_circle</span>
                    <span>Add Supporting Document</span>
                  </button>

                  <button
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-[#131b2e] rounded-lg transition-colors text-[13px] font-semibold shadow-xs cursor-pointer"
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('inquiry-template-box');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                    <span>Draft Inquiry Letter</span>
                  </button>
                </div>
              </div>

              {/* Evidence & Line Item Breakdown Section (Side-by-Side Detailed Audit Grid) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] md:text-[20px] font-bold text-[#0b1c30]">
                      Evidence & Line-Item Verification
                    </h2>
                    <p className="text-[13px] text-[#45464d]">
                      Side-by-side clause extraction verifying baseline contract commitments against current invoice entries.
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[#45464d] text-[11px] font-semibold">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#0051d5]" />
                    <span>Gemini Multimodal OCR Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Source Document Evidence: The Promise */}
                  <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-5 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 bg-[#eff4ff]/60 p-3 rounded-lg border border-[#c6c6cd]/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined text-[24px] text-[#0051d5]">contract</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-[#0b1c30] truncate">
                            {activeAudit.promiseDocument.name}
                          </span>
                          <span className="text-[11px] text-[#45464d]">
                            Commitment Baseline • Date: {activeAudit.promiseDocument.date || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#009668] font-bold border border-[#4edea3]/30">
                        The Promise
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Clause Extraction Box */}
                      <div className="p-3.5 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-[#c6c6cd]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-[#0b1c30]">
                            {activeAudit.promiseDocument.clauseNumber || 'Section 1.1'}: {activeAudit.promiseDocument.clauseTitle || 'Documented Commitment'}
                          </span>
                          <span className="font-mono font-bold text-[#0b1c30] text-[13px]">
                            {activeAudit.currencySymbol}{activeAudit.promisedAmount?.toFixed(2) || '0.00'} / mo
                          </span>
                        </div>
                        <p className="text-[13px] text-[#45464d] leading-relaxed">
                          "{activeAudit.promiseDocument.clauseText || 'Original rate terms and commitment schedule as documented.'}"
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[#009668] text-[11px] font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span>{activeAudit.promiseDocument.ocrMatch || 'Verbatim Citation from Source'}</span>
                        </div>
                      </div>

                      {/* Document Hash / Reference */}
                      <div className="p-3 rounded-lg bg-[#dce9ff]/40 flex items-center justify-between text-[11px] text-[#45464d] border border-[#c6c6cd]/30">
                        <span className="flex items-center gap-1.5 font-mono">
                          <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                          Document: {activeAudit.promiseDocument.name}
                        </span>
                        <button
                          onClick={() => setActiveModal('document')}
                          className="text-[#0051d5] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          Inspect Document <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Billed Statement Evidence: The Reality */}
                  <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-5 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 bg-[#eff4ff]/60 p-3 rounded-lg border border-[#c6c6cd]/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="material-symbols-outlined text-[24px] text-[#45464d]">receipt</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-[#0b1c30] truncate">
                            {activeAudit.realityDocument.name}
                          </span>
                          <span className="text-[11px] text-[#45464d]">
                            Invoice Reference #{activeAudit.invoiceNumber || 'INV-CURRENT'} • Due {activeAudit.realityDocument.dueDate || 'Current'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#00174b] font-bold border border-[#0051d5]/20">
                        The Reality
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Billed Item Extraction */}
                      <div className="p-3.5 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-[#c6c6cd]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-[#0b1c30]">
                            {activeAudit.realityDocument.itemNumber || 'Billed Line Charge'}: {activeAudit.realityDocument.itemTitle || ''}
                          </span>
                          <span className="font-mono font-bold text-[#0b1c30] text-[13px]">
                            {activeAudit.currencySymbol}{activeAudit.billedAmount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <p className="text-[13px] text-[#45464d] leading-relaxed">
                          "{activeAudit.realityDocument.itemText || 'Invoiced statement line charges and final payable amount.'}"
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[#45464d] text-[11px]">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          <span>Billed item cross-referenced against commitment</span>
                        </div>
                      </div>

                      {/* Discrepancy Note */}
                      <div className={`p-3.5 rounded-lg flex flex-col gap-1 border ${
                        isVerifiedClean
                          ? 'bg-[#dcfce7]/30 border-[#86efac]'
                          : 'bg-[#ffdad6]/40 border-[#ffdad6]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[12px] font-bold ${isVerifiedClean ? 'text-[#166534]' : 'text-[#93000a]'}`}>
                            {isVerifiedClean ? 'Reconciliation Assessment' : 'Key Variance Finding'}
                          </span>
                          <span className={`font-mono font-bold text-[13px] ${isVerifiedClean ? 'text-[#166534]' : 'text-[#ba1a1a]'}`}>
                            {isVerifiedClean ? 'Verified Match' : `${activeAudit.currencySymbol}${activeAudit.varianceAmount.toFixed(2)} Variance`}
                          </span>
                        </div>
                        <p className={`text-[13px] leading-relaxed ${isVerifiedClean ? 'text-[#166534]' : 'text-[#93000a]'}`}>
                          {activeAudit.realityDocument.discrepancyNote ||
                            (isVerifiedClean
                              ? 'Verified: All billed charges align with documented agreement terms.'
                              : 'Potential variance identified in the billed realization.')}
                        </p>
                      </div>

                      {/* Full Statement link */}
                      <div className="p-3 rounded-lg bg-[#dce9ff]/40 flex items-center justify-between text-[11px] text-[#45464d] border border-[#c6c6cd]/30">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">account_balance</span>
                          Statement total: {activeAudit.currencySymbol}{activeAudit.billedAmount?.toFixed(2)}
                        </span>
                        <button
                          onClick={() => setActiveModal('breakdown')}
                          className="text-[#0051d5] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          Full Breakdown <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Calculation Details Ledger (Compact Comparison Table) */}
              <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 overflow-hidden flex flex-col">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#c6c6cd]/20">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0b1c30]">
                      Reconciliation Audit Ledger
                    </h3>
                    <p className="text-[13px] text-[#45464d]">
                      Line-by-line mathematical balance comparison between contract schedule and statement charges.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[#45464d] text-[11px]">
                    <span>Currency: {activeAudit.currency || 'USD'} ({activeAudit.currencySymbol})</span>
                    <span className="text-[#c6c6cd]">•</span>
                    <span>Calculated with Gemini AI</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#eff4ff] text-[11px] font-semibold text-[#45464d] uppercase tracking-wider border-b border-[#c6c6cd]/30">
                        <th className="py-3 px-5">Description</th>
                        <th className="py-3 px-5 text-right">Promised Rate</th>
                        <th className="py-3 px-5 text-right">Billed Amount</th>
                        <th className="py-3 px-5 text-right">Variance</th>
                        <th className="py-3 px-5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] text-[#0b1c30] divide-y divide-[#c6c6cd]/20">
                      {activeAudit.ledger?.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            row.status === 'Potential Discrepancy'
                              ? 'bg-[#eff4ff]/30 hover:bg-[#eff4ff]/60'
                              : 'hover:bg-[#eff4ff]/40'
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
                              {row.description}
                              {row.status === 'Potential Discrepancy' && (
                                <button
                                  type="button"
                                  onClick={() => setActiveModal('voucher-info')}
                                  className="text-[#0051d5] hover:opacity-80 cursor-pointer"
                                  title="View clause details"
                                >
                                  <span className="material-symbols-outlined text-[16px]">help</span>
                                </button>
                              )}
                            </div>
                            <div
                              className={`text-[12px] ${
                                row.status === 'Potential Discrepancy'
                                  ? 'text-[#0051d5] font-semibold'
                                  : 'text-[#45464d]'
                              }`}
                            >
                              {row.subtext}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono">{row.promisedRate}</td>
                          <td className="py-3.5 px-5 text-right font-mono">{row.billedAmount}</td>
                          <td
                            className={`py-3.5 px-5 text-right font-mono font-bold ${
                              row.variance !== '₹0.00' && row.variance !== '$0.00' && !row.variance.includes('0.00')
                                ? 'text-[#ba1a1a]'
                                : 'text-[#45464d]'
                            }`}
                          >
                            {row.variance}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                row.status === 'Potential Discrepancy'
                                  ? 'bg-[#ffdad6]/60 text-[#93000a] border border-[#ffdad6]'
                                  : 'bg-[#eff4ff] text-[#009668] border border-[#4edea3]/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  row.status === 'Potential Discrepancy'
                                    ? 'bg-[#ba1a1a]'
                                    : 'bg-[#009668]'
                                }`}
                              />
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* Row Total */}
                      <tr className="bg-[#dce9ff]/40 font-semibold border-t border-[#c6c6cd]/30">
                        <td className="py-4 px-5 text-[#0b1c30] font-bold">Total Payable (Net)</td>
                        <td className="py-4 px-5 text-right font-mono text-[#0b1c30] text-[16px] font-bold">
                          {activeAudit.currencySymbol}{activeAudit.promisedAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-4 px-5 text-right font-mono text-[#0b1c30] text-[16px] font-bold">
                          {activeAudit.currencySymbol}{activeAudit.billedAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className={`py-4 px-5 text-right font-mono text-[16px] font-bold ${isVerifiedClean ? 'text-[#166534]' : 'text-[#ba1a1a]'}`}>
                          {isVerifiedClean ? (
                            `${activeAudit.currencySymbol}0.00`
                          ) : (
                            `+${activeAudit.currencySymbol}${activeAudit.varianceAmount?.toFixed(2) || '0.00'}`
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${
                            isVerifiedClean
                              ? 'bg-[#dcfce7] text-[#166534] border-[#86efac]'
                              : 'bg-[#d3e4fe] text-[#0051d5] border-[#0051d5]/30'
                          }`}>
                            {isVerifiedClean ? 'Verified' : 'Action Recommended'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* "What to check next" Guidance Section */}
              <div className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                      <span className="material-symbols-outlined text-[20px]">checklist</span>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#0b1c30]">What to check next</h3>
                      <p className="text-[13px] text-[#45464d]">
                        Practical, realistic verification steps for everyday consumers before escalating.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#45464d] bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#c6c6cd]/30">
                    Consumer Protection Guide
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1 */}
                  <div
                    onClick={() => setActiveModal('voucher-info')}
                    className="p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff]/60 transition-colors cursor-pointer flex items-start gap-3 border border-[#c6c6cd]/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#d3e4fe] text-[#0051d5] font-mono font-bold text-[13px] flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#0b1c30]">
                        Check for separate credit note or voucher ledger
                      </h4>
                      <p className="text-[12px] text-[#45464d] leading-relaxed">
                        Providers occasionally credit promotional offsets in a separate prepaid wallet or subsequent statement cycle. Log in to your provider app and check the "Credits & Discounts" tab.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    onClick={() => showToast('Checking Autopay Mandate criteria...')}
                    className="p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff]/60 transition-colors cursor-pointer flex items-start gap-3 border border-[#c6c6cd]/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#d3e4fe] text-[#0051d5] font-mono font-bold text-[13px] flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#0b1c30]">
                        Review Auto-Pay & Paperless billing status
                      </h4>
                      <p className="text-[12px] text-[#45464d] leading-relaxed">
                        Some promotional credits require active bank e-mandate or continuous paperless billing. Verify that your primary payment method did not expire or decline.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    onClick={() => showToast('Inspected account for mid-cycle changes.')}
                    className="p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff]/60 transition-colors cursor-pointer flex items-start gap-3 border border-[#c6c6cd]/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#d3e4fe] text-[#0051d5] font-mono font-bold text-[13px] flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#0b1c30]">
                        Look for mid-cycle plan upgrades or addons
                      </h4>
                      <p className="text-[12px] text-[#45464d] leading-relaxed">
                        Check if any speed boost trial, add-on channel pack, or router rental upgrade was activated during this billing window, which may modify baseline rate clauses.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div
                    onClick={() => {
                      const el = document.getElementById('inquiry-template-box');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-4 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff]/60 transition-colors cursor-pointer flex items-start gap-3 border border-[#c6c6cd]/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#0051d5] text-white font-mono font-bold text-[13px] flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#0b1c30]">
                        Use our drafted clarification request
                      </h4>
                      <p className="text-[12px] text-[#45464d] leading-relaxed">
                        Send a polite, fact-based inquiry referencing your initial agreement date and missing promotional line item. Click the draft button above to preview the structured letter.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contextual Draft Inquiry Card */}
              <div
                id="inquiry-template-box"
                className="bg-white rounded-xl shadow-xs border border-[#c6c6cd]/40 p-6 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between pb-1 border-b border-[#c6c6cd]/20">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-[#0051d5]">mark_email_read</span>
                    <span className="text-[16px] font-bold text-[#0b1c30]">
                      Automated Clarification Inquiry Template
                    </span>
                  </div>
                  <span className="text-[11px] text-[#45464d] font-mono bg-[#eff4ff] px-2.5 py-1 rounded-full border border-[#c6c6cd]/30">
                    Consumer Dispute Resolution Standard
                  </span>
                </div>

                <textarea
                  className="w-full h-56 p-4 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-mono text-[13px] leading-relaxed select-all border border-[#c6c6cd]/30 shadow-inner outline-none focus:border-[#0051d5]"
                  value={customInquiry}
                  onChange={(e) => setCustomInquiry(e.target.value)}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-[12px] text-[#45464d]">
                    Click to copy or directly send through registered email.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] rounded-lg transition-colors text-[13px] font-semibold border border-[#c6c6cd]/40 cursor-pointer"
                      onClick={handleCopy}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copied ? 'done' : 'content_copy'}
                      </span>
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                    </button>

                    <a
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black text-white hover:bg-[#131b2e] rounded-lg transition-colors text-[13px] font-semibold cursor-pointer"
                      href={`mailto:billing@${(activeAudit.merchant || 'provider').toLowerCase().replace(/\s+/g, '')}.com?subject=${encodeURIComponent(
                        `Request for Clarification — Invoice Variance #${activeAudit.invoiceNumber}`
                      )}&body=${encodeURIComponent(customInquiry)}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>Open in Mail Client</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Inspect Document Modal */}
      {activeModal === 'document' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-[#c6c6cd] flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">contract</span>
                <span className="font-bold text-[#0b1c30]">{activeAudit.promiseDocument.name}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 bg-[#eff4ff] rounded-lg text-[13px] font-mono leading-relaxed space-y-3">
              <div className="font-bold text-[#0b1c30]">DOCUMENTED COMMITMENT CLAUSES</div>
              <div>Source Document: {activeAudit.promiseDocument.name} | Date: {activeAudit.promiseDocument.date || 'N/A'}</div>
              <div className="p-3 bg-white rounded border border-[#0051d5]/40">
                <div className="font-semibold text-[#0051d5]">
                  {activeAudit.promiseDocument.clauseNumber}: {activeAudit.promiseDocument.clauseTitle}
                </div>
                <div className="mt-1 text-[#0b1c30]">"{activeAudit.promiseDocument.clauseText}"</div>
                <div className="mt-1 text-[#009668] font-bold">✓ Source Location: {activeAudit.promiseDocument.ocrMatch}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#131b2e] text-white rounded-lg text-[13px] font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Charge Breakdown Modal */}
      {activeModal === 'breakdown' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-[#c6c6cd] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">receipt</span>
                <span className="font-bold text-[#0b1c30]">Statement #{activeAudit.invoiceNumber} Breakdown</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="divide-y divide-[#c6c6cd]/30 text-[13px]">
              <div className="py-2.5 flex justify-between">
                <span>{activeAudit.realityDocument.itemNumber || 'Billed Service Line'}</span>
                <span className="font-mono font-bold">{activeAudit.currencySymbol}{activeAudit.billedAmount?.toFixed(2)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-[#45464d]">
                <span>Documented Promotional Benchmark</span>
                <span className="font-mono font-bold">{activeAudit.currencySymbol}{activeAudit.promisedAmount?.toFixed(2)}</span>
              </div>
              <div className={`py-3 flex justify-between font-bold text-[15px] pt-3 ${isVerifiedClean ? 'text-[#166534]' : 'text-[#ba1a1a]'}`}>
                <span>Net Calculated Variance</span>
                <span className="font-mono">
                  {isVerifiedClean ? `${activeAudit.currencySymbol}0.00` : `+${activeAudit.currencySymbol}${activeAudit.varianceAmount?.toFixed(2)}`}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#131b2e] text-white rounded-lg text-[13px] font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Missing Evidence Modal */}
      {activeModal === 'evidence' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#c6c6cd] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">add_circle</span>
                <span className="font-bold text-[#0b1c30]">Attach Additional Audit Evidence</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 border-2 border-dashed border-[#c6c6cd] rounded-xl text-center bg-[#eff4ff]/50">
              <span className="material-symbols-outlined text-[32px] text-[#0051d5] mb-2">upload_file</span>
              <div className="text-[14px] font-semibold text-[#0b1c30]">Upload payment proof or email screenshot</div>
              <div className="text-[12px] text-[#45464d] mt-1">Supports PDF, PNG, JPG up to 25MB</div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#eff4ff] text-[#0b1c30] rounded-lg text-[13px] font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  showToast('Evidence document attached and queued for OCR index verification.');
                }}
                className="px-4 py-1.5 bg-[#131b2e] text-white rounded-lg text-[13px] font-semibold"
              >
                Attach & Re-scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Clause Details Modal */}
      {activeModal === 'voucher-info' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#c6c6cd] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">Clause & Variance Specification</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#45464d] leading-relaxed">
              {activeAudit.realityDocument.discrepancyNote ||
                `Under ${activeAudit.promiseDocument.clauseNumber}, an agreed baseline rate was locked. The current statement reflects a variance of ${activeAudit.currencySymbol}${activeAudit.varianceAmount.toFixed(2)}.`}
            </p>
            <div className="flex justify-end pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
