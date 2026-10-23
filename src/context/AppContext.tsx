import React, { createContext, useContext, useState, useEffect } from 'react';
import { Screen, TransitionType, AuditRecord, VaultDocument, SubscriptionItem, NotificationItem, UploadedFileDoc } from '../types.ts';

export const VAULT_DOCUMENT_PREVIEWS: Record<string, string> = {
  'Apex_Fiber_Agreement_Aug2025.pdf': `APEX FIBER BROADBAND - RESIDENTIAL SERVICE AGREEMENT
Customer Account: APX-44919
Executed Date: August 14, 2025
Service Plan: Apex Fiber 300 Mbps Ultra-Speed Tier
Section 3.1 Promotional Tier Commitment:
Promotional Tier 300 Mbps locked at ₹999/month for 12 billing cycles from activation date (inclusive of ₹200 autopay and paperless billing promotional credit discount). Regular rack rate of ₹1,199/month applies after month 12.
Section 3.2 Surcharges & Taxes:
All statutory taxes and levies (GST) are included in the promotional tariff. No separate modem rental fees for the initial 12 months.`,

  'Apex_Statement_Nov2025.pdf': `APEX FIBER BROADBAND - MONTHLY BILLING STATEMENT
Invoice Number: #INV-9942
Account: APX-44919
Billing Period: Nov 01, 2025 - Nov 30, 2025
Due Date: Nov 20, 2025
Charges Summary:
- Base Service Item 101: Apex Fiber 300 Mbps standard service rate for cycle Nov 01 to Nov 30, 2025: ₹1,199.00
- Taxes & Statutory Levies (GST 18%): Included in base tariff (₹0.00 extra)
- Promotional Voucher / Autopay Credit: [Line Item Omitted / ₹0.00]
Total Payable: ₹1,199.00`,

  'CloudFiber_PromoContract_2024.pdf': `CLOUDFIBER BROADBAND - 24-MONTH PROMOTIONAL GUARANTEE
Agreement Reference: CF-88219
Customer Account: CLD-77102
Execution Date: January 15, 2024
Section 1.2 Rate Lock Commitment:
Price locked at $65.00/month through January 31, 2026 across standard gigabit internet tier (standard rack rate $89.99/mo minus monthly $24.99 promotional voucher discount).
Section 1.4 Fees & Surcharges:
Regulatory Recovery & E-911 included in flat bundle rate. Unlimited data with no bandwidth overage fees.`,

  'CloudFiber_Nov2025_Bill.pdf': `CLOUDFIBER BROADBAND - OFFICIAL BILLING STATEMENT
Invoice Number: #INV-9942
Billing Date: Nov 04, 2025
Due Date: Nov 24, 2025
Account: CLD-77102
Billing Cycle: Nov 01 – Nov 30, 2025
Service Charges:
- Line Item 01: Fiber Gig Rate (Standard recurring service line): $89.99
- Promotional Voucher Discount: $0.00 (Voucher expired or removed)
- Regulatory Recovery & E-911: $0.00 (Included)
Total Amount Due: $89.99`,

  'StreamPulse_Annual_Receipt.pdf': `STREAMPULSE PREMIER - ANNUAL RENEWAL RECEIPT
Receipt Number: #SP-88319
Date: Oct 28, 2025
Account: User-8821
Plan: StreamPulse Premier 4K UHD Multi-Screen
Commitment: Rate guaranteed locked at $19.99/month through October 2026.
Billed Charge: $19.99
Taxes & Fees: Included
Status: Paid in Full ($19.99). Rate strictly matches agreed contract terms.`,

  'Apex_Wireless_Statement_1101.pdf': `APEX MOBILE CARE - WIRELESS BILLING STATEMENT
Account: APX-9941-W
Statement Date: Nov 02, 2025
Service: Apex Wireless Family Care (3 Lines)
Promised Base Rate: $125.00/month with Paperless Autopay ($10 discount per account).
Billed Charges:
- Unlimited Family Plan Base: $125.00
- Administrative Regulatory Fee: $20.00
- Autopay Discount: Not applied (Paperless billing disabled)
Total Billed: $145.00 ($20.00 variance from baseline quote).`,

  'Nordic_Gym_Agreement_2024.pdf': `NORDIC HEALTH & FITNESS - MEMBERSHIP AGREEMENT
Member ID: NH-9921
Agreement Date: Oct 15, 2024
Commitment: All-access fitness membership fixed at $65.00/month with 30-day cancellation notice required. Annual enhancement fee waived.
Monthly Dues: $65.00.`,
};

