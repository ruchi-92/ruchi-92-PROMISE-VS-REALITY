import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Support up to 25MB payloads for uploaded documents (images, PDFs, text)
app.use(express.json({ limit: '25mb' }));

// Server-side initialization of Gemini API with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface FilePayload {
  name: string;
  size?: string;
  mimeType?: string;
  base64Data?: string; // raw base64 or dataURL
  text?: string;
}

// Helper to strip data URL prefix if present
function cleanBase64(dataUrlOrBase64: string): { data: string; mimeType?: string } {
  const match = dataUrlOrBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { data: dataUrlOrBase64 };
}

// POST /api/analyze-bill
app.post('/api/analyze-bill', async (req, res) => {
  try {
    const { promiseDoc, realityDoc, userNotes } = req.body as {
      promiseDoc?: FilePayload;
      realityDoc?: FilePayload;
      userNotes?: string;
    };

    if (!promiseDoc && !realityDoc) {
      return res.status(400).json({
        error: 'Please provide at least one document or agreement text for verification.',
      });
    }

    const parts: any[] = [];

    // System instruction prompt
    const instructions = `You are a bank-grade consumer commitment verification and billing audit engine ("PROMISE vs REALITY").
Your mission is to compare an original commitment or baseline promise (Offer, Quote, Ad, Terms, Contract) against an actual delivered outcome or billed reality (Invoice, Statement, Receipt, Renewal).

AUDIT PRINCIPLES:
1. DISTINGUISH ROLES:
   - Identify which document is the "Original Promise" and which is the "Actual Outcome / Invoice".
   - If the user inverted the roles (e.g. provided an invoice as the promise and contract as reality), automatically detect and reconcile them in the returned data, noting this in "roleInvertedWarning".
2. EXTRACT PRECISE DATA:
   - Extract prices, recurring rates, discounts, promotional vouchers, billing cadence, quantities, statutory taxes, and refund conditions.
   - Cite EXACT text and clauses from the documents. DO NOT invent missing clauses or numbers.
3. OBJECTIVE COMPARISON & DISCREPANCY DETECTION:
   - Compare the documented commitment against the billed reality.
   - Detect real discrepancies (e.g., omitted promotional credits, price hikes exceeding contracted lock-ins, unexpected fees).
   - If the documents agree or if any variance is legitimately explained by the terms (e.g. promotional period ended as stipulated, statutory tax pass-through, user-approved addon), set hasDiscrepancy: false, status: 'verified', and explain why clearly.
   - If key information is missing to reach a definitive conclusion, set status: 'needs-review' and document the ambiguity.
4. CALCULATIONS:
   - Calculate numerical differences only when sufficient numerical data is present.
   - If numbers are absent, set varianceAmount to 0 or null and explain in descriptions.
   - Determine the correct currency symbol (e.g. $, ₹, €, £) based on the documents. Default to '$' if not specified.
5. UNCERTAINTIES & MISSING INFORMATION:
   - Explicitly list items under "missingInformation" (e.g. "Invoice does not itemize statutory taxes", "Contract does not specify expiration date").
   - Explicitly list ambiguous terms under "ambiguousTerms".
6. DISPUTE / INQUIRY DRAFT:
   - Draft a polite, clear, professional consumer clarification or inquiry letter referencing the exact document names, invoice numbers, specific sections, and amounts.

Return your response strictly as valid JSON adhering to the specified schema.`;

    // Attach Document 1: Original Promise
    if (promiseDoc) {
      parts.push({
        text: `--- SOURCE 01: ORIGINAL PROMISE / BASELINE COMMITMENT ---\nDocument Name: ${promiseDoc.name || 'Original Promise Document'}\n`,
      });

      if (promiseDoc.text) {
        parts.push({
          text: `Extracted / Provided Text for Original Promise:\n"""\n${promiseDoc.text}\n"""`,
        });
      }

      if (promiseDoc.base64Data) {
        const { data, mimeType } = cleanBase64(promiseDoc.base64Data);
        const resolvedMime = promiseDoc.mimeType || mimeType || 'image/png';
        parts.push({
          inlineData: {
            mimeType: resolvedMime,
            data: data,
          },
        });
      }
    } else {
      parts.push({
        text: `--- SOURCE 01: ORIGINAL PROMISE ---\n[Notice: No document explicitly uploaded for Original Promise. Extract baseline commitments from context or mark missing.]\n`,
      });
    }

    // Attach Document 2: Actual Outcome
    if (realityDoc) {
      parts.push({
        text: `\n--- SOURCE 02: ACTUAL OUTCOME / BILLED REALITY ---\nDocument Name: ${realityDoc.name || 'Actual Outcome Document'}\n`,
      });

      if (realityDoc.text) {
        parts.push({
          text: `Extracted / Provided Text for Actual Outcome:\n"""\n${realityDoc.text}\n"""`,
        });
      }

      if (realityDoc.base64Data) {
        const { data, mimeType } = cleanBase64(realityDoc.base64Data);
        const resolvedMime = realityDoc.mimeType || mimeType || 'image/png';
        parts.push({
          inlineData: {
            mimeType: resolvedMime,
            data: data,
          },
        });
      }
    } else {
      parts.push({
        text: `\n--- SOURCE 02: ACTUAL OUTCOME ---\n[Notice: No document explicitly uploaded for Actual Outcome. Extract billed charges from context or mark missing.]\n`,
      });
    }

    if (userNotes) {
      parts.push({
        text: `\nAdditional Context / User Clarification:\n"""\n${userNotes}\n"""`,
      });
    }

    parts.push({
      text: `\nAnalyze now. Return JSON with the exact following structure:
{
  "merchant": "Merchant or Service Provider Name",
  "category": "Broadband / Mobile / SaaS / Utility / Gym / Insurance / Other",
  "invoiceNumber": "Invoice or Statement Reference (or N/A)",
  "contractRef": "Contract Reference or Plan Title (or N/A)",
  "title": "Clear concise summary of the verification outcome",
  "description": "2-3 sentences explaining the factual comparison and findings",
  "hasDiscrepancy": true, // or false if terms match or are verified
  "status": "discrepancy", // "discrepancy" | "verified" | "needs-review"
  "statusLabel": "Potential Discrepancy Detected" | "Verified Terms Match" | "Information Incomplete",
  "billedAmount": 1199.00, // numerical, or 0 if unstated
  "promisedAmount": 999.00, // numerical, or 0 if unstated
  "varianceAmount": 200.00, // difference (billed - promised)
  "currency": "USD" | "INR" | "EUR" | "GBP",
  "currencySymbol": "$" | "₹" | "€" | "£",
  "dateBilled": "e.g. Nov 01, 2025",
  "promisedTerms": "e.g. Locked promotional tier for 12 months",
  "confidenceScore": 98.5, // 0-100 score of confidence based on evidence quality
  "billingPeriod": "e.g. Nov 01 - Nov 30, 2025",
  "projectedAnnualImpact": 2400.00, // annual variance impact
  "promiseDocument": {
    "name": "Filename or title",
    "date": "Document date",
    "hash": "SHA-256 reference or doc ID",
    "clauseNumber": "e.g. Section 3.1",
    "clauseTitle": "Clause or Heading",
    "clauseText": "Verbatim quote of the key promise or rate commitment",
    "ocrMatch": "Source citation / location in document"
  },
  "realityDocument": {
    "name": "Filename or title",
    "invoiceRef": "Statement or line ID",
    "dueDate": "Due date or bill date",
    "itemNumber": "Line item or charge header",
    "itemTitle": "Billed line description",
    "itemText": "Verbatim quote of the billed line item or total",
    "discrepancyNote": "Explanation of variance or 'Verified: Billed charge aligns with contracted commitment.'"
  },
  "ledger": [
    {
      "description": "Item description",
      "subtext": "Details and clause cross-reference",
      "promisedRate": "Formatted rate string e.g. $65.00",
      "billedAmount": "Formatted billed string e.g. $89.99",
      "variance": "Formatted variance string e.g. +$24.99",
      "status": "Verified Match" | "Potential Discrepancy"
    }
  ],
  "missingInformation": ["List any key missing details, unstated terms, or unverified fees"],
  "ambiguousTerms": ["List any unclear, subjective, or ambiguous clauses found"],
  "uncertaintyNotes": "Any caveat or explanation regarding limits of available evidence",
  "roleInvertedWarning": null, // or warning string if user uploaded in reverse
  "draftInquiry": "Full text of professional consumer clarification request email ready to send"
}`,
    });

    // Call candidate models with graceful fallback for high-demand spikes
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let outputText: string | undefined;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        console.log(`[AuditEngine] Attempting document verification with: ${model}`);
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            systemInstruction: instructions,
            responseMimeType: 'application/json',
            temperature: 0.1,
            ...(model.startsWith('gemini-3') ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
          },
        });

        if (response.text) {
          outputText = response.text;
          console.log(`[AuditEngine] Verification succeeded using ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`[AuditEngine] Model ${model} encountered error, trying next candidate:`, err?.message || err);
        lastError = err;
      }
    }

    if (!outputText) {
      throw lastError || new Error('Verification engine was unable to generate an audit result.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(outputText.trim());
    } catch (parseErr) {
      // If there are markdown backticks in output, strip them
      const cleaned = outputText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Assign a unique reference number if not provided
    if (!parsedResult.referenceNumber) {
      parsedResult.referenceNumber = `VR-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!parsedResult.id) {
      parsedResult.id = `audit-${Date.now()}`;
    }

    return res.json({
      success: true,
      audit: parsedResult,
    });
  } catch (err: any) {
    console.error('Error during AI bill analysis:', err);
    return res.status(500).json({
      error: err?.message || 'Verification engine encountered an error while processing documents.',
    });
  }
});

// Setup Vite development server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
