import axios from 'axios';
import { parseString } from 'xml2js';
import { config } from '../config.js';

class TallyService {
  constructor() {
    this.baseUrl = config.tally.url;
  }

  /**
   * Send XML request to Tally and get parsed response
   * @param {string} xmlRequest - XML string to send to Tally
   * @returns {Promise<Object>} Parsed JSON response
   */
  async sendRequest(xmlRequest) {
    try {
      const response = await axios.post(this.baseUrl, xmlRequest, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Length': Buffer.byteLength(xmlRequest)
        },
        timeout: 30000 // 30 second timeout
      });

      // Parse XML response to JSON
      return await this.parseXmlToJson(response.data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Tally. Please ensure Tally is running with ODBC server enabled on port 9000.');
      }
      throw new Error(`Tally request failed: ${error.message}`);
    }
  }

  /**
   * Parse XML string to JSON object
   * @param {string} xmlString - XML string to parse
   * @returns {Promise<Object>} Parsed JSON object
   */
  parseXmlToJson(xmlString) {
    return new Promise((resolve, reject) => {
      parseString(xmlString, {
        explicitArray: false,
        mergeAttrs: true,
        trim: true,
        normalizeTags: true
      }, (err, result) => {
        if (err) {
          reject(new Error(`XML parsing failed: ${err.message}`));
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Test connection to Tally
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      const xmlRequest = `
        <ENVELOPE>
          <HEADER>
            <TALLYREQUEST>Export Data</TALLYREQUEST>
          </HEADER>
          <BODY>
            <EXPORTDATA>
              <REQUESTDESC>
                <REPORTNAME>List of Companies</REPORTNAME>
              </REQUESTDESC>
            </EXPORTDATA>
          </BODY>
        </ENVELOPE>
      `;
      
      await this.sendRequest(xmlRequest);
      return true;
    } catch (error) {
      console.error('Tally connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export default new TallyService();

