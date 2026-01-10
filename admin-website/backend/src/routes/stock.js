import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// GET /api/stock - Get all stock items
router.get('/', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.getAllStockItems();
    const response = await tallyService.sendRequest(xmlRequest);
    
    // Stock Summary report returns data in exportdata structure
    let stockItems = [];
    
    // Try multiple possible response paths for Stock Summary
    const exportData = response?.envelope?.body?.exportdata || response?.envelope?.body?.data || response?.body?.exportdata || response?.body?.data;
    
    if (exportData) {
      // Stock Summary can return data in various structures
      const collection = exportData.collection || exportData.COLLECTION || exportData.row || exportData.ROW;
      
      if (collection) {
        stockItems = Array.isArray(collection) ? collection : [collection];
      } else if (exportData.stockitem) {
        stockItems = Array.isArray(exportData.stockitem) ? exportData.stockitem : [exportData.stockitem];
      } else if (exportData.dspstkitem) {
        stockItems = Array.isArray(exportData.dspstkitem) ? exportData.dspstkitem : [exportData.dspstkitem];
      }
    }
    
    // Also try importdata path (sometimes used)
    if (stockItems.length === 0) {
      const tallyMessages = response?.envelope?.body?.importdata?.requestdata?.tallymessage || [];
      if (Array.isArray(tallyMessages) && tallyMessages.length > 0) {
        tallyMessages.forEach(msg => {
          if (msg.stockitem) {
            const items = Array.isArray(msg.stockitem) ? msg.stockitem : [msg.stockitem];
            stockItems.push(...items);
          }
        });
      }
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

