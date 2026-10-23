import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';

export const AppModals: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    activeModal,
    setActiveModal,
    documents,
    addDocument,
    subscriptions,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    navigate,
    loadAudit,
    showToast,
  } = useApp();

  const [docFilter, setDocFilter] = useState<'all' | 'contract' | 'statement' | 'receipt'>('all');
  const [docSearch, setDocSearch] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocMerchant, setNewDocMerchant] = useState('');
  const [newDocType, setNewDocType] = useState<'contract' | 'statement'>('statement');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiConversation, setAiConversation] = useState<Array<{ q: string; a: string }>>([
    {
      q: 'Does my Apex Fiber broadband contract guarantee a rate lock?',
      a: 'Yes. Section 3.1 of your August 14, 2025 service agreement specifies a promotional rate lock of ₹999/month for 12 billing cycles through August 2026, inclusive of a ₹200 autopay credit.',
    },
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Search filtering in ⌘K Command Palette
  const filteredDocs = documents.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiAsk = (promptText?: string) => {
    const query = promptText || aiQuestion;
    if (!query.trim()) return;
    setIsAiThinking(true);
    setAiQuestion('');

    setTimeout(() => {
      let answer =
        'Based on verified OCR extraction from your uploaded documents, this commitment is active and backed by a documented rate guarantee.';
      const lower = query.toLowerCase();
      if (lower.includes('autopay') || lower.includes('apex mobile')) {
        answer =
          'Your Apex Mobile Care agreement (Confirmation #APX-CONF-128) confirms active autopay enrollment for 2 lines. The $10.00/line discount is currently absent on the Nov 01 statement.';
      } else if (lower.includes('cloudfiber') || lower.includes('promo')) {
        answer =
          'CloudFiber 24-Month Promotional Guarantee (#CF-88219) executes an explicit price lock through January 2026 at $65.00/mo. November invoice #INV-9942 was billed at $89.99/mo.';
      } else if (lower.includes('metro') || lower.includes('gym') || lower.includes('notice')) {
        answer =
          'Metro Health Club contract stipulates a month-to-month agreement requiring 30-day prior written notice before cancellation or rate revisions.';
      }

      setAiConversation((prev) => [...prev, { q: query, a: answer }]);
      setIsAiThinking(false);
    }, 600);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !newDocMerchant.trim()) return;

    addDocument({
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      merchant: newDocMerchant,
      category: newDocType === 'contract' ? 'Service Agreement' : 'Utility Billing',
      date: 'Today',
      type: newDocType,
      size: '1.24 MB',
      status: 'Match Verified',
      variance: '$0.00',
    });

    setNewDocName('');
    setNewDocMerchant('');
  };

  return (
    <>
      {/* 1. Global Command Palette / Search Modal (⌘K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-[#c6c6cd] overflow-hidden flex flex-col animate-fade-in max-h-[80vh]">
            <div className="p-4 border-b border-[#c6c6cd]/30 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#0051d5] text-[22px]">search</span>
              <input
                autoFocus
                className="w-full text-[15px] outline-none text-[#0b1c30] placeholder:text-[#76777d]"
                placeholder="Search bills, contracts, merchants, or execute actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="px-2 py-0.5 bg-[#eff4ff] border border-[#c6c6cd]/60 rounded text-[11px] font-bold text-[#45464d]">
                ESC
              </kbd>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Quick Navigation Section */}
              <div>
                <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider block mb-2 px-2">
                  Quick Navigation
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('overview', 'none');
                    }}
                    className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-left flex items-center gap-2.5 text-[13px] font-semibold text-[#0b1c30] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#0051d5] text-[18px]">analytics</span>
                    <span>Verification Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('verify-a-bill', 'push');
                    }}
                    className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-left flex items-center gap-2.5 text-[13px] font-semibold text-[#0b1c30] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#0051d5] text-[18px]">fact_check</span>
                    <span>Verify a New Bill</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      loadAudit('apex');
                      navigate('verification-results', 'push');
                    }}
                    className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-left flex items-center gap-2.5 text-[13px] font-semibold text-[#0b1c30] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">flag</span>
                    <span>Apex Fiber Audit (#VR-8849)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      loadAudit('cloudfiber');
                      navigate('verification-results', 'push');
                    }}
                    className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-left flex items-center gap-2.5 text-[13px] font-semibold text-[#0b1c30] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">flag</span>
                    <span>CloudFiber Audit (#VR-9942)</span>
                  </button>
                </div>
              </div>

              {/* Matched Documents */}
              <div>
                <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider block mb-2 px-2">
                  Matching Documents & Contracts ({filteredDocs.length})
                </span>
                <div className="space-y-1">
                  {filteredDocs.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (doc.name.includes('Fiber')) {
                          loadAudit('apex');
                          navigate('verification-results', 'push');
                        } else if (doc.name.includes('CloudFiber')) {
                          loadAudit('cloudfiber');
                          navigate('verification-results', 'push');
                        } else {
                          setActiveModal('documents');
                        }
                      }}
                      className="p-2.5 rounded-lg hover:bg-[#eff4ff] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="material-symbols-outlined text-[#45464d] text-[18px]">description</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-semibold text-[#0b1c30] truncate">{doc.name}</span>
                          <span className="text-[11px] text-[#45464d]">{doc.merchant} • {doc.category}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#0051d5]">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Subscriptions */}
              {filteredSubs.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-[#76777d] uppercase tracking-wider block mb-2 px-2">
                    Subscriptions ({filteredSubs.length})
                  </span>
                  <div className="space-y-1">
                    {filteredSubs.slice(0, 3).map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActiveModal('subscriptions');
                        }}
                        className="p-2.5 rounded-lg hover:bg-[#eff4ff] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[#0051d5] text-[18px]">sync_alt</span>
                          <div>
                            <div className="text-[13px] font-semibold text-[#0b1c30]">{sub.name}</div>
                            <div className="text-[11px] text-[#45464d]">Renews {sub.renewsOn}</div>
                          </div>
                        </div>
                        <span className="font-mono text-[13px] font-bold text-[#0b1c30]">{sub.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#eff4ff]/60 border-t border-[#c6c6cd]/30 flex items-center justify-between text-[11px] text-[#45464d]">
              <span>Press <strong>ESC</strong> to dismiss or click any item to jump directly.</span>
              <span className="font-semibold text-[#0051d5]">Demonstration Environment Sandbox</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. My Documents Vault Modal */}
      {activeModal === 'documents' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-[#c6c6cd] flex flex-col max-h-[88vh] overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                  <span className="material-symbols-outlined text-[20px]">folder_open</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0b1c30]">My Documents Vault</h3>
                  <p className="text-[12px] text-[#45464d]">28 indexed contracts, addendums, and statements secured by SHA-256 integrity hashes.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Controls & Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
                  {(['all', 'contract', 'statement', 'receipt'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDocFilter(filter)}
                      className={`px-3 py-1 text-[12px] font-semibold rounded-md capitalize transition-colors ${
                        docFilter === filter
                          ? 'bg-white text-[#0b1c30] shadow-xs'
                          : 'text-[#45464d] hover:text-[#0b1c30]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#76777d] text-[18px]">
                    search
                  </span>
                  <input
                    className="w-full h-8 pl-8 pr-3 text-[12px] bg-white border border-[#c6c6cd] rounded-lg outline-none focus:border-[#0051d5]"
                    placeholder="Filter vault..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Upload Form Box */}
              <form onSubmit={handleUploadSubmit} className="p-4 rounded-xl bg-[#eff4ff]/60 border border-[#c6c6cd]/40 space-y-3">
                <div className="text-[13px] font-bold text-[#0b1c30] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0051d5] text-[18px]">upload_file</span>
                  <span>Add Document to Secure Vault</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    className="h-9 px-3 rounded-lg border border-[#c6c6cd] text-[13px] bg-white outline-none focus:border-[#0051d5]"
                    placeholder="Document Name (e.g. Utility_Bill_Dec.pdf)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    required
                  />
                  <input
                    className="h-9 px-3 rounded-lg border border-[#c6c6cd] text-[13px] bg-white outline-none focus:border-[#0051d5]"
                    placeholder="Merchant / Provider"
                    value={newDocMerchant}
                    onChange={(e) => setNewDocMerchant(e.target.value)}
                    required
                  />
                  <div className="flex gap-2">
                    <select
                      className="h-9 px-2 rounded-lg border border-[#c6c6cd] text-[13px] bg-white outline-none flex-1"
                      value={newDocType}
                      onChange={(e) => setNewDocType(e.target.value as 'contract' | 'statement')}
                    >
                      <option value="statement">Statement / Bill</option>
                      <option value="contract">Contract / Guarantee</option>
                    </select>
                    <button
                      type="submit"
                      className="h-9 px-4 bg-[#131b2e] hover:bg-black text-white text-[13px] font-semibold rounded-lg shadow-xs cursor-pointer"
                    >
                      Add & Index
                    </button>
                  </div>
                </div>
              </form>

              {/* Table of Vault Documents */}
              <div className="border border-[#c6c6cd]/40 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#eff4ff] border-b border-[#c6c6cd]/30 text-[11px] font-semibold text-[#45464d] uppercase">
                      <th className="py-2.5 px-4">Document</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c6c6cd]/20">
                    {documents
                      .filter((d) => (docFilter === 'all' ? true : d.type === docFilter))
                      .filter(
                        (d) =>
                          d.name.toLowerCase().includes(docSearch.toLowerCase()) ||
                          d.merchant.toLowerCase().includes(docSearch.toLowerCase())
                      )
                      .map((doc) => (
                        <tr key={doc.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="material-symbols-outlined text-[18px] text-[#45464d]">
                                {doc.type === 'contract' ? 'contract' : 'receipt_long'}
                              </span>
                              <div>
                                <div className="font-semibold text-[#0b1c30]">{doc.name}</div>
                                <div className="text-[11px] text-[#45464d]">{doc.merchant} • {doc.size}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#45464d] whitespace-nowrap">{doc.date}</td>
                          <td className="py-3 px-3 capitalize text-[#45464d]">{doc.type}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#eff4ff] text-[#0051d5] border border-[#c6c6cd]/30">
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setActiveModal(null);
                                navigate('verify-a-bill', 'push');
                              }}
                              className="text-[12px] text-[#0051d5] font-semibold hover:underline cursor-pointer"
                            >
                              Verify against baseline →
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-[#eff4ff]/40 border-t border-[#c6c6cd]/30 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-[#131b2e] hover:bg-black text-white text-[13px] font-semibold rounded-lg cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Subscriptions Management Modal */}
      {activeModal === 'subscriptions' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-[#c6c6cd] flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                  <span className="material-symbols-outlined text-[20px]">sync_alt</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0b1c30]">Active Subscriptions (14)</h3>
                  <p className="text-[12px] text-[#45464d]">$342.50 / mo verified baseline expenditure tracked across all contracts.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto divide-y divide-[#c6c6cd]/30">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#0051d5] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#0b1c30]">{sub.name}</div>
                      <div className="text-[12px] text-[#45464d]">{sub.category} • Renews {sub.renewsOn}</div>
                      <div className="text-[11px] font-medium text-[#76777d] mt-0.5">{sub.contractStatus}</div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
                    <span className="font-mono text-[14px] font-bold text-[#0b1c30]">{sub.rate}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        sub.badgeType === 'warning'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : sub.badgeType === 'verified'
                          ? 'bg-[#eff4ff] text-[#009668]'
                          : 'bg-[#eff4ff] text-[#45464d]'
                      }`}
                    >
                      {sub.badgeText}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#eff4ff]/40 border-t border-[#c6c6cd]/30 flex items-center justify-between">
              <span className="text-[12px] text-[#45464d]">Deterministic monitoring active on all 14 merchants.</span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Plan Optimizer Modal */}
      {activeModal === 'plan-optimizer' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-[#c6c6cd] flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0b1c30]">Plan Optimizer</h3>
                  <p className="text-[12px] text-[#45464d]">Algorithmic recommendation engine for contract savings and tariff alignments.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#0051d5]/20 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-semibold text-[#0051d5] uppercase tracking-wider">Total Optimization Potential</div>
                  <div className="text-[26px] font-bold text-[#0b1c30] font-mono mt-0.5">$628.00 / year</div>
                  <div className="text-[12px] text-[#45464d]">3 high-confidence optimizations identified across active agreements.</div>
                </div>
                <span className="material-symbols-outlined text-[36px] text-[#0051d5]">savings</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-[#c6c6cd]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#0b1c30]">Apex Mobile Care — Auto-Pay Re-linking</span>
                    <span className="font-mono text-[13px] font-bold text-[#009668]">Save $240/yr</span>
                  </div>
                  <p className="text-[12px] text-[#45464d]">
                    By updating your paperless debit method to verify active checking mandate, restore the $10/line autopay rebate across both mobile lines.
                  </p>
                  <button
                    onClick={() => {
                      showToast('Drafted Autopay clarification inquiry.');
                      setActiveModal(null);
                      navigate('verification-results', 'push');
                    }}
                    className="px-3 py-1.5 bg-[#131b2e] text-white text-[12px] font-semibold rounded-lg hover:bg-black transition-colors"
                  >
                    Execute Claim via VR-8849 →
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-[#c6c6cd]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#0b1c30]">CloudFiber Promotional Lock-in Extension</span>
                    <span className="font-mono text-[13px] font-bold text-[#009668]">Save $300/yr</span>
                  </div>
                  <p className="text-[12px] text-[#45464d]">
                    Enforce explicit Contract #CF-88219 lock-in clause through Jan 2026 to credit the overbilled $24.99/mo rate hike.
                  </p>
                  <button
                    onClick={() => {
                      loadAudit('cloudfiber');
                      setActiveModal(null);
                      navigate('verification-results', 'push');
                    }}
                    className="px-3 py-1.5 bg-[#131b2e] text-white text-[12px] font-semibold rounded-lg hover:bg-black transition-colors"
                  >
                    Review CloudFiber Case →
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-[#c6c6cd]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#0b1c30]">Apex Cloud 2TB Promotional Expiry Alert</span>
                    <span className="font-mono text-[13px] font-bold text-[#ba1a1a]">Action Needed</span>
                  </div>
                  <p className="text-[12px] text-[#45464d]">
                    Introductory promotional discount expires on Nov 24, scheduled to increase from $9.99/mo to $14.99/mo. Switch to annual commitment to maintain $9.99 rate.
                  </p>
                  <button
                    onClick={() => {
                      showToast('Reminder schedule created for Nov 20.');
                    }}
                    className="px-3 py-1.5 bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold rounded-lg hover:bg-[#e5eeff] transition-colors"
                  >
                    Set Renewal Notice Alarm
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#eff4ff]/40 border-t border-[#c6c6cd]/30 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI Assistant Modal */}
      {activeModal === 'ai-assistant' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-[#c6c6cd] flex flex-col h-[75vh] overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5]">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0b1c30]">Commitment AI Assistant</h3>
                  <p className="text-[11px] text-[#45464d]">Directly grounded in your 28 indexed contracts and invoices.</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {aiConversation.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-[#131b2e] text-white px-3.5 py-2 rounded-xl rounded-tr-xs text-[13px] max-w-md">
                      {item.q}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#eff4ff] text-[#0b1c30] px-3.5 py-2.5 rounded-xl rounded-tl-xs text-[13px] max-w-md border border-[#c6c6cd]/30 leading-relaxed">
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex items-center gap-2 text-[#45464d] text-[12px] p-2">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span>Scanning contract clauses and verified OCR index...</span>
                </div>
              )}
            </div>

            {/* Prompt Chips */}
            <div className="px-4 py-2 border-t border-[#c6c6cd]/20 flex flex-wrap gap-1.5 bg-[#eff4ff]/30">
              <button
                onClick={() => handleAiAsk('When does my CloudFiber promo expire?')}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#eff4ff] text-[#0b1c30] border border-[#c6c6cd]/40 rounded-full cursor-pointer"
              >
                When does CloudFiber promo expire?
              </button>
              <button
                onClick={() => handleAiAsk('Is my autopay discount valid for cycle 4?')}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#eff4ff] text-[#0b1c30] border border-[#c6c6cd]/40 rounded-full cursor-pointer"
              >
                Autopay discount status?
              </button>
              <button
                onClick={() => handleAiAsk('What notice period does Metro Health Club require?')}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#eff4ff] text-[#0b1c30] border border-[#c6c6cd]/40 rounded-full cursor-pointer"
              >
                Gym cancellation terms?
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#c6c6cd]/30 flex items-center gap-2">
              <input
                className="flex-1 h-9 px-3 rounded-lg border border-[#c6c6cd] text-[13px] outline-none focus:border-[#0051d5]"
                placeholder="Ask anything regarding your contractual rights or invoices..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAiAsk();
                }}
              />
              <button
                onClick={() => handleAiAsk()}
                className="h-9 px-4 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg hover:bg-black"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Activity & Alerts Drawer */}
      {activeModal === 'activity' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-[#c6c6cd] flex flex-col animate-slide-left">
            <div className="p-5 border-b border-[#c6c6cd]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">notifications_active</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Activity & Alerts</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 border-b border-[#c6c6cd]/20 flex items-center justify-between">
              <span className="text-[12px] text-[#45464d]">{notifications.filter((n) => !n.read).length} Unread Alerts</span>
              <button
                onClick={markAllNotificationsRead}
                className="text-[12px] font-semibold text-[#0051d5] hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#c6c6cd]/20">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.title.includes('CloudFiber')) {
                      loadAudit('cloudfiber');
                      setActiveModal(null);
                      navigate('verification-results', 'push');
                    } else if (notif.title.includes('Autopay')) {
                      loadAudit('apex');
                      setActiveModal(null);
                      navigate('verification-results', 'push');
                    }
                  }}
                  className={`p-4 hover:bg-[#eff4ff]/50 transition-colors cursor-pointer ${
                    !notif.read ? 'bg-[#eff4ff]/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-bold text-[#0b1c30]">{notif.title}</span>
                    <span className="text-[11px] text-[#76777d] shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-[12px] text-[#45464d] mt-1 leading-relaxed">{notif.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#eff4ff]/40 border-t border-[#c6c6cd]/30 flex justify-between items-center">
              <span className="text-[11px] text-[#76777d]">Instant webhook monitoring</span>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Account & Privacy Modal */}
      {activeModal === 'account' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#c6c6cd] flex flex-col animate-fade-in p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">security</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Account & Privacy Vault</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-3 rounded-lg bg-[#eff4ff] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0b1c30]">Enterprise Auditor ID</div>
                  <div className="text-[12px] text-[#45464d]">audit@consumerpromise.io</div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#6ffbbe]/40 text-[#009668]">
                  Verified
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[#c6c6cd]/40 space-y-1">
                <div className="font-bold text-[#0b1c30]">Zero-Knowledge Hardware Enclave</div>
                <p className="text-[12px] text-[#45464d]">
                  Contracts are parsed client-side using WebAssembly OCR. No raw financial account numbers or PII are stored on remote central servers.
                </p>
                <div className="font-mono text-[11px] text-[#76777d]">Root Hash: a49f8b...e109</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-[#c6c6cd]/40">
                <div>
                  <div className="font-bold text-[#0b1c30]">Two-Factor / FIDO2 Passkey</div>
                  <div className="text-[12px] text-[#45464d]">Hardware security token active</div>
                </div>
                <span className="material-symbols-outlined text-[#0051d5]">fingerprint</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => {
                  showToast('Cryptographic master keys rotated successfully.');
                  setActiveModal(null);
                }}
                className="text-[12px] font-semibold text-[#0051d5] hover:underline"
              >
                Rotate Master Key
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Audit Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-[#c6c6cd] flex flex-col animate-fade-in p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">settings</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Platform Settings</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="block text-[12px] font-bold text-[#0b1c30] mb-1">
                  Discrepancy Sensitivity Threshold
                </label>
                <select className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] bg-white text-[13px]">
                  <option>Strict (Flag any variance ≥ $0.01)</option>
                  <option>Moderate (Flag variance &gt; $5.00)</option>
                  <option>Percentage-based (Flag variance &gt; 5%)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#0b1c30] mb-1">
                  Default Display Currency
                </label>
                <select className="w-full h-9 px-3 rounded-lg border border-[#c6c6cd] bg-white text-[13px]">
                  <option>USD ($) — United States Dollar</option>
                  <option>INR (₹) — Indian Rupee</option>
                  <option>EUR (€) — Euro</option>
                  <option>GBP (£) — British Pound</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#0051d5] w-4 h-4" />
                  <span className="text-[#0b1c30] font-medium">Auto-generate formal dispute letters for detected breaches</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => {
                  showToast('Settings saved.');
                  setActiveModal(null);
                }}
                className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Methodology Modal */}
      {activeModal === 'methodology' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-[#c6c6cd] flex flex-col p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">verified</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Audit Trust Engine Methodology</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-[13px] text-[#45464d] space-y-3 leading-relaxed">
              <p>
                <strong>PROMISE vs REALITY</strong> executes a deterministic reconciliation framework comparing historical commitments (offers, order confirmations, signed agreements) against delivered billing invoices.
              </p>
              <div className="p-3 bg-[#eff4ff] rounded-lg space-y-1">
                <div className="font-bold text-[#0b1c30]">1. Zero-Knowledge OCR Extraction</div>
                <p className="text-[12px]">All documents are indexed locally into cryptographically signed clause vectors without sending plain text outside your vault session.</p>
              </div>
              <div className="p-3 bg-[#eff4ff] rounded-lg space-y-1">
                <div className="font-bold text-[#0b1c30]">2. Mathematical Parity Audit</div>
                <p className="text-[12px]">Exact unit rates, unapplied promotional discounts, usage brackets, and statutory levies are audited line-by-line using exact half-up rounding.</p>
              </div>
              <div className="p-3 bg-[#eff4ff] rounded-lg space-y-1">
                <div className="font-bold text-[#0b1c30]">3. Formal Evidence Archival</div>
                <p className="text-[12px]">Dispute summaries generate admissible PDFs referencing exact paragraph and timestamped execution dates.</p>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#c6c6cd]/20">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg">
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Help Center Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#c6c6cd] flex flex-col p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">help</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Consumer Help Center</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="text-[13px] text-[#45464d] space-y-3">
              <div className="p-3 rounded-lg border border-[#c6c6cd]/40">
                <div className="font-bold text-[#0b1c30]">What should I do if a discrepancy is flagged?</div>
                <div className="text-[12px] mt-1">Review the line-item ledger, verify whether autopay was declined, then use our drafted inquiry template to contact provider billing.</div>
              </div>
              <div className="p-3 rounded-lg border border-[#c6c6cd]/40">
                <div className="font-bold text-[#0b1c30]">Can I compare multiple bills at once?</div>
                <div className="text-[12px] mt-1">Yes, upload your documents in the Verify a Bill portal or choose from your Vault.</div>
              </div>
              <div className="p-3 rounded-lg border border-[#c6c6cd]/40">
                <div className="font-bold text-[#0b1c30]">Need escalation support?</div>
                <div className="text-[12px] mt-1">Email our institutional compliance desk at support@consumerpromise.io.</div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-[#c6c6cd]/20">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg">
                Close Help Center
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
