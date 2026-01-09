/**
 * XML Query Builder for Tally Prime
 * Contains templates for various Tally data requests
 */

class XMLBuilder {
  /**
   * Get list of all companies
   */
  getCompanies() {
    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Company Features</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get all ledgers with closing balances using TDL Collection
   * @param {string} fromDate - Start date (YYYYMMDD format) 
   * @param {string} toDate - End date (YYYYMMDD format)
   */
  getAllLedgers(fromDate = null, toDate = null) {
    return `
      <ENVELOPE>
        <HEADER>
          <VERSION>1</VERSION>
          <TALLYREQUEST>Export</TALLYREQUEST>
          <TYPE>Collection</TYPE>
          <ID>MyLedgers</ID>
        </HEADER>
        <BODY>
          <DESC>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
              <TDLMESSAGE>
                <COLLECTION NAME="MyLedgers" ISMODIFY="No" ISFIXED="No">
                  <TYPE>Ledger</TYPE>
                  <FETCH>Name, Parent, ClosingBalance, OpeningBalance</FETCH>
                </COLLECTION>
              </TDLMESSAGE>
            </TDL>
          </DESC>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get specific ledger details by name
   * @param {string} ledgerName - Name of the ledger
   */
  getLedgerByName(ledgerName) {
    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Ledger Vouchers</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <LEDGERNAME>${this.escapeXml(ledgerName)}</LEDGERNAME>
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get vouchers for a specific ledger
   * @param {string} ledgerName - Name of the ledger
   * @param {string} fromDate - Start date (YYYYMMDD format)
   * @param {string} toDate - End date (YYYYMMDD format)
   */
  getLedgerVouchers(ledgerName, fromDate = null, toDate = null) {
    const fromDateTag = fromDate ? `<SVFROMDATE>${fromDate}</SVFROMDATE>` : '';
    const toDateTag = toDate ? `<SVTODATE>${toDate}</SVTODATE>` : '';

    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Ledger Vouchers</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <LEDGERNAME>${this.escapeXml(ledgerName)}</LEDGERNAME>
                ${fromDateTag}
                ${toDateTag}
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get vouchers by type and date range
   * @param {string} voucherType - Type of voucher (Sales, Purchase, Receipt, Payment, Journal, Contra, etc.)
   * @param {string} fromDate - Start date (YYYYMMDD format)
   * @param {string} toDate - End date (YYYYMMDD format)
   */
  getVouchers(voucherType = null, fromDate = null, toDate = null) {
    const fromDateTag = fromDate ? `<SVFROMDATE>${fromDate}</SVFROMDATE>` : '';
    const toDateTag = toDate ? `<SVTODATE>${toDate}</SVTODATE>` : '';

    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Day Book</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                ${fromDateTag}
                ${toDateTag}
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get all stock items with quantities and values
   */
  getAllStockItems() {
    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Stock Summary</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get stock item details by name
   * @param {string} itemName - Name of the stock item
   */
  getStockItemByName(itemName) {
    return `
      <ENVELOPE>
        <HEADER>
          <VERSION>1</VERSION>
          <TALLYREQUEST>Export</TALLYREQUEST>
          <TYPE>Data</TYPE>
          <ID>StockItem</ID>
        </HEADER>
        <BODY>
          <DESC>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              <STOCKITEMNAME>${this.escapeXml(itemName)}</STOCKITEMNAME>
            </STATICVARIABLES>
          </DESC>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get outstanding receivables/payables
   */
  getOutstandingReport() {
    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Bills Receivable</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Get trial balance
   */
  getTrialBalance() {
    return `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Export Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <EXPORTDATA>
            <REQUESTDESC>
              <REPORTNAME>Trial Balance</REPORTNAME>
              <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Escape special XML characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeXml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export default new XMLBuilder();

