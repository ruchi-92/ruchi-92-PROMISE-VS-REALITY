export type Screen = 'login' | 'overview' | 'verify-a-bill' | 'verification-results';

export type TransitionType = 'push' | 'push_back' | 'none';

export interface AuditRecord {
  id: string;
  referenceNumber: string;
  merchant: string;
  category: string;
  invoiceNumber: string;
  contractRef: string;
  title: string;
  description: string;
  billedAmount: number;
  promisedAmount: number;
  varianceAmount: number;
  currency: string;
  currencySymbol: string;
  dateBilled: string;
  promisedTerms: string;
  confidenceScore: number;
  billingPeriod: string;
  projectedAnnualImpact: number;
  status: 'discrepancy' | 'needs-review' | 'verified';
  statusLabel: string;
  promiseDocument: {
    name: string;
    date: string;
    hash: string;
    clauseNumber: string;
    clauseTitle: string;
    clauseText: string;
    ocrMatch: string;
  };
  realityDocument: {
    name: string;
    invoiceRef: string;
    dueDate: string;
    itemNumber: string;
    itemTitle: string;
    itemText: string;
    discrepancyNote: string;
  };
  ledger: Array<{
    description: string;
    subtext: string;
    promisedRate: string;
    billedAmount: string;
    variance: string;
    status: 'Verified Match' | 'Potential Discrepancy';
    isTotal?: boolean;
  }>;
  draftInquiry: string;
  hasDiscrepancy?: boolean;
  missingInformation?: string[];
  ambiguousTerms?: string[];
  uncertaintyNotes?: string;
  roleInvertedWarning?: string | null;
  isSimulated?: boolean;
}

export interface UploadedFileDoc {
  name: string;
  size: string;
  mimeType?: string;
  base64Data?: string;
  text?: string;
  fromUserLaptop?: boolean;
}

export interface VaultDocument {
  id: string;
  name: string;
  merchant: string;
  category: string;
  date: string;
  type: 'contract' | 'statement' | 'receipt';
  size: string;
  status: 'Match Verified' | 'Needs Review' | 'Discrepancy' | 'Rate Locked' | 'Terms Match';
  variance?: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  category: string;
  rate: string;
  rateNumeric: number;
  renewsOn: string;
  contractStatus: string;
  badgeText: string;
  badgeType: 'verified' | 'warning' | 'neutral';
  cycle: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}
