import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// POST /api/sales-orders - Create a Sales Order in Tally
router.post('/', async (req, res) => {
  try {
    const { orderId, partyName, orderDate, orderTotal, lineItems } = req.body;
    
    // Validate required fields
    if (!orderId || !partyName || !orderDate || !lineItems || lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: orderId, partyName, orderDate, and lineItems are required'
      });
    }
    
    console.log('Creating Sales Order in Tally:', {
      orderId,
      partyName,
      orderDate,
      orderTotal,
      itemCount: lineItems.length,
      lineItems: lineItems.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    });
    
    // Use line items with rates - Tally may require rates for Sales Orders even if it has price lists
    // If rates are provided, use them. Otherwise Tally will try to fetch from price lists
    const simplifiedLineItems = lineItems.map(item => ({
      productName: item.productName || item.stockItemName,
      quantity: item.quantity || item.orderedQty || 0,
      rate: item.unitPrice || item.rate || 0, // Include rate if available
      unitPrice: item.unitPrice || item.rate || 0
    })).filter(item => item.productName); // Remove any items without product name
    
    if (simplifiedLineItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid line items found.'
      });
    }
    
    console.log('Using simplified line items (let Tally handle pricing):', simplifiedLineItems);
    
    // Build XML request for creating Sales Order - minimal structure
    const xmlRequest = xmlBuilder.createSalesOrderXML({
      orderId,
      partyName,
      orderDate,
      orderTotal,
      lineItems: simplifiedLineItems
    });
    
    console.log('XML Request to Tally:', xmlRequest.substring(0, 1000));
    
    // Send request to Tally
    const response = await tallyService.sendRequest(xmlRequest);
    
    console.log('Full Tally Response:', JSON.stringify(response, null, 2));
    
    // Also log specific structures that might contain exception details
    if (response?.envelope?.body?.data) {
      console.log('Response data keys:', Object.keys(response.envelope.body.data));
      console.log('Response data structure:', JSON.stringify(response.envelope.body.data, null, 2));
    }
    if (response?.envelope?.body?.desc) {
      console.log('Response desc keys:', Object.keys(response.envelope.body.desc));
    }
    
    // Check for errors in response - Tally can return errors in multiple places
    // With DATA structure, errors might be in different locations
    const errorPaths = [
      response?.envelope?.body?.data, // If data is a string error message
      response?.envelope?.body?.importdata?.responsedata?.lineerror,
      response?.envelope?.body?.importdata?.requestdata?.tallymessage?.[0]?.lineerror,
      response?.envelope?.body?.data?.lineerror,
      response?.envelope?.body?.lineerror,
      response?.envelope?.body?.importdata?.lineerror,
      response?.body?.importdata?.responsedata?.lineerror,
      response?.body?.lineerror
    ];
    
    // Check if data is an error string (like "DESC not found")
    if (typeof response?.envelope?.body?.data === 'string' && 
        (response.envelope.body.data.toLowerCase().includes('error') || 
         response.envelope.body.data.toLowerCase().includes('not found'))) {
      const errorMsg = response.envelope.body.data;
      console.error('Tally error creating Sales Order:', errorMsg);
      console.error('Full Tally response:', JSON.stringify(response, null, 2));
      
      // Provide helpful error message
      const stockItemNames = simplifiedLineItems.map(i => i.productName).join(', ');
      return res.status(400).json({
        success: false,
        error: `Tally error: ${errorMsg}`,
        fullResponse: response,
        suggestion: `"DESC not found" usually means the stock items don't exist in Tally or names don't match exactly. Please verify these stock items exist in Tally: ${stockItemNames}. Names must match exactly (case-sensitive, spaces, special characters).`
      });
    }
    
    const error = errorPaths.find(err => err && typeof err === 'string' && (err.toLowerCase().includes('error') || err.toLowerCase().includes('not found')));
    if (error) {
      console.error('Tally error creating Sales Order:', error);
      console.error('Full Tally response:', JSON.stringify(response, null, 2));
      return res.status(400).json({
        success: false,
        error: `Tally error: ${error}`,
        fullResponse: response
      });
    }
    
    // Check for importresult structure - this is the standard Tally Import response
    const importResult = response?.envelope?.body?.data?.importresult;
    
    if (importResult) {
      const created = parseInt(importResult.created || '0');
      const altered = parseInt(importResult.altered || '0');
      const exceptions = parseInt(importResult.exceptions || '0');
      const errors = parseInt(importResult.errors || '0');
      const vchnumber = importResult.vchnumber || orderId;
      
      console.log('Tally Import Result:', {
        created,
        altered,
        exceptions,
        errors,
        vchnumber
      });
      
      // Success: Voucher was created or altered
      if (created > 0 || altered > 0) {
        console.log('Sales Order created/altered successfully in Tally');
        res.json({
          success: true,
          data: {
            orderId,
            tallyVoucherNumber: vchnumber,
            created: created > 0,
            altered: altered > 0,
            message: created > 0 ? 'Sales Order created successfully in Tally' : 'Sales Order altered successfully in Tally'
          }
        });
        return;
      }
      
      // Exception: Request processed but something prevented creation
      if (exceptions > 0) {
        console.warn(`Tally returned ${exceptions} exception(s) - voucher not created`);
        
        // Check cmpinfo for clues - this shows what Tally found/didn't find
        const cmpinfo = response?.envelope?.body?.desc?.cmpinfo || {};
        const vouchertype = parseInt(cmpinfo.vouchertype || '0');
        const stockitem = parseInt(cmpinfo.stockitem || '0');
        const ledger = parseInt(cmpinfo.ledger || '0');
        const voucher = parseInt(cmpinfo.voucher || '0');
        
        console.log('Tally cmpinfo analysis:', {
          vouchertype: vouchertype > 0 ? 'Found' : 'NOT FOUND - This is likely the issue!',
          stockitem: stockitem > 0 ? `Found ${stockitem}` : 'NOT FOUND',
          ledger: ledger > 0 ? 'Found' : 'NOT FOUND',
          voucher: voucher > 0 ? 'Found' : 'NOT FOUND'
        });
        
        // Search for exception details
        const exceptionDetails = 
          response?.envelope?.body?.data?.lineerror ||
          response?.envelope?.body?.lineerror ||
          response?.envelope?.body?.importdata?.lineerror ||
          'Exception details not found in response. Check Tally Exception Report.';
        
        // Build helpful error message based on what we found
        let diagnosticMessage = '';
        if (vouchertype === 0) {
          diagnosticMessage = 'CRITICAL: Voucher Type "Sales Order" was NOT FOUND in Tally. The voucher type might not exist or have a different name. Try using "Sales" instead, or create the "Sales Order" voucher type in Tally first.';
        } else if (stockitem === 0) {
          diagnosticMessage = 'CRITICAL: Stock items were NOT FOUND in Tally. Verify the stock item names match exactly.';
        } else if (ledger === 0) {
          diagnosticMessage = 'CRITICAL: Party Ledger was NOT FOUND in Tally. Verify the ledger name matches exactly.';
        } else {
          diagnosticMessage = 'Exception occurred but all required masters (voucher type, stock items, ledger) were found. Check Tally Exception Report for specific validation errors.';
        }
        
        return res.status(400).json({
          success: false,
          error: `Sales Order could not be created in Tally. Exception occurred (${exceptions} exception(s))`,
          exceptionDetails: exceptionDetails,
          diagnostic: diagnosticMessage,
          cmpinfo: cmpinfo,
          importResult: importResult,
          suggestion: 'Check Tally Exception Report (Display > Exception Reports) for the exact error. Also verify: 1) "Sales Order" voucher type exists, 2) Stock items exist with exact names, 3) Party ledger exists.',
          fullResponse: response
        });
      }
      
      // Errors: Something went wrong
      if (errors > 0) {
        console.error(`Tally returned ${errors} error(s)`);
        const errorDetails = response?.envelope?.body?.data?.lineerror || 
                            response?.envelope?.body?.lineerror ||
                            'Unknown error';
        
        return res.status(400).json({
          success: false,
          error: `Tally error: ${errorDetails}`,
          importResult: importResult,
          fullResponse: response
        });
      }
      
      // No creation, no exceptions, no errors - might be ignored or other issue
      console.warn('Voucher was not created, but no exceptions or errors reported');
      return res.status(400).json({
        success: false,
        error: 'Sales Order was not created in Tally. Check import result for details.',
        importResult: importResult,
        fullResponse: response
      });
    }
    
    // Fallback: Check for voucher in traditional structure
    const createdVoucher = 
      response?.envelope?.body?.data?.tallymessage?.[0]?.voucher ||
      response?.envelope?.body?.data?.tallymessage?.voucher ||
      response?.envelope?.body?.data?.voucher ||
      response?.envelope?.body?.importdata?.requestdata?.tallymessage?.[0]?.voucher ||
      response?.envelope?.body?.importdata?.responsedata?.tallymessage?.[0]?.voucher;
    
    if (createdVoucher) {
      console.log('Sales Order created successfully in Tally (traditional structure)');
      res.json({
        success: true,
        data: {
          orderId,
          tallyVoucherKey: createdVoucher.vchkey || createdVoucher.VCHKEY || createdVoucher['vchkey'],
          tallyVoucherNumber: createdVoucher.vouchernumber || createdVoucher.VOUCHERNUMBER || createdVoucher['vouchernumber'],
          message: 'Sales Order created successfully in Tally'
        }
      });
      return;
    }
    
    // If we get here, response structure is unexpected
    console.error('Unexpected Tally response structure for Sales Order creation');
    console.error('Full response:', JSON.stringify(response, null, 2));
    return res.status(500).json({
      success: false,
      error: 'Unexpected response from Tally. Please check Tally logs and backend console for details.',
      fullResponse: response
    });
  } catch (error) {
    console.error('Error creating Sales Order in Tally:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Sales Order in Tally'
    });
  }
});

export default router;