const initialAuditApexFiber: AuditRecord = {
  id: 'apex-fiber-vr-8849',
  referenceNumber: 'VR-8849',
  merchant: 'Apex Fiber Broadband',
  category: 'Home Broadband & Fiber',
  invoiceNumber: 'INV-9942',
  contractRef: 'CF-88219 (Locked)',
  title: 'Promotional rate guarantee exceeded on monthly statement',
  description: 'Deterministic reconciliation comparing original commitment terms against billed invoice data.',
  billedAmount: 1199,
  promisedAmount: 999,
  varianceAmount: 200,
  currency: 'INR',
  currencySymbol: '₹',
  dateBilled: 'Nov 01, 2025',
  promisedTerms: 'Locked at ₹999/mo for 12 billing cycles (Autopay included)',
  confidenceScore: 99.4,
  billingPeriod: 'Nov 01 – Nov 30, 2025',
  projectedAnnualImpact: 2400,
  status: 'discrepancy',
  statusLabel: 'Potential Discrepancy Detected',
  isSimulated: true,
  hasDiscrepancy: true,
  missingInformation: [
    'Monthly invoice statement omitted the itemized promotional voucher credit line item.',
  ],
  ambiguousTerms: [
    'Clause 3.1 states autopay discount applies "subject to continuous active status" without specifying if temporary bank delay revokes it permanently.',
  ],
  promiseDocument: {
    name: 'Apex_Fiber_Agreement_Aug2025.pdf',
    date: 'Aug 14, 2025',
    hash: 'SHA-256 c48a94b8100e4fb879d71c18e388152c',
    clauseNumber: 'Section 3.1',
    clauseTitle: 'Promotional Tier Commitment',
    clauseText: 'Promotional Tier 300 Mbps locked at ₹999/month for 12 billing cycles from activation date.',
    ocrMatch: 'Direct OCR Match (Page 2, Paragraph 4)',
  },
  realityDocument: {
    name: 'Apex_Statement_Nov2025.pdf',
    invoiceRef: '#INV-9942',
    dueDate: 'Nov 20, 2025',
    itemNumber: 'Base Service Item 101',
    itemTitle: 'Apex Fiber 300 Mbps standard service rate',
    itemText: 'Apex Fiber 300 Mbps standard service rate for cycle Nov 01 to Nov 30, 2025.',
    discrepancyNote: "Expected line item 'Promotional Credit (-₹200)' is absent from this cycle's credits and adjustment ledger.",
  },
  ledger: [
    {
      description: 'Base Tier 300 Mbps Plan',
      subtext: 'Standard fiber monthly subscription rack price',
      promisedRate: '₹1,199.00',
      billedAmount: '₹1,199.00',
      variance: '₹0.00',
      status: 'Verified Match',
    },
    {
      description: 'Promotional Lock-in Voucher (Cycle 4/12)',
      subtext: 'Clause 3.1 Autopay promotional discount rebate omitted',
      promisedRate: '-₹200.00',
      billedAmount: '₹0.00 (Missing)',
      variance: '+₹200.00',
      status: 'Potential Discrepancy',
    },
    {
      description: 'Taxes & Statutory Levies (GST)',
      subtext: 'Inclusive tariff agreement; zero statutory surcharge added',
      promisedRate: 'Inclusive',
      billedAmount: '₹0.00 (Incl.)',
      variance: '₹0.00',
      status: 'Verified Match',
    },
  ],
  draftInquiry: `Subject: Request for Clarification — Account #APX-44919 Invoice Variance #INV-9942

Dear Apex Fiber Billing Support Team,

I am writing regarding my recent invoice #INV-9942 for the billing cycle Nov 01, 2025 – Nov 30, 2025, which reflects a payable total of ₹1,199.00.

According to my service agreement executed on August 14, 2025 (Section 3.1, Promotional Tier 300 Mbps), my agreed rate is locked at ₹999.00 per month inclusive of the ₹200 autopay promotional discount for 12 billing cycles. The current statement does not appear to reflect this promotional credit.

Could you kindly review this charge and confirm if the ₹200 discount will be credited in the upcoming statement or if an adjustment note can be issued?

Thank you for your assistance.

Audit Evidence Reference: PROMISE vs REALITY Verification #VR-8849`,
};

