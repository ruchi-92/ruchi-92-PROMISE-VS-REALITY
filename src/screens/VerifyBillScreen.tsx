import React, { useState, useRef, useEffect } from 'react';
import { Screen, TransitionType, UploadedFileDoc } from '../types.ts';
import { Sidebar } from '../components/Sidebar.tsx';
import { Header } from '../components/Header.tsx';
import { useApp, VAULT_DOCUMENT_PREVIEWS } from '../context/AppContext.tsx';

interface VerifyBillScreenProps {
  onNavigate: (screen: Screen, transition?: TransitionType) => void;
}

export const VerifyBillScreen: React.FC<VerifyBillScreenProps> = ({ onNavigate }) => {
  const {
    promiseFile,
    setPromiseFile,
    actualFile,
    setActualFile,
    loadAudit,
    setActiveAudit,
    showToast,
    documents,
    addDocument,
  } = useApp();

  const [isComparing, setIsComparing] = useState(false);
  const [comparingStage, setComparingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<
    'promise-vault' | 'portal-connect' | 'batch' | 'pillar-detail' | 'text-input-promise' | 'text-input-actual' | null
  >(null);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [dragActive1, setDragActive1] = useState(false);
  const [dragActive2, setDragActive2] = useState(false);
  const [customTextDraft, setCustomTextDraft] = useState('');

  const promiseInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = useRef<HTMLInputElement>(null);

  // Prevent accidental file drops on the window from opening in browser tab
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleReset = () => {
    setPromiseFile(null);
    setActualFile(null);
    setErrorMessage(null);
    showToast('Reset verification fields. Ready for new documents.');
  };

  const handleSwapRoles = () => {
    const temp = promiseFile;
    setPromiseFile(actualFile);
    setActualFile(temp);
    showToast('Swapped roles: Source 01 ⇄ Source 02');
  };

  const processUploadedFile = (file: File, type: 'promise' | 'actual') => {
    setErrorMessage(null);

    // Limit check (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage(`The file "${file.name}" exceeds the 25MB limit. Please upload a smaller document.`);
      return;
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = `${sizeMB} MB`;

    // Text-based files
    if (
      file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.md')
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        const docPayload: UploadedFileDoc = {
          name: file.name,
          size: sizeStr,
          mimeType: file.type || 'text/plain',
          text: textContent,
          fromUserLaptop: true,
        };
        if (type === 'promise') {
          setPromiseFile(docPayload);
        } else {
          setActualFile(docPayload);
        }
        showToast(`Uploaded ${file.name} from your laptop`);
      };
      reader.onerror = () => {
        setErrorMessage(`Failed to read "${file.name}". Please ensure the file is accessible.`);
      };
      reader.readAsText(file);
    } else {
      // PDF or Images (Multimodal)
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        const docPayload: UploadedFileDoc = {
          name: file.name,
          size: sizeStr,
          mimeType: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png'),
          base64Data: dataUrl,
          fromUserLaptop: true,
        };
        if (type === 'promise') {
          setPromiseFile(docPayload);
        } else {
          setActualFile(docPayload);
        }
        showToast(`Uploaded ${file.name} from your laptop`);
      };
      reader.onerror = () => {
        setErrorMessage(`Failed to load file "${file.name}". Please try another format.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (type: 'promise' | 'actual', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0], type);
      // Reset input value so re-selecting the exact same file works
      e.target.value = '';
    }
  };

  const handleDrop = (type: 'promise' | 'actual', e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'promise') setDragActive1(false);
    else setDragActive2(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0], type);
    }
  };

  // Real AI Analysis execution
  const handleCompare = async () => {
    if (!promiseFile && !actualFile) {
      setErrorMessage('Please upload at least one document from your laptop or select from the vault to verify.');
      showToast('No documents provided.');
      return;
    }

    setErrorMessage(null);
    setIsComparing(true);
    setComparingStage('Reading document contents & extracting clauses...');

    try {
      const response = await fetch('/api/analyze-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promiseDoc: promiseFile
            ? {
                name: promiseFile.name,
                size: promiseFile.size,
                mimeType: promiseFile.mimeType,
                base64Data: promiseFile.base64Data,
                text: promiseFile.text,
              }
            : undefined,
          realityDoc: actualFile
            ? {
                name: actualFile.name,
                size: actualFile.size,
                mimeType: actualFile.mimeType,
                base64Data: actualFile.base64Data,
                text: actualFile.text,
              }
            : undefined,
        }),
      });

      setComparingStage('Cross-referencing rates & detecting variances...');

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server verification failed with code ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.audit) {
        throw new Error(result.error || 'Verification engine failed to generate an audit record.');
      }

      // Add to vault list if uploaded from laptop
      if (promiseFile?.fromUserLaptop) {
        addDocument({
          name: promiseFile.name,
          merchant: result.audit.merchant || 'My Document',
          category: result.audit.category || 'Contract',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          type: 'contract',
          size: promiseFile.size,
          status: result.audit.hasDiscrepancy ? 'Discrepancy' : 'Match Verified',
        });
      }
      if (actualFile?.fromUserLaptop) {
        addDocument({
          name: actualFile.name,
          merchant: result.audit.merchant || 'My Document',
          category: result.audit.category || 'Statement',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          type: 'statement',
          size: actualFile.size,
          status: result.audit.hasDiscrepancy ? 'Discrepancy' : 'Match Verified',
        });
      }

      setActiveAudit(result.audit);
      showToast(`Audit completed: ${result.audit.statusLabel}`);
      onNavigate('verification-results', 'push');
    } catch (err: any) {
      console.error('Audit comparison failed:', err);
      setErrorMessage(err.message || 'AI Verification failed. Please check document contents and try again.');
      showToast('Verification error occurred.');
    } finally {
      setIsComparing(false);
      setComparingStage('');
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen">
      {/* Sidebar with nav link to overview (none transition) */}
      <Sidebar currentScreen="verify-a-bill" onNavigate={onNavigate} />

      <div className="pl-[260px]">
        {/* Header */}
        <Header currentScreen="verify-a-bill" onNavigate={onNavigate} />

        <main className="relative pt-16 bg-[#f8f9ff] min-h-screen pb-16">
          <div className="flex flex-col w-full">
            <div className="px-6 md:px-8 py-8 max-w-[1360px] mx-auto w-full flex flex-col gap-8">
              
              {/* Top Introduction & Engine Integrity Flag */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[#45464d] text-[11px] font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]" />
                    <span>Gemini AI Consumer Audit Engine</span>
                  </div>
                  {/* Styled strictly as requested by focus mode */}
                  <h1
                    className="text-3xl lg:text-4xl text-[#0b1530] tracking-tight font-bold"
                    style={{ color: '#0b1530', fontWeight: 'bold', fontFamily: 'Times New Roman' }}
                  >
                    Verify a Bill
                  </h1>
                  <p className="text-[15px] text-[#45464d]" style={{ fontFamily: 'system-ui' }}>
                    Compare the original terms with the final charge to detect variances and unfulfilled commitments.
                  </p>
                </div>

                {/* Trust Indicator Capsule */}
                <div className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-full bg-[#eff4ff] shadow-xs border border-[#c6c6cd]/30">
                  <span className="material-symbols-outlined text-[#0051d5] text-[16px]">
                    verified_user
                  </span>
                  <span className="text-[11px] text-[#0b1c30] font-semibold tracking-wide">
                    Live Gemini Multimodal Analysis <span className="text-[#c6c6cd] font-normal px-1">•</span> Direct Laptop Upload
                  </span>
                </div>
              </div>

              {/* Error Alert Banner if analysis failed */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-[#ffdad6]/70 border border-[#ffdad6] text-[#93000a] flex items-start gap-3 shadow-xs">
                  <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">
                    error
                  </span>
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="text-[14px] font-bold">Verification Notice</span>
                    <p className="text-[13px] text-[#93000a] leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-[#93000a] hover:opacity-75 p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              )}

              {/* Quick Preset / Clear Action Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#c6c6cd]/40 shadow-xs">
                <div className="flex items-center gap-2 text-[13px] text-[#45464d]">
                  <span className="material-symbols-outlined text-[18px] text-[#0051d5]">laptop_mac</span>
                  <span className="font-semibold text-[#0b1c30]">Upload Your Own Files:</span>
                  <span>Upload any bill, contract, receipt, or invoice from your laptop below.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[12px] font-semibold rounded-lg border border-[#c6c6cd]/40 shadow-xs cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">clear_all</span>
                    <span>Clear All Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSwapRoles}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#eff4ff] text-[#0051d5] text-[12px] font-semibold rounded-lg border border-[#c6c6cd]/40 shadow-xs cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                    <span>Swap Roles (Source 01 ⇄ Source 02)</span>
                  </button>
                </div>
              </div>

              {/* Dual File Upload Comparison Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel 1: Original Promise */}
                <div className="bg-white rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-200 border border-[#c6c6cd]/40">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#316bf3]" />
                        <span className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                          Source 01
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {promiseFile?.fromUserLaptop ? (
                          <span className="text-[10px] bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded font-bold border border-[#86efac]">
                            From Your Laptop
                          </span>
                        ) : promiseFile ? (
                          <span className="text-[10px] bg-[#dce9ff] text-[#00174b] px-2 py-0.5 rounded font-bold">
                            Vault Baseline
                          </span>
                        ) : null}
                        <span className="text-[11px] bg-[#eff4ff] text-[#0b1c30] px-2.5 py-0.5 rounded-full font-semibold border border-[#c6c6cd]/30">
                          Original Commitment
                        </span>
                      </div>
                    </div>

                    <h2
                      className="text-[20px] text-[#0b1c30] font-bold"
                      style={{ fontFamily: 'Times New Roman' }}
                    >
                      Original Promise
                    </h2>
                    <p className="text-[13px] text-[#45464d]">
                      Upload an offer, quotation, promotional flyer, or contract terms.
                    </p>

                    {/* Hidden Native File Input */}
                    <input
                      ref={promiseInputRef}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      id="input-promise"
                      onChange={(e) => handleFileChange('promise', e)}
                    />

                    {/* Drop Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive1(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive1(false);
                      }}
                      onDrop={(e) => handleDrop('promise', e)}
                      className={`mt-2 p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-150 ${
                        dragActive1
                          ? 'bg-[#dce9ff] border-[#0051d5]'
                          : 'bg-[#eff4ff]/40 border-[#c6c6cd]/80 hover:border-[#0051d5]'
                      }`}
                      id="dropzone-promise"
                    >
                      {promiseFile ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#0051d5] border border-[#c6c6cd]/30">
                            <span className="material-symbols-outlined text-[26px]">description</span>
                          </div>

                          <div className="space-y-1 max-w-full px-2">
                            <p className="text-[14px] text-[#0b1c30] font-bold flex items-center justify-center gap-1.5 truncate">
                              <span className="truncate">{promiseFile.name}</span>
                              <span className="text-[#0051d5] text-[12px] font-semibold shrink-0">
                                ({promiseFile.size})
                              </span>
                            </p>
                            <span className="text-[11px] text-[#009668] font-bold flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              <span>Ready for Gemini AI clause extraction</span>
                            </span>
                          </div>

                          {/* Action Buttons for Loaded File */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => promiseInputRef.current?.click()}
                              className="px-3.5 py-1.5 bg-[#0051d5] hover:bg-[#003ea8] text-white text-[12px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[15px]">file_upload</span>
                              <span>Replace from Laptop</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPromiseFile(null)}
                              className="px-3 py-1.5 bg-white hover:bg-[#ffdad6]/40 text-[#ba1a1a] text-[12px] font-semibold rounded-lg border border-[#c6c6cd]/40 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#45464d] border border-[#c6c6cd]/30">
                            <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[14px] text-[#0b1c30] font-semibold">
                              Drag & drop your commitment document here
                            </p>
                            <p className="text-[12px] text-[#45464d]">
                              Supports PDF, PNG, JPG, WEBP, TXT, CSV, DOCX (Max 25MB)
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => promiseInputRef.current?.click()}
                            className="mt-1 px-4 py-2 bg-[#0051d5] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-2 group"
                          >
                            <span className="material-symbols-outlined text-[18px]">laptop</span>
                            <span>Choose File from Laptop</span>
                          </button>
                        </div>
                      )}

                      <div className="mt-4 py-1.5 px-3 rounded-md bg-[#e5eeff] text-[#45464d] text-[11px] flex items-center gap-1.5 max-w-md">
                        <span className="material-symbols-outlined text-[14px] shrink-0">info</span>
                        <span>e.g., Service contract, renewal quotation, price lock guarantee, or receipt.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#c6c6cd]/20">
                    <div className="flex items-center gap-3">
                      <button
                        className="inline-flex items-center gap-1.5 text-[#0051d5] hover:text-[#316bf3] text-[13px] font-semibold transition-colors cursor-pointer"
                        type="button"
                        onClick={() => setActivePicker('promise-vault')}
                      >
                        <span className="material-symbols-outlined text-[16px]">folder_special</span>
                        <span>Pick from Vault</span>
                      </button>

                      <button
                        className="inline-flex items-center gap-1 text-[#45464d] hover:text-[#0b1c30] text-[13px] font-medium transition-colors cursor-pointer"
                        type="button"
                        onClick={() => {
                          setCustomTextDraft(promiseFile?.text || '');
                          setActivePicker('text-input-promise');
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Paste / Edit Clauses</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-[#76777d]">
                      {promiseFile ? 'Document attached' : 'No document selected'}
                    </span>
                  </div>
                </div>

                {/* Panel 2: Actual Outcome */}
                <div className="bg-white rounded-xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow duration-200 border border-[#c6c6cd]/40">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#4edea3]" />
                        <span className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                          Source 02
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {actualFile?.fromUserLaptop ? (
                          <span className="text-[10px] bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded font-bold border border-[#86efac]">
                            From Your Laptop
                          </span>
                        ) : actualFile ? (
                          <span className="text-[10px] bg-[#dce9ff] text-[#00174b] px-2 py-0.5 rounded font-bold">
                            Portal Statement
                          </span>
                        ) : null}
                        <span className="text-[11px] bg-[#eff4ff] text-[#0b1c30] px-2.5 py-0.5 rounded-full font-semibold border border-[#c6c6cd]/30">
                          Billed Realization
                        </span>
                      </div>
                    </div>

                    <h2
                      className="text-[20px] text-[#0b1c30] font-bold"
                      style={{ fontFamily: 'Times New Roman' }}
                    >
                      Actual Outcome
                    </h2>
                    <p className="text-[13px] text-[#45464d]">
                      Upload the final invoice, statement, or payment receipt.
                    </p>

                    {/* Hidden Native File Input */}
                    <input
                      ref={actualInputRef}
                      type="file"
                      accept="*/*"
                      className="hidden"
                      id="input-actual"
                      onChange={(e) => handleFileChange('actual', e)}
                    />

                    {/* Drop Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive2(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive2(false);
                      }}
                      onDrop={(e) => handleDrop('actual', e)}
                      className={`mt-2 p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all duration-150 ${
                        dragActive2
                          ? 'bg-[#dce9ff] border-[#0051d5]'
                          : 'bg-[#eff4ff]/40 border-[#c6c6cd]/80 hover:border-[#0051d5]'
                      }`}
                      id="dropzone-actual"
                    >
                      {actualFile ? (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#0051d5] border border-[#c6c6cd]/30">
                            <span className="material-symbols-outlined text-[26px]">receipt_long</span>
                          </div>

                          <div className="space-y-1 max-w-full px-2">
                            <p className="text-[14px] text-[#0b1c30] font-bold flex items-center justify-center gap-1.5 truncate">
                              <span className="truncate">{actualFile.name}</span>
                              <span className="text-[#0051d5] text-[12px] font-semibold shrink-0">
                                ({actualFile.size})
                              </span>
                            </p>
                            <span className="text-[11px] text-[#009668] font-bold flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              <span>Ready for Gemini line-item AI audit</span>
                            </span>
                          </div>

                          {/* Action Buttons for Loaded File */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => actualInputRef.current?.click()}
                              className="px-3.5 py-1.5 bg-[#0051d5] hover:bg-[#003ea8] text-white text-[12px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[15px]">file_upload</span>
                              <span>Replace from Laptop</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActualFile(null)}
                              className="px-3 py-1.5 bg-white hover:bg-[#ffdad6]/40 text-[#ba1a1a] text-[12px] font-semibold rounded-lg border border-[#c6c6cd]/40 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#45464d] border border-[#c6c6cd]/30">
                            <span className="material-symbols-outlined text-[26px]">receipt</span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[14px] text-[#0b1c30] font-semibold">
                              Drag & drop your invoice or statement here
                            </p>
                            <p className="text-[12px] text-[#45464d]">
                              Supports PDF, PNG, JPG, WEBP, TXT, CSV, DOCX (Max 25MB)
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => actualInputRef.current?.click()}
                            className="mt-1 px-4 py-2 bg-[#0051d5] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-2 group"
                          >
                            <span className="material-symbols-outlined text-[18px]">laptop</span>
                            <span>Choose File from Laptop</span>
                          </button>
                        </div>
                      )}

                      <div className="mt-4 py-1.5 px-3 rounded-md bg-[#e5eeff] text-[#45464d] text-[11px] flex items-center gap-1.5 max-w-md">
                        <span className="material-symbols-outlined text-[14px] shrink-0">info</span>
                        <span>e.g., Credit card statement, monthly utility bill, final receipt, or order confirmation.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#c6c6cd]/20">
                    <div className="flex items-center gap-3">
                      <button
                        className="inline-flex items-center gap-1.5 text-[#0051d5] hover:text-[#316bf3] text-[13px] font-semibold transition-colors cursor-pointer"
                        type="button"
                        onClick={() => setActivePicker('portal-connect')}
                      >
                        <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                        <span>Fetch Portal Bill</span>
                      </button>

                      <button
                        className="inline-flex items-center gap-1 text-[#45464d] hover:text-[#0b1c30] text-[13px] font-medium transition-colors cursor-pointer"
                        type="button"
                        onClick={() => {
                          setCustomTextDraft(actualFile?.text || '');
                          setActivePicker('text-input-actual');
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_note</span>
                        <span>Paste / Edit Statement</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-[#76777d]">
                      {actualFile ? 'Document attached' : 'No document selected'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Primary Verification Action & Secondary Options */}
              <div className="bg-white rounded-xl p-5 md:p-6 shadow-xs border border-[#c6c6cd]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0051d5] shrink-0">
                    <span className="material-symbols-outlined text-[24px]">compare</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-[#0b1c30]">Ready to audit?</span>
                    <span className="text-[13px] text-[#45464d]">
                      {isComparing
                        ? comparingStage
                        : 'Gemini compares clauses, checks conditions, detects mathematical variances, and cites source proof.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    className="px-4 h-[38px] rounded-lg bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] transition-colors text-[13px] font-medium flex items-center gap-1.5 border border-[#c6c6cd]/30 cursor-pointer"
                    id="btn-reset"
                    onClick={handleReset}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Reset fields</span>
                  </button>

                  <button
                    className="px-4 h-[38px] rounded-lg bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] transition-colors text-[13px] font-medium flex items-center gap-1.5 border border-[#c6c6cd]/30 cursor-pointer hidden md:flex"
                    type="button"
                    onClick={() => setActivePicker('batch')}
                  >
                    <span className="material-symbols-outlined text-[16px]">layers</span>
                    <span>Batch compare</span>
                  </button>

                  {/* EXACT xpath: //button[@id='btn-compare'] */}
                  <button
                    className="h-[38px] px-5 rounded-lg bg-[#131b2e] hover:bg-black text-white text-[13px] font-semibold shadow-xs transition-all flex items-center gap-2 group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    id="btn-compare"
                    type="button"
                    onClick={handleCompare}
                    disabled={isComparing}
                  >
                    {isComparing ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        <span>Analyzing with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <span>Compare Documents</span>
                        <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Compact Explanation of Verification Scope */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#45464d]">rule</span>
                    <h3 className="text-[15px] font-semibold text-[#0b1c30]">What will be compared</h3>
                  </div>
                  <span className="text-[11px] text-[#45464d]">5 automated audit layers enabled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Pillar 1 */}
                  <div
                    onClick={() => {
                      setSelectedPillar('Prices & Base Rates');
                      setActivePicker('pillar-detail');
                    }}
                    className="bg-white p-4 rounded-lg shadow-xs border border-[#c6c6cd]/30 flex flex-col gap-1 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[18px] text-[#0051d5]">payments</span>
                      <span className="text-[13px] font-semibold">Prices & Base Rates</span>
                    </div>
                    <p className="text-[12px] text-[#45464d]">
                      Checks quoted unit tariffs against billed rates and hidden recurring base shifts.
                    </p>
                  </div>

                  {/* Pillar 2 */}
                  <div
                    onClick={() => {
                      setSelectedPillar('Discounts & Vouchers');
                      setActivePicker('pillar-detail');
                    }}
                    className="bg-white p-4 rounded-lg shadow-xs border border-[#c6c6cd]/30 flex flex-col gap-1 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[18px] text-[#0051d5]">sell</span>
                      <span className="text-[13px] font-semibold">Discounts & Vouchers</span>
                    </div>
                    <p className="text-[12px] text-[#45464d]">
                      Confirms introductory rebates, promo codes, bundled credits, and autopay deductions.
                    </p>
                  </div>

                  {/* Pillar 3 */}
                  <div
                    onClick={() => {
                      setSelectedPillar('Quantities & Usage');
                      setActivePicker('pillar-detail');
                    }}
                    className="bg-white p-4 rounded-lg shadow-xs border border-[#c6c6cd]/30 flex flex-col gap-1 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[18px] text-[#0051d5]">speed</span>
                      <span className="text-[13px] font-semibold">Quantities & Usage</span>
                    </div>
                    <p className="text-[12px] text-[#45464d]">
                      Audits meter reads, data thresholds, bandwidth limits, and excess usage surcharges.
                    </p>
                  </div>

                  {/* Pillar 4 */}
                  <div
                    onClick={() => {
                      setSelectedPillar('Taxes & Fees');
                      setActivePicker('pillar-detail');
                    }}
                    className="bg-white p-4 rounded-lg shadow-xs border border-[#c6c6cd]/30 flex flex-col gap-1 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[18px] text-[#0051d5]">account_balance</span>
                      <span className="text-[13px] font-semibold">Taxes & Fees</span>
                    </div>
                    <p className="text-[12px] text-[#45464d]">
                      Calculates statutory levies, recovery fees, GST/VAT accuracy, and municipal line items.
                    </p>
                  </div>

                  {/* Pillar 5 */}
                  <div
                    onClick={() => {
                      setSelectedPillar('Billing Terms & Cadence');
                      setActivePicker('pillar-detail');
                    }}
                    className="bg-white p-4 rounded-lg shadow-xs border border-[#c6c6cd]/30 flex flex-col gap-1 hover:bg-[#eff4ff]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-[18px] text-[#0051d5]">calendar_month</span>
                      <span className="text-[13px] font-semibold">Billing Terms & Cadence</span>
                    </div>
                    <p className="text-[12px] text-[#45464d]">
                      Verifies cycle lengths, renewal deadlines, grace windows, and mid-cycle proration rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* Demonstration Example Card (Simulated Audit Baseline) */}
              <div className="bg-white rounded-xl p-6 shadow-xs border border-[#c6c6cd]/40 flex flex-col gap-4">
                {/* Demo Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#c6c6cd]/20 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] text-[11px] uppercase tracking-wider font-bold">
                      Demonstration Reference Example
                    </span>
                    <span className="text-[13px] text-[#45464d]">Sample reference dataset for comparison</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#45464d] text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[16px] text-[#0051d5]">science</span>
                    <span>Sample reference dataset #EX-8849</span>
                  </div>
                </div>

                {/* Main Comparison Anatomy Metric Block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#eff4ff]/60 border border-[#c6c6cd]/30">
                  {/* Original Promised */}
                  <div className="flex flex-col gap-1 p-3 bg-white rounded-lg shadow-xs border border-[#c6c6cd]/20">
                    <span className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                      Original Promise (Baseline)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[28px] font-bold text-[#0b1c30] font-mono">₹999</span>
                      <span className="text-[13px] text-[#45464d]">/ month</span>
                    </div>
                    <span className="text-[12px] text-[#45464d]">Quoted Plan Subscription Rate</span>
                  </div>

                  {/* Actual Reality */}
                  <div className="flex flex-col gap-1 p-3 bg-white rounded-lg shadow-xs border border-[#c6c6cd]/20">
                    <span className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                      Delivered Reality (Invoiced)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[28px] font-bold text-[#0b1c30] font-mono">₹1,199</span>
                      <span className="text-[13px] text-[#45464d]">/ month</span>
                    </div>
                    <span className="text-[12px] text-[#45464d]">Statement Cycle Final Charge</span>
                  </div>

                  {/* Net Variance */}
                  <div className="flex flex-col gap-1 p-3 bg-white rounded-lg shadow-xs border border-[#c6c6cd]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
                        Net Variance
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dce9ff] text-[#0b1c30]">
                        Attention Needed
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[28px] font-bold text-[#ba1a1a] font-mono">+₹200</span>
                      <span className="text-[13px] text-[#ba1a1a] font-semibold">(+20.02%)</span>
                    </div>
                    <span className="text-[12px] text-[#45464d]">Missing Discount Offset Detected</span>
                  </div>
                </div>

                {/* Detail Narrative & Context with required Inspect Simulated Breakdown button */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">Context Sample</span>
                    <p className="text-[14px] text-[#45464d] max-w-3xl leading-relaxed">
                      Apex Fiber 300 Mbps Plan — Promotional tier quoted at{' '}
                      <strong className="text-[#0b1c30] font-bold">₹999/mo</strong>, billed at{' '}
                      <strong className="text-[#0b1c30] font-bold">₹1,199</strong> without the applied ₹200 introductory voucher.
                    </p>
                  </div>

                  {/* EXACT xpath: //button[contains(., 'Inspect Simulated Breakdown')] */}
                  <div className="shrink-0">
                    <button
                      onClick={() => {
                        loadAudit('apex');
                        onNavigate('verification-results', 'push');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[13px] font-semibold flex items-center gap-1.5 transition-colors border border-[#c6c6cd]/40 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Inspect Simulated Breakdown</span>
                    </button>
                  </div>
                </div>

                {/* Advisory Clarification Note */}
                <div className="p-4 rounded-lg bg-[#eff4ff] flex items-start gap-3 border border-[#c6c6cd]/30">
                  <span className="material-symbols-outlined text-[#0051d5] text-[20px] shrink-0 mt-0.5">
                    info
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">Important Audit Guidance</span>
                    <p className="text-[12px] text-[#45464d] leading-relaxed">
                      A difference requires review and is not automatically proof of wrongdoing. Variances may stem from unapplied promotions, mid-cycle prorations, or updated local regulatory fees. Always verify line-item breakdowns prior to disputing.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Paste/Edit Text Modal for Promise or Actual */}
      {(activePicker === 'text-input-promise' || activePicker === 'text-input-actual') && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#c6c6cd] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">edit_note</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">
                  {activePicker === 'text-input-promise'
                    ? 'Enter / Paste Original Promise Text'
                    : 'Enter / Paste Actual Invoice Statement Text'}
                </h3>
              </div>
              <button onClick={() => setActivePicker(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#45464d]">
              Paste the text of the offer, promotional flyer, email confirmation, or invoice ledger lines:
            </p>
            <textarea
              className="w-full h-44 p-3 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] text-[13px] font-mono outline-none focus:border-[#0051d5]"
              placeholder="Paste contract terms, promotional rate guarantees, or billed line item amounts..."
              value={customTextDraft}
              onChange={(e) => setCustomTextDraft(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-[#c6c6cd]/20">
              <button
                onClick={() => setActivePicker(null)}
                className="px-4 py-1.5 bg-[#eff4ff] text-[#0b1c30] rounded-lg text-[13px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetDoc: UploadedFileDoc = {
                    name:
                      activePicker === 'text-input-promise'
                        ? 'User_Pasted_Promise_Terms.txt'
                        : 'User_Pasted_Invoice_Statement.txt',
                    size: `${(customTextDraft.length / 1024).toFixed(1)} KB`,
                    text: customTextDraft,
                    fromUserLaptop: true,
                  };
                  if (activePicker === 'text-input-promise') {
                    setPromiseFile(targetDoc);
                  } else {
                    setActualFile(targetDoc);
                  }
                  setActivePicker(null);
                  showToast('Document text saved.');
                }}
                className="px-4 py-1.5 bg-[#131b2e] hover:bg-black text-white rounded-lg text-[13px] font-semibold cursor-pointer"
              >
                Save Document Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vault Picker Modal */}
      {activePicker === 'promise-vault' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#c6c6cd] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">folder_special</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Select Baseline from Vault</h3>
              </div>
              <button onClick={() => setActivePicker(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {documents
                .filter((d) => d.type === 'contract' || d.type === 'receipt')
                .map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      const previewText = VAULT_DOCUMENT_PREVIEWS[doc.name] || '';
                      setPromiseFile({
                        name: doc.name,
                        size: doc.size,
                        text: previewText,
                      });
                      setActivePicker(null);
                      showToast(`Selected ${doc.name} as commitment baseline.`);
                    }}
                    className="p-3 rounded-lg border border-[#c6c6cd]/40 hover:bg-[#eff4ff] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-[13px] text-[#0b1c30]">{doc.name}</div>
                      <div className="text-[11px] text-[#45464d]">{doc.merchant} • {doc.date}</div>
                    </div>
                    <span className="text-[12px] text-[#0051d5] font-bold">Select</span>
                  </div>
                ))}
            </div>
            <div className="flex justify-end pt-2 border-t border-[#c6c6cd]/20">
              <button onClick={() => setActivePicker(null)} className="px-4 py-1.5 bg-[#eff4ff] text-[#0b1c30] rounded-lg text-[13px] font-semibold cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Utility Portal Modal */}
      {activePicker === 'portal-connect' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#c6c6cd] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">sync_alt</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Fetch Recent Statement</h3>
              </div>
              <button onClick={() => setActivePicker(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#45464d]">
              Select a provider statement to load into the AI audit engine:
            </p>
            <div className="space-y-2">
              {[
                { name: 'Apex Fiber Broadband', bill: 'Apex_Statement_Nov2025.pdf', date: 'Nov 01, 2025' },
                { name: 'CloudFiber Broadband', bill: 'CloudFiber_Nov2025_Bill.pdf', date: 'Nov 04, 2025' },
                { name: 'Apex Wireless Family Care', bill: 'Apex_Wireless_Statement_1101.pdf', date: 'Nov 02, 2025' },
              ].map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const previewText = VAULT_DOCUMENT_PREVIEWS[p.bill] || '';
                    setActualFile({
                      name: p.bill,
                      size: '1.14 MB',
                      text: previewText,
                    });
                    setActivePicker(null);
                    showToast(`Synced ${p.bill} from ${p.name}`);
                  }}
                  className="p-3 rounded-lg border border-[#c6c6cd]/40 hover:bg-[#eff4ff] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-semibold text-[13px] text-[#0b1c30]">{p.name}</div>
                    <div className="text-[11px] text-[#45464d]">Statement: {p.date}</div>
                  </div>
                  <span className="text-[12px] text-[#0051d5] font-bold">Import</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Batch Comparison Modal */}
      {activePicker === 'batch' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#c6c6cd] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0051d5]">layers</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Batch Audit Pipeline</h3>
              </div>
              <button onClick={() => setActivePicker(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#45464d]">
              Queue multiple invoice statements against all archived contracts simultaneously:
            </p>
            <div className="p-3 bg-[#eff4ff] rounded-lg text-[12px] space-y-1">
              <div>• 2 Statements ready for multimodal Gemini extraction</div>
              <div>• Automated OCR & clause verification</div>
              <div>• Direct reconciliation across tax & fee schedules</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setActivePicker(null)} className="px-4 py-1.5 bg-[#eff4ff] text-[#0b1c30] rounded-lg text-[13px] font-semibold cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => {
                  setActivePicker(null);
                  handleCompare();
                }}
                className="px-4 py-1.5 bg-[#131b2e] hover:bg-black text-white rounded-lg text-[13px] font-semibold cursor-pointer"
              >
                Execute Batch Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pillar Detail Info Modal */}
      {activePicker === 'pillar-detail' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#c6c6cd] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-3">
              <h3 className="text-[16px] font-bold text-[#0b1c30]">{selectedPillar}</h3>
              <button onClick={() => setActivePicker(null)} className="p-1 hover:bg-[#eff4ff] rounded text-[#45464d] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-[#45464d] leading-relaxed">
              Our audit protocol verifies this pillar by cross-referencing your agreed schedule with the exact line item and tax ledger in the invoiced realization. Any mathematical discrepancy above $0.01 is automatically surfaced with the specific contract paragraph citation.
            </p>
            <div className="flex justify-end pt-2 border-t border-[#c6c6cd]/20">
              <button onClick={() => setActivePicker(null)} className="px-4 py-1.5 bg-[#131b2e] text-white text-[13px] font-semibold rounded-lg cursor-pointer">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
