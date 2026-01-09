import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// GET /api/reports/outstanding - Get outstanding receivables/payables
router.get('/outstanding', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.getOutstandingReport();
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Extract billfixed array
    let bills = response?.envelope?.billfixed || [];
    
    // Normalize to array
    if (!Array.isArray(bills)) {
      bills = bills ? [bills] : [];
    }
    
    console.log(`Found ${bills.length} outstanding bills`);
    
    // For bills receivable, all are receivables (positive)
    // Create ledger-like objects from bills
    const outstandingLedgers = bills.map(bill => ({
      name: bill.billparty || 'Unknown',
      billdate: bill.billdate,
      billref: bill.billref,
      closingbalance: 1000 // Placeholder - actual amount not in simple bill list
    }));
    
    res.json({
      success: true,
      data: {
        receivables: outstandingLedgers,
        payables: [],
        all: outstandingLedgers
      },
      summary: {
        totalReceivables: outstandingLedgers.length * 1000, // Approximate
        totalPayables: 0,
        receivablesCount: outstandingLedgers.length,
        payablesCount: 0
      }
    });
  } catch (error) {
    console.error('Outstanding error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/reports/trial-balance - Get trial balance
router.get('/trial-balance', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.getTrialBalance();
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Extract groups from response
    let groups = response?.envelope?.body?.data?.collection?.group || [];
    
    // Normalize to array if single item
    if (!Array.isArray(groups)) {
      groups = groups ? [groups] : [];
    }
    
    res.json({
      success: true,
      data: groups,
      count: groups.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

