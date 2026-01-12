import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// GET /api/vouchers/:vchkey - Get detailed voucher by VCHKEY
router.get('/:vchkey', async (req, res) => {
  try {
    const { vchkey } = req.params;
    
    // Since complex TDL queries are timing out, we'll fetch all vouchers from Day Book
    // and filter by VCHKEY on the backend
    // This is more reliable than complex TDL queries
    const xmlRequest = xmlBuilder.getVouchers(null, null, null);
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Extract vouchers from response (same logic as list endpoint)
    let vouchers = [];
    
    // Check for importdata format
    const tallyMessage = response?.envelope?.body?.importdata?.requestdata?.tallymessage;
    if (tallyMessage) {
      if (Array.isArray(tallyMessage)) {
        vouchers = tallyMessage
          .filter(item => item.voucher)
          .map(item => item.voucher);
      } else if (tallyMessage.voucher) {
        vouchers = Array.isArray(tallyMessage.voucher) 
          ? tallyMessage.voucher 
          : [tallyMessage.voucher];
      }
    }
    
    // Normalize to array
    if (!Array.isArray(vouchers)) {
      vouchers = vouchers ? [vouchers] : [];
    }
    
    // Find the voucher with matching VCHKEY
    const voucher = vouchers.find(v => {
      const key = v.vchkey || v['vchkey'] || v.VCHKEY || v['VCHKEY'];
      return key === vchkey;
    });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
    }
    
    // The voucher from Day Book might not have all details
    // For now, return what we have - the frontend can display it
    // In the future, we can enhance this with a more specific query
    res.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error fetching voucher details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/vouchers/:vchkey/pdf - Generate PDF for a voucher
router.get('/:vchkey/pdf', async (req, res) => {
  try {
    const { vchkey } = req.params;
    
    console.log('Generating PDF for voucher:', vchkey);
    
    // Get the voucher data first (same as detail endpoint)
    const xmlRequest = xmlBuilder.getVouchers(null, null, null);
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Extract vouchers from response
    let vouchers = [];
    const tallyMessage = response?.envelope?.body?.importdata?.requestdata?.tallymessage;
    if (tallyMessage) {
      if (Array.isArray(tallyMessage)) {
        vouchers = tallyMessage
          .filter(item => item.voucher)
          .map(item => item.voucher);
      } else if (tallyMessage.voucher) {
        vouchers = Array.isArray(tallyMessage.voucher) 
          ? tallyMessage.voucher 
          : [tallyMessage.voucher];
      }
    }
    
    if (!Array.isArray(vouchers)) {
      vouchers = vouchers ? [vouchers] : [];
    }
    
    // Find the voucher with matching VCHKEY
    const voucher = vouchers.find(v => {
      const key = v.vchkey || v['vchkey'] || v.VCHKEY || v['VCHKEY'];
      return key === vchkey;
    });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
    }
    
    // Generate PDF using pdfkit
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    const voucherNumber = (voucher.vouchernumber || voucher['VOUCHERNUMBER'] || voucher.vchnumber || voucher['VCHNUMBER'] || 'voucher').toString();
    res.setHeader('Content-Disposition', `attachment; filename="Voucher_${voucherNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Helper function to get field value
    const getField = (obj, ...fields) => {
      if (!obj) return null;
      for (const field of fields) {
        if (obj[field] !== undefined && obj[field] !== null) {
          return obj[field];
        }
        const upperField = field.toUpperCase();
        if (obj[upperField] !== undefined && obj[upperField] !== null) {
          return obj[upperField];
        }
      }
      return null;
    };
    
    // Helper to format amount
    const formatAmount = (value) => {
      if (!value) return '0.00';
      const num = typeof value === 'string' ? parseFloat(value.toString().replace(/,/g, '')) : parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    };
    
    // PDF Content
    doc.fontSize(20).text('VOUCHER DETAILS', { align: 'center' });
    doc.moveDown();
    
    // Voucher Information
    doc.fontSize(14).text('Voucher Information:', { underline: true });
    doc.moveDown(0.5);
    
    const date = getField(voucher, 'date', 'DATE');
    const type = getField(voucher, 'vchtype', 'VCHTYPE', 'vouchertypename');
    const number = getField(voucher, 'vouchernumber', 'VOUCHERNUMBER', 'vchnumber', 'VCHNUMBER');
    const party = getField(voucher, 'partyledgername', 'PARTYLEDGERNAME', 'partyname', 'PARTYNAME');
    
    doc.fontSize(12);
    doc.text(`Date: ${date || '-'}`, 50, doc.y);
    doc.text(`Type: ${type || '-'}`, 50, doc.y + 20);
    doc.text(`Number: ${number || '-'}`, 50, doc.y + 20);
    doc.text(`Party: ${party || '-'}`, 50, doc.y + 20);
    doc.moveDown(2);
    
    // Items
    const inventoryEntries = voucher.allinventoryentries?.list || 
                            voucher.allinventoryentries?.LIST ||
                            voucher.inventoryentries?.list ||
                            voucher.inventoryentries?.LIST ||
                            (Array.isArray(voucher.allinventoryentries) ? voucher.allinventoryentries : []) ||
                            (Array.isArray(voucher.inventoryentries) ? voucher.inventoryentries : []);
    
    if (inventoryEntries && inventoryEntries.length > 0) {
      doc.fontSize(14).text('Items:', { underline: true });
      doc.moveDown(0.5);
      
      let startY = doc.y;
      doc.fontSize(10);
      doc.text('Item Name', 50, startY);
      doc.text('HSN', 200, startY);
      doc.text('Qty', 280, startY);
      doc.text('Rate', 330, startY);
      doc.text('Discount', 380, startY);
      doc.text('Amount', 450, startY);
      
      let yPos = startY + 20;
      let itemsTotal = 0;
      
      const items = Array.isArray(inventoryEntries) ? inventoryEntries : [inventoryEntries];
      items.forEach(item => {
        const itemName = getField(item, 'stockitemname', 'STOCKITEMNAME', 'name', 'NAME');
        const hsn = getField(item, 'hsncode', 'HSNCODE', 'hsn', 'HSN', 'hsnsac', 'HSNSAC');
        const qty = getField(item, 'actualqty', 'ACTUALQTY', 'quantity', 'QUANTITY');
        const rate = getField(item, 'rate', 'RATE', 'rateper', 'RATEPER');
        const discount = getField(item, 'discount', 'DISCOUNT', 'discountamount', 'DISCOUNTAMOUNT');
        const amount = getField(item, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT');
        
        doc.text(itemName || '-', 50, yPos);
        doc.text(hsn || '-', 200, yPos);
        doc.text(qty || '-', 280, yPos);
        doc.text(formatAmount(rate), 330, yPos);
        doc.text(formatAmount(discount), 380, yPos);
        doc.text(formatAmount(amount), 450, yPos);
        
        if (amount) {
          itemsTotal += parseFloat(formatAmount(amount));
        }
        
        yPos += 20;
        if (yPos > 750) {
          doc.addPage();
          yPos = 50;
        }
      });
      
      doc.moveDown();
      doc.fontSize(12).text(`Items Subtotal: ₹${itemsTotal.toFixed(2)}`, 450, doc.y, { align: 'right' });
      doc.moveDown();
    }
    
    // Taxes
    const ledgerEntries = voucher.ledgerentries?.list || 
                         voucher.ledgerentries?.LIST ||
                         voucher.LEDGERENTRIES?.list ||
                         voucher.LEDGERENTRIES?.LIST ||
                         (Array.isArray(voucher.ledgerentries) ? voucher.ledgerentries : []) ||
                         (Array.isArray(voucher.LEDGERENTRIES) ? voucher.LEDGERENTRIES : []);
    
    if (ledgerEntries && ledgerEntries.length > 0) {
      const taxEntries = ledgerEntries.filter(entry => {
        const ledgerName = (getField(entry, 'ledgername', 'LEDGERNAME', 'name', 'NAME') || '').toLowerCase();
        return ledgerName.includes('cgst') || 
               ledgerName.includes('sgst') || 
               ledgerName.includes('igst') ||
               ledgerName.includes('gst') ||
               ledgerName.includes('tax');
      });
      
      if (taxEntries.length > 0) {
        doc.fontSize(14).text('Taxes:', { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(10);
        taxEntries.forEach(tax => {
          const taxName = getField(tax, 'ledgername', 'LEDGERNAME', 'name', 'NAME');
          const taxAmount = getField(tax, 'amount', 'AMOUNT', 'billamount', 'BILLAMOUNT');
          doc.text(`${taxName || '-'}: ₹${formatAmount(taxAmount)}`, 50, doc.y);
          doc.moveDown(0.5);
        });
        doc.moveDown();
      }
    }
    
    // Total
    const totalAmount = getField(voucher, 'amount', 'AMOUNT', 'total', 'TOTAL');
    doc.fontSize(16).text(`Grand Total: ₹${formatAmount(totalAmount)}`, 50, doc.y, { align: 'right' });
    
    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/vouchers - Get vouchers with optional filters
// Query params: type (Sales, Purchase, Receipt, Payment, etc.), fromDate (YYYYMMDD), toDate (YYYYMMDD)
router.get('/', async (req, res) => {
  try {
    const { type, fromDate, toDate } = req.query;
    
    const xmlRequest = xmlBuilder.getVouchers(type, fromDate, toDate);
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Log the full response structure for debugging
    console.log('Tally Response Structure:', JSON.stringify(response, null, 2).substring(0, 2000));
    
    // Extract vouchers from response
    // Tally responses can have various structures depending on the report type
    let vouchers = [];
    
    // Check for importdata format (Day Book returns this structure)
    const tallyMessage = response?.envelope?.body?.importdata?.requestdata?.tallymessage;
    if (tallyMessage) {
      if (Array.isArray(tallyMessage)) {
        // Extract voucher objects from tallymessage array
        vouchers = tallyMessage
          .filter(item => item.voucher) // Only items that have a voucher property
          .map(item => item.voucher); // Extract the voucher object
      } else if (tallyMessage.voucher) {
        // Single voucher in tallymessage
        vouchers = Array.isArray(tallyMessage.voucher) 
          ? tallyMessage.voucher 
          : [tallyMessage.voucher];
      }
    }
    
    // If no vouchers found in importdata, try exportdata format
    if (vouchers.length === 0) {
      const possiblePaths = [
        response?.envelope?.body?.data?.collection?.voucher,
        response?.envelope?.body?.data?.collection?.row,
        response?.envelope?.body?.data?.collection,
        response?.envelope?.body?.collection?.voucher,
        response?.envelope?.body?.collection?.row,
        response?.envelope?.body?.collection,
        response?.body?.data?.collection?.voucher,
        response?.body?.data?.collection?.row,
        response?.body?.data?.collection,
        response?.body?.collection?.voucher,
        response?.body?.collection?.row,
        response?.body?.collection
      ];
      
      // Find the first non-empty path
      for (const path of possiblePaths) {
        if (path) {
          if (Array.isArray(path)) {
            vouchers = path;
            break;
          } else if (typeof path === 'object') {
            // Check if it's a single voucher object or has nested structure
            if (path.voucher) {
              vouchers = Array.isArray(path.voucher) ? path.voucher : [path.voucher];
              break;
            } else if (path.row) {
              vouchers = Array.isArray(path.row) ? path.row : [path.row];
              break;
            } else {
              // Might be a single voucher object
              vouchers = [path];
              break;
            }
          }
        }
      }
    }
    
    // Normalize to array
    if (!Array.isArray(vouchers)) {
      vouchers = vouchers ? [vouchers] : [];
    }
    
    console.log(`Found ${vouchers.length} vouchers before filtering`);
    
    // Log first voucher structure to see what data we have
    if (vouchers.length > 0) {
      const firstVoucher = vouchers[0];
      console.log('First voucher keys (first 50):', Object.keys(firstVoucher).slice(0, 50));
      
      // Check for inventory and ledger entries
      const hasInventory = firstVoucher.inventoryentries || 
                          firstVoucher['inventoryentries'] || 
                          firstVoucher.INVENTORYENTRIES || 
                          firstVoucher['INVENTORYENTRIES'] ||
                          firstVoucher['inventoryentries.list'] ||
                          firstVoucher['INVENTORYENTRIES.LIST'];
      const hasLedger = firstVoucher.ledgerentries || 
                       firstVoucher['ledgerentries'] || 
                       firstVoucher.LEDGERENTRIES || 
                       firstVoucher['LEDGERENTRIES'] ||
                       firstVoucher['ledgerentries.list'] ||
                       firstVoucher['LEDGERENTRIES.LIST'];
      
      console.log('Has inventory entries:', !!hasInventory);
      console.log('Has ledger entries:', !!hasLedger);
      
      if (hasInventory) {
        console.log('Inventory entries type:', typeof hasInventory, Array.isArray(hasInventory));
      }
      if (hasLedger) {
        console.log('Ledger entries type:', typeof hasLedger, Array.isArray(hasLedger));
      }
    }
    
    // Normalize voucher field names to lowercase for easier access
    // Tally returns uppercase field names, we need to normalize them
    // IMPORTANT: Preserve ALL nested structures (inventory entries, ledger entries, etc.)
    vouchers = vouchers.map(v => {
      const normalized = {};
      // Copy all properties and normalize keys to lowercase
      // Use deep copy to preserve nested structures
      Object.keys(v).forEach(key => {
        const value = v[key];
        // Preserve nested objects/arrays as-is (no deep cloning needed, just reference)
        normalized[key.toLowerCase()] = value;
        // Also keep original key for backward compatibility
        normalized[key] = value;
      });
      return normalized;
    });
    
    // Filter by type if specified
    if (type && vouchers.length > 0) {
      const originalCount = vouchers.length;
      const typeLower = type.toLowerCase();
      vouchers = vouchers.filter(v => {
        // Try multiple possible field names for voucher type (both original and normalized)
        const vType = (v.vchtype ||           // Tally's VCHTYPE field (normalized)
                      v.VCHTYPE ||            // Original uppercase
                      v.vouchertypename || 
                      v.vouchertypename || 
                      v['vouchertype'] || 
                      v.vouchertype || 
                      v.type || 
                      v.vchtypename ||
                      '').toString().toLowerCase();
        
        // Exclude "QB Sales" entries - only show "Sales"
        if (vType.includes('qb sales') || vType === 'qb sales') {
          return false;
        }
        
        // For "Sales" type, only match exact "Sales" entries (not "QB Sales")
        if (typeLower === 'sales') {
          return vType === 'sales' || vType === typeLower;
        }
        
        // Check if the voucher type matches (case-insensitive)
        const matches = vType === typeLower || 
                       vType.includes(typeLower) ||
                       typeLower.includes(vType);
        
        if (!matches && originalCount <= 5) {
          console.log(`Voucher type mismatch: expected "${type}", got "${vType || 'undefined'}"`);
          console.log('Voucher keys:', Object.keys(v));
        }
        return matches;
      });
      console.log(`After filtering by type "${type}": ${vouchers.length} vouchers (from ${originalCount} total)`);
    }
    
    // Extract and calculate amounts from vouchers
    // Tally vouchers have amounts in LEDGERENTRIES.LIST structure
    vouchers = vouchers.map((v, index) => {
      let amount = 0;
      
      // Log ledger entries structure for first voucher
      if (index === 0) {
        console.log('Checking for ledger entries...');
        const ledgerKeys = Object.keys(v).filter(key => 
          key.toLowerCase().includes('ledger') || 
          key.toLowerCase().includes('entry') ||
          key.toLowerCase().includes('amount') ||
          key.toLowerCase().includes('credit') ||
          key.toLowerCase().includes('debit')
        );
        console.log('Relevant keys:', ledgerKeys);
      }
      
      // Try to find LEDGERENTRIES - Tally uses various formats
      let ledgerEntries = null;
      
      // Check all possible ledger entry field names (including dot notation)
      const ledgerFieldNames = [
        'ledgerentries', 'LEDGERENTRIES',
        'ledgerentrieslist', 'LEDGERENTRIESLIST',
        'ledgerentries_list', 'LEDGERENTRIES_LIST'
      ];
      
      for (const fieldName of ledgerFieldNames) {
        if (v[fieldName]) {
          ledgerEntries = v[fieldName];
          if (index === 0) console.log(`Found ledger entries in field: ${fieldName}`);
          break;
        }
      }
      
      // Check nested structures with dot notation (like "ledgerentries.list")
      if (!ledgerEntries) {
        if (v['ledgerentries.list']) {
          ledgerEntries = v['ledgerentries.list'];
          if (index === 0) console.log('Found ledger entries in field: ledgerentries.list');
        } else if (v['LEDGERENTRIES.LIST']) {
          ledgerEntries = v['LEDGERENTRIES.LIST'];
          if (index === 0) console.log('Found ledger entries in field: LEDGERENTRIES.LIST');
        } else if (v.ledgerentries) {
          ledgerEntries = v.ledgerentries;
          // Check if it has a .list or .LIST property
          if (ledgerEntries && typeof ledgerEntries === 'object') {
            if (ledgerEntries.list) {
              ledgerEntries = ledgerEntries.list;
            } else if (ledgerEntries.LIST) {
              ledgerEntries = ledgerEntries.LIST;
            }
          }
        } else if (v.LEDGERENTRIES) {
          ledgerEntries = v.LEDGERENTRIES;
          // Check if it has a .list or .LIST property
          if (ledgerEntries && typeof ledgerEntries === 'object') {
            if (ledgerEntries.list) {
              ledgerEntries = ledgerEntries.list;
            } else if (ledgerEntries.LIST) {
              ledgerEntries = ledgerEntries.LIST;
            }
          }
        }
      }
      
      if (ledgerEntries) {
        let entries = [];
        
        // Handle different ledger entry structures
        if (Array.isArray(ledgerEntries)) {
          entries = ledgerEntries;
        } else if (ledgerEntries.list) {
          entries = Array.isArray(ledgerEntries.list) ? ledgerEntries.list : [ledgerEntries.list];
        } else if (ledgerEntries.LIST) {
          entries = Array.isArray(ledgerEntries.LIST) ? ledgerEntries.LIST : [ledgerEntries.LIST];
        } else if (typeof ledgerEntries === 'object') {
          // Check if it's a single entry object
          entries = [ledgerEntries];
        }
        
        if (index === 0) {
          console.log(`Found ${entries.length} ledger entries`);
          if (entries.length > 0) {
            console.log('First ledger entry keys:', Object.keys(entries[0]));
            console.log('First ledger entry (first 1000 chars):', JSON.stringify(entries[0], null, 2).substring(0, 1000));
          }
        }
        
        // Sum up amounts from all ledger entries
        entries.forEach((entry, entryIndex) => {
          if (entry) {
            // Check all possible amount field names in ledger entry
            const amountFieldNames = [
              'amount', 'AMOUNT',
              'billamount', 'BILLAMOUNT',
              'creditamount', 'CREDITAMOUNT',
              'debitamount', 'DEBITAMOUNT',
              'credit', 'CREDIT',
              'debit', 'DEBIT',
              'value', 'VALUE',
              'total', 'TOTAL'
            ];
            
            for (const fieldName of amountFieldNames) {
              const fieldValue = entry[fieldName] || entry[fieldName.toLowerCase()] || entry[fieldName.toUpperCase()];
              if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '' && fieldValue !== 0 && fieldValue !== '0') {
                const numValue = typeof fieldValue === 'string' 
                  ? parseFloat(fieldValue.toString().replace(/,/g, '').replace(/₹/g, '').trim()) 
                  : parseFloat(fieldValue);
                if (!isNaN(numValue) && numValue !== 0) {
                  amount += Math.abs(numValue);
                  if (index === 0 && entryIndex === 0) {
                    console.log(`Found amount in ledger entry field "${fieldName}": ${fieldValue} -> ${numValue}`);
                  }
                  break; // Found amount in this entry, move to next entry
                }
              }
            }
          }
        });
      }
      
      // If still no amount, try direct fields as fallback
      if (!amount || amount === 0) {
        const directAmountFields = ['amount', 'AMOUNT', 'total', 'TOTAL', 'value', 'VALUE'];
        for (const fieldName of directAmountFields) {
          const fieldValue = v[fieldName];
          if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '' && fieldValue !== 0) {
            const numValue = typeof fieldValue === 'string' 
              ? parseFloat(fieldValue.toString().replace(/,/g, '').replace(/₹/g, '').trim()) 
              : parseFloat(fieldValue);
            if (!isNaN(numValue) && numValue !== 0) {
              amount = Math.abs(numValue);
              break;
            }
          }
        }
      }
      
      // Add the calculated amount to the voucher (set in multiple formats for compatibility)
      v.amount = amount;
      v['amount'] = amount;
      v.AMOUNT = amount;
      v['AMOUNT'] = amount;
      
      if (index === 0) {
        console.log(`Final extracted amount: ${amount}`);
      }
      
      return v;
    });
    
    // Log sample voucher structure if available
    if (vouchers.length > 0) {
      console.log('Sample voucher structure (first 1000 chars):', JSON.stringify(vouchers[0], null, 2).substring(0, 1000));
      console.log('Sample voucher amount:', vouchers[0].amount || vouchers[0]['amount'] || vouchers[0].AMOUNT || vouchers[0]['AMOUNT']);
    } else {
      console.log('No vouchers found. Full response keys:', Object.keys(response || {}));
      if (response?.envelope) {
        console.log('Envelope keys:', Object.keys(response.envelope));
        if (response.envelope.body) {
          console.log('Body keys:', Object.keys(response.envelope.body));
          if (response.envelope.body.data) {
            console.log('Data keys:', Object.keys(response.envelope.body.data));
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: vouchers,
      count: vouchers.length,
      filters: { type, fromDate, toDate }
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

