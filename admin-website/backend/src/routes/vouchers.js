import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// GET /api/vouchers - Get vouchers with optional filters
// Query params: type (Sales, Purchase, Receipt, Payment, etc.), fromDate (YYYYMMDD), toDate (YYYYMMDD)
router.get('/', async (req, res) => {
  try {
    const { type, fromDate, toDate } = req.query;
    
    const xmlRequest = xmlBuilder.getVouchers(type, fromDate, toDate);
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Extract vouchers from response
    let vouchers = response?.envelope?.body?.data?.collection?.voucher || [];
    
    // Normalize to array if single item
    if (!Array.isArray(vouchers)) {
      vouchers = vouchers ? [vouchers] : [];
    }
    
    res.json({
      success: true,
      data: vouchers,
      count: vouchers.length,
      filters: { type, fromDate, toDate }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

