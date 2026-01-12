import express from 'express';
import tallyService from '../services/tallyService.js';
import xmlBuilder from '../utils/xmlBuilder.js';

const router = express.Router();

// GET /api/companies - Get all companies
router.get('/', async (req, res) => {
  try {
    const xmlRequest = xmlBuilder.getCompanies();
    const response = await tallyService.sendRequest(xmlRequest);
    
    // For now, return current company info from response
    const companyData = response?.envelope?.body?.importdata?.requestdesc?.staticvariables?.svcurrentcompany 
                     || response?.envelope?.header?.key
                     || 'Dummey';
    
    // Create a company object
    const companies = [{
      name: companyData,
      loaded: true
    }];
    
    res.json({
      success: true,
      data: companies,
      count: 1
    });
  } catch (error) {
    console.error('Companies error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/companies/test - Test Tally connection
router.get('/test', async (req, res) => {
  try {
    const isConnected = await tallyService.testConnection();
    res.json({
      success: isConnected,
      message: isConnected 
        ? 'Successfully connected to Tally' 
        : 'Failed to connect to Tally. Please check if Tally is running with ODBC server enabled.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