const initialAuditCloudFiber: AuditRecord = {
  id: 'cloudfiber-inv-9942',
  referenceNumber: 'VR-9942',
  merchant: 'CloudFiber Broadband',
  category: 'Home Broadband & Fiber',
  invoiceNumber: 'INV-9942',
  contractRef: 'CF-88219 (Locked)',
  title: 'Subscription renewal rate exceeded promotional lock-in',
  description: 'Promotional guarantee contract submitted in Jan 2024 states price lock through Jan 2026.',
  billedAmount: 89.99,
  promisedAmount: 65.0,
  varianceAmount: 24.99,
  currency: 'USD',
  currencySymbol: '$',
  dateBilled: 'Nov 04, 2025',
  promisedTerms: 'Lock until Jan 2026',
  confidenceScore: 99.8,
  billingPeriod: 'Nov 01 – Nov 30, 2025',
  projectedAnnualImpact: 299.88,
  status: 'discrepancy',
  statusLabel: 'Potential Discrepancy Detected',
  isSimulated: true,
  hasDiscrepancy: true,
  missingInformation: [
    'Notice of promotional voucher termination was not attached to invoice #INV-9942.',
  ],
  ambiguousTerms: [
    'Section 1.2 guarantees $65/mo through Jan 2026; however general T&Cs note rates subject to change after 12 months without clarifying rider precedence.',
  ],
  promiseDocument: {
    name: 'CloudFiber_PromoContract_2024.pdf',
    date: 'Jan 15, 2024',
    hash: 'SHA-256 e81b99a01...392d',
    clauseNumber: 'Section 1.2',
    clauseTitle: '24-Month Promotional Guarantee',
    clauseText: 'Price locked at $65.00/mo through January 31, 2026 across standard gigabit internet tier.',
    ocrMatch: 'Direct Match (Contract Page 1)',
  },
  realityDocument: {
    name: 'CloudFiber_Nov2025_Bill.pdf',
    invoiceRef: '#INV-9942',
    dueDate: 'Nov 24, 2025',
    itemNumber: 'Service Line 01',
    itemTitle: 'Fiber Gig Rate',
    itemText: 'Standard recurring service line without monthly $24.99 voucher discount.',
    discrepancyNote: 'Voucher promotional credit removed 2 months prior to contracted lock-in date.',
  },
  ledger: [
    {
      description: 'Standard Fiber 1Gbps Plan',
      subtext: 'Rack tier rate',
      promisedRate: '$89.99',
      billedAmount: '$89.99',
      variance: '$0.00',
      status: 'Verified Match',
    },
    {
      description: 'Promotional Voucher Discount (Month 22/24)',
      subtext: 'Promotional credit line item omitted',
      promisedRate: '-$24.99',
      billedAmount: '$0.00 (Missing)',
      variance: '+$24.99',
      status: 'Potential Discrepancy',
    },
    {
      description: 'Regulatory Recovery & E-911',
      subtext: 'Included in flat bundle rate',
      promisedRate: 'Included',
      billedAmount: '$0.00',
      variance: '$0.00',
      status: 'Verified Match',
    },
  ],
  draftInquiry: `Subject: Notice of Billing Discrepancy — CloudFiber Invoice #INV-9942

Dear CloudFiber Billing Resolution Team,

I am writing regarding my recent billing invoice #INV-9942 issued on November 04, 2025, which reflects a billed rate of $89.99/mo.

Under my 24-month promotional guarantee contract executed in January 2024 (Contract #CF-88219), my monthly rate is locked at $65.00/mo through January 2026. The promotional voucher credit of $24.99 was prematurely removed on this recent invoice.

Please adjust the invoice to reflect the contracted $65.00/mo rate and credit the overcharged variance.

Audit Evidence Reference: PROMISE vs REALITY Verification #VR-9942`,
};

