import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// GET /api/stock - Get all stock items
router.get('/', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.getAllStockItems();
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Extract from importdata structure similar to ledgers
    let tallyMessages = response?.envelope?.body?.importdata?.requestdata?.tallymessage || [];
    
    // Also try direct path for stock summary
    let stockItems = response?.envelope?.dspstkitem || [];
    
    // If we got tallymessages, extract stock items
    if (Array.isArray(tallyMessages) && tallyMessages.length > 0) {
      stockItems = [];
      tallyMessages.forEach(msg => {
        if (msg.stockitem) {
          const items = Array.isArray(msg.stockitem) ? msg.stockitem : [msg.stockitem];
          stockItems.push(...items);
        }
      });
    }
    
    // Normalize to array
    if (!Array.isArray(stockItems)) {
      stockItems = stockItems ? [stockItems] : [];
    }
    
    console.log(`Found ${stockItems.length} stock items`);
    
    res.json({
      success: true,
      data: stockItems,
      count: stockItems.length
    });
  } catch (error) {
    console.error('Stock error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/stock/:name - Get specific stock item by name
router.get('/:name', async (req, res) => {
  try {
    const itemName = decodeURIComponent(req.params.name);
    const xmlRequest = xmlBuilder.getStockItemByName(itemName);
    const response = await tallyService.sendRequest(xmlRequest);
    
    const stockItem = response?.envelope?.body?.data?.stockitem || null;
    
    if (!stockItem) {
      return res.status(404).json({
        success: false,
        error: 'Stock item not found'
      });
    }
    
    res.json({
      success: true,
      data: stockItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

