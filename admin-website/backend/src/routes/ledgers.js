import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// GET /api/ledgers - Get all ledgers using TDL Collection
router.get('/', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.getAllLedgers();
    const response = await tallyService.sendRequest(xmlRequest);
    
    console.log('Ledger collection response keys:', Object.keys(response?.envelope || {}));
    
    // Extract ledgers from TDL Collection response
    let ledgers = [];
    
    // Try different possible paths for collection data
    const collection = response?.envelope?.body?.data?.collection 
                    || response?.envelope?.collection
                    || response?.envelope?.body?.collection
                    || {};
    
    console.log('Collection type:', typeof collection);
    console.log('Collection keys:', Object.keys(collection));
    
    // Ledgers might be directly in collection or in a ledger property
    let ledgerData = collection?.ledger || collection?.mylledgers || collection;
    
    // Normalize to array
    if (!Array.isArray(ledgerData)) {
      ledgerData = ledgerData ? [ledgerData] : [];
    }
    
    // If we got ledger objects, format them
    if (ledgerData.length > 0) {
      ledgers = ledgerData.map(item => ({
        name: item.name || item.NAME || '',
        parent: item.parent || item.PARENT || '',
        openingbalance: item.openingbalance || item.OPENINGBALANCE || '0',
        closingbalance: item.closingbalance || item.CLOSINGBALANCE || '0'
      })).filter(l => l.name); // Filter out empty names
    }
    
    console.log(`Found ${ledgers.length} ledgers from TDL Collection`);
    if (ledgers.length > 0) {
      console.log('Sample ledgers:', ledgers.slice(0, 5).map(l => l.name).join(', '));
    }
    
    res.json({
      success: true,
      data: ledgers,
      count: ledgers.length
    });
  } catch (error) {
    console.error('Ledgers error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/ledgers/:name - Get specific ledger with vouchers
router.get('/:name', async (req, res) => {
  try {
    const ledgerName = decodeURIComponent(req.params.name);
    const xmlRequest = xmlBuilder.getLedgerByName(ledgerName);
    const response = await tallyService.sendRequest(xmlRequest);
    
    console.log('Ledger detail response structure:', JSON.stringify(response, null, 2).substring(0, 2000));
    
    const envelope = response?.envelope || {};
    
    // Extract ledger info and vouchers
    const ledgerData = {
      name: ledgerName,
      vouchers: [],
      openingBalance: envelope.opbal || 0,
      closingBalance: envelope.clbal || 0
    };
    
    // Extract voucher data from parallel arrays
    const voucherTypes = envelope.dspvchtype || [];
    const voucherDates = envelope.dspdateformat || envelope.dspvchdate || [];
    const voucherNumbers = envelope.dspvchno || [];
    const debitAmounts = envelope.dspvchdramt || [];
    const creditAmounts = envelope.dspvchcramt || [];
    const narrations = envelope.dspvchnarr || [];
    
    // Normalize to arrays
    const types = Array.isArray(voucherTypes) ? voucherTypes : [voucherTypes];
    const dates = Array.isArray(voucherDates) ? voucherDates : [voucherDates];
    const numbers = Array.isArray(voucherNumbers) ? voucherNumbers : [voucherNumbers];
    const debits = Array.isArray(debitAmounts) ? debitAmounts : [debitAmounts];
    const credits = Array.isArray(creditAmounts) ? creditAmounts : [creditAmounts];
    const narr = Array.isArray(narrations) ? narrations : [narrations];
    
    console.log('Voucher arrays:', {
      types: types.length,
      dates: dates.length,
      numbers: numbers.length,
      debits: debits.length,
      credits: credits.length
    });
    
    // Combine parallel arrays into voucher objects
    const maxLength = Math.max(types.length, debits.length, credits.length);
    
    for (let i = 0; i < maxLength; i++) {
      const vchType = types[i] || '';
      const debit = debits[i] || '';
      const credit = credits[i] || '';
      
      // Skip if no type or both amounts are empty
      if (!vchType && !debit && !credit) continue;
      
      ledgerData.vouchers.push({
        dspdateformat: dates[i] || '',
        date: dates[i] || '',
        vchtype: vchType,
        vouchertypename: vchType,
        vchno: numbers[i] || '',
        vouchernumber: numbers[i] || '',
        debit: debit ? Math.abs(parseFloat(debit)) : 0,
        credit: credit ? Math.abs(parseFloat(credit)) : 0,
        amount: credit || debit || 0,
        particulars: narr[i] || '',
        narration: narr[i] || ''
      });
    }
    
    console.log(`Found ${ledgerData.vouchers.length} vouchers for ${ledgerName}`);
    if (ledgerData.vouchers.length > 0) {
      console.log('Sample voucher:', JSON.stringify(ledgerData.vouchers[0], null, 2));
    }
    
    res.json({
      success: true,
      data: ledgerData
    });
  } catch (error) {
    console.error('Ledger detail error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/ledgers/:name/vouchers - Get vouchers for a specific ledger
router.get('/:name/vouchers', async (req, res) => {
  try {
    const ledgerName = decodeURIComponent(req.params.name);
    const { fromDate, toDate } = req.query;
    
    const xmlRequest = xmlBuilder.getLedgerVouchers(ledgerName, fromDate, toDate);
    const response = await tallyService.sendRequest(xmlRequest);
    
    console.log('Ledger vouchers response:', JSON.stringify(response, null, 2).substring(0, 1000));
    
    // Extract voucher entries from response
    let vouchers = response?.envelope?.dspvchrs 
                || response?.envelope?.voucher
                || [];
    
    // Normalize to array
    if (!Array.isArray(vouchers)) {
      vouchers = vouchers ? [vouchers] : [];
    }
    
    console.log(`Found ${vouchers.length} vouchers for ledger ${ledgerName}`);
    
    res.json({
      success: true,
      data: vouchers,
      count: vouchers.length,
      ledgerName: ledgerName
    });
  } catch (error) {
    console.error('Ledger vouchers error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