const initialDocuments: VaultDocument[] = [
  { id: '1', name: 'CloudFiber_Nov2025_Bill.pdf', merchant: 'CloudFiber Broadband', category: 'Utility / Internet', date: 'Nov 05, 2025', type: 'statement', size: '1.2 MB', status: 'Discrepancy', variance: '+$24.99/mo' },
  { id: '2', name: 'Apex_Wireless_Statement_1101.pdf', merchant: 'Apex Mobile Care', category: 'Mobile Service', date: 'Nov 02, 2025', type: 'statement', size: '940 KB', status: 'Needs Review', variance: '+$20.00' },
  { id: '3', name: 'StreamPulse_Annual_Receipt.pdf', merchant: 'StreamPulse Premier', category: 'Digital Media', date: 'Oct 28, 2025', type: 'receipt', size: '420 KB', status: 'Match Verified', variance: '$19.99' },
  { id: '4', name: 'Electric_Tariff_Schedule_2025.pdf', merchant: 'Regional Power Grid', category: 'Fixed Energy Tariff', date: 'Oct 20, 2025', type: 'contract', size: '2.8 MB', status: 'Rate Locked', variance: '$0.142/kWh' },
  { id: '5', name: 'Nordic_Gym_Agreement_2024.pdf', merchant: 'Nordic Health & Fitness', category: 'Service Contract', date: 'Oct 15, 2025', type: 'contract', size: '1.5 MB', status: 'Terms Match', variance: '$65.00' },
  { id: '6', name: 'Apex_Fiber_Agreement_Aug2025.pdf', merchant: 'Apex Fiber Broadband', category: 'Broadband Contract', date: 'Aug 14, 2025', type: 'contract', size: '1.4 MB', status: 'Terms Match' },
  { id: '7', name: 'CodeFlow_Team_License_2025.pdf', merchant: 'CodeFlow Technologies', category: 'SaaS Software', date: 'Dec 15, 2024', type: 'contract', size: '890 KB', status: 'Rate Locked' },
  { id: '8', name: 'Metro_Health_Club_Contract.pdf', merchant: 'Metro Health Club', category: 'Gym & Wellness', date: 'Jan 01, 2025', type: 'contract', size: '1.1 MB', status: 'Terms Match' },
  { id: '9', name: 'Apex_Cloud_Storage_2TB_Terms.pdf', merchant: 'Apex Cloud Solutions', category: 'Cloud Infrastructure', date: 'Nov 24, 2024', type: 'contract', size: '640 KB', status: 'Needs Review' },
  { id: '10', name: 'Home_Insurance_Policy_2025.pdf', merchant: 'Summit Mutual', category: 'Property Insurance', date: 'May 10, 2025', type: 'contract', size: '3.4 MB', status: 'Match Verified' },
];

const initialSubscriptions: SubscriptionItem[] = [
  { id: 'sub-1', name: 'StreamPulse Premier', category: 'Entertainment & Streaming', rate: '$19.99/mo', rateNumeric: 19.99, renewsOn: 'Nov 18, 2025', contractStatus: 'Annual lock guarantee active', badgeText: 'Verified Rate Protection', badgeType: 'verified', cycle: 'Monthly' },
  { id: 'sub-2', name: 'Apex Cloud Backup 2TB', category: 'Cloud Storage & Computing', rate: '$9.99/mo', rateNumeric: 9.99, renewsOn: 'Nov 24, 2025', contractStatus: 'Introductory rate expires next cycle', badgeText: 'Rate scheduled to adjust to $14.99/mo', badgeType: 'warning', cycle: 'Monthly' },
  { id: 'sub-3', name: 'Metro Health Club', category: 'Fitness & Health', rate: '$65.00/mo', rateNumeric: 65.0, renewsOn: 'Dec 01, 2025', contractStatus: 'Month-to-month agreement (30-day notice)', badgeText: 'Notice Required', badgeType: 'neutral', cycle: 'Monthly' },
  { id: 'sub-4', name: 'CodeFlow Team Pro', category: 'Developer Tools & SaaS', rate: '$24.00/mo', rateNumeric: 24.0, renewsOn: 'Dec 15, 2025', contractStatus: 'Annual seat commitment (12 seats locked)', badgeText: 'Locked Contract Terms', badgeType: 'verified', cycle: 'Monthly' },
  { id: 'sub-5', name: 'CloudFiber Gigabit Fiber', category: 'Home Internet', rate: '$65.00/mo', rateNumeric: 65.0, renewsOn: 'Jan 15, 2026', contractStatus: '24-Month Promotional Lock-in', badgeText: 'Discrepancy Pending', badgeType: 'warning', cycle: 'Monthly' },
  { id: 'sub-6', name: 'Apex Wireless Family Care', category: 'Mobile Telephony', rate: '$145.00/mo', rateNumeric: 145.0, renewsOn: 'Dec 01, 2025', contractStatus: 'Paperless Autopay tier ($10/line)', badgeText: 'Audit In Progress', badgeType: 'warning', cycle: 'Monthly' },
  { id: 'sub-7', name: 'CyberShield Endpoint Security', category: 'Security & Antivirus', rate: '$8.50/mo', rateNumeric: 8.5, renewsOn: 'Feb 10, 2026', contractStatus: 'Enterprise device license', badgeText: 'Locked Rate', badgeType: 'verified', cycle: 'Annual' },
  { id: 'sub-8', name: 'DesignPro Studio Cloud', category: 'Creative Tools', rate: '$32.00/mo', rateNumeric: 32.0, renewsOn: 'Mar 01, 2026', contractStatus: 'Multi-seat commercial terms', badgeText: 'Verified Rate', badgeType: 'verified', cycle: 'Monthly' },
];

const initialNotifications: NotificationItem[] = [
  { id: 'notif-1', title: 'Potential Rate Increase Detected', description: 'CloudFiber invoice #INV-9942 omitted promotional voucher credit (+$24.99).', time: '10m ago', read: false, type: 'alert' },
  { id: 'notif-2', title: 'Autopay Discount Action Needed', description: 'Apex Mobile statement Nov 01 did not apply expected $20.00 autopay credit.', time: '1h ago', read: false, type: 'alert' },
  { id: 'notif-3', title: 'Upcoming Contract Expiry Window', description: 'Apex Cloud Backup introductory promotional window closes in 32 days.', time: '1d ago', read: false, type: 'info' },
];

export interface AppContextType {
  currentScreen: Screen;
  transitionType: TransitionType;
  navigate: (screen: Screen, transition?: TransitionType) => void;
  activeAudit: AuditRecord;
  setActiveAudit: (audit: AuditRecord) => void;
  loadAudit: (auditId: 'apex' | 'cloudfiber') => void;
  documents: VaultDocument[];
  addDocument: (doc: Omit<VaultDocument, 'id'>) => void;
  subscriptions: SubscriptionItem[];
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  promiseFile: UploadedFileDoc | null;
  setPromiseFile: (file: UploadedFileDoc | null) => void;
  actualFile: UploadedFileDoc | null;
  setActualFile: (file: UploadedFileDoc | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [activeAudit, setActiveAudit] = useState<AuditRecord>(initialAuditApexFiber);
  const [documents, setDocuments] = useState<VaultDocument[]>(initialDocuments);
  const [subscriptions] = useState<SubscriptionItem[]>(initialSubscriptions);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [promiseFile, setPromiseFile] = useState<UploadedFileDoc | null>({
    name: 'Apex_Fiber_Agreement_Aug2025.pdf',
    size: '1.42 MB',
    text: VAULT_DOCUMENT_PREVIEWS['Apex_Fiber_Agreement_Aug2025.pdf'],
  });
  const [actualFile, setActualFile] = useState<UploadedFileDoc | null>({
    name: 'Apex_Statement_Nov2025.pdf',
    size: '890 KB',
    text: VAULT_DOCUMENT_PREVIEWS['Apex_Statement_Nov2025.pdf'],
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigate = (screen: Screen, transition: TransitionType = 'none') => {
    setTransitionType(transition);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadAudit = (auditId: 'apex' | 'cloudfiber') => {
    if (auditId === 'cloudfiber') {
      setActiveAudit(initialAuditCloudFiber);
    } else {
      setActiveAudit(initialAuditApexFiber);
    }
  };

  const addDocument = (doc: Omit<VaultDocument, 'id'>) => {
    const newDoc: VaultDocument = {
      ...doc,
      id: String(Date.now()),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Uploaded and indexed ${doc.name} into vault.`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Keyboard shortcut listener for ⌘K or Ctrl+K to toggle search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        transitionType,
        navigate,
        activeAudit,
        setActiveAudit,
        loadAudit,
        documents,
        addDocument,
        subscriptions,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsRead,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        activeModal,
        setActiveModal,
        toastMessage,
        showToast,
        promiseFile,
        setPromiseFile,
        actualFile,
        setActualFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
