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
   * Get detailed voucher by VCHKEY
   * @param {string} vchkey - Voucher key from Tally
   */
  getVoucherByKey(vchkey) {
    // Use simpler approach - extract VCHTYPE and date from vchkey to query Day Book
    // VCHKEY format: "a66a8a49-288f-40bb-89d3-63d5bd8c670e-0000b126:00000008"
    // We'll use a simpler query that gets all vouchers and filter by key on backend
    // OR use the voucher data we already have from the list
    
    // Alternative: Use a simple voucher query without complex TDL
    // Since TDL queries are timing out, let's use the existing voucher data
    // and enhance it with a simpler query if needed
    
    // For now, return a query that gets voucher details using standard export
    // This might need to be enhanced based on what Tally supports
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
              </STATICVARIABLES>
            </REQUESTDESC>
          </EXPORTDATA>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Generate PDF for a voucher by VCHKEY
   * @param {string} vchkey - Voucher key from Tally
   */
  getVoucherPDF(vchkey) {
    // Tally's XML API doesn't directly support PDF export
    // We'll use a collection query to get the voucher and then generate PDF on backend
    // For now, return a query that gets the voucher data - we'll generate PDF on backend
    return `
      <ENVELOPE>
        <HEADER>
          <VERSION>1</VERSION>
          <TALLYREQUEST>Export</TALLYREQUEST>
          <TYPE>Data</TYPE>
          <ID>VoucherData</ID>
        </HEADER>
        <BODY>
          <DESC>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              <SVVOUCHERKEY>${this.escapeXml(vchkey)}</SVVOUCHERKEY>
            </STATICVARIABLES>
            <TDL>
              <TDLMESSAGE>
                <COLLECTION NAME="VoucherCollection" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">
                  <TYPE>Voucher</TYPE>
                  <NATIVEMETHOD>$$Key:$$SVVOUCHERKEY</NATIVEMETHOD>
                </COLLECTION>
              </TDLMESSAGE>
            </TDL>
          </DESC>
        </BODY>
      </ENVELOPE>
    `;
  }

  /**
   * Create Sales Order XML for Tally
   * @param {Object} orderData - Order data containing party, date, items, etc.
   */
  createSalesOrderXML(orderData) {
    const { orderId, partyName, orderDate, lineItems } = orderData;
    
    // Format date for Tally (YYYYMMDD)
    const formattedDate = orderDate.replace(/-/g, '');
    
    // Build inventory entries for Sales Order
    // For Sales Orders, Tally may require rates/amounts even if it can fetch from price lists
    // Include rate if provided, otherwise Tally will try to use price list
    let inventoryEntries = '';
    lineItems.forEach((item) => {
      const stockItemName = this.escapeXml(item.productName || item.stockItemName || '');
      const quantity = item.quantity || item.orderedQty || 0;
      const rate = item.rate || item.unitPrice || 0;
      const amount = quantity * rate;
      
      // For Sales Orders, use ALLINVENTORYENTRIES.LIST (required for order vouchers)
      // Include all required fields
      inventoryEntries += `
          <ALLINVENTORYENTRIES.LIST>
            <STOCKITEMNAME>${stockItemName}</STOCKITEMNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
            <ACTUALQTY>${quantity}</ACTUALQTY>
            <BILLEDQTY>${quantity}</BILLEDQTY>
            <RATE>${rate}</RATE>
            <AMOUNT>${amount}</AMOUNT>
          </ALLINVENTORYENTRIES.LIST>`;
    });
    
    // Calculate total amount for ledger entries
    const totalAmount = lineItems.reduce((sum, item) => {
      const qty = item.quantity || item.orderedQty || 0;
      const rate = item.rate || item.unitPrice || 0;
      return sum + (qty * rate);
    }, 0);
    
    // For Sales Orders, Tally might require ledger entries to balance
    // Even though Sales Orders are order vouchers, some Tally configs need ledger entries
    const ledgerEntries = `
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${this.escapeXml(partyName)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <ISLASTDEEMEDPOSITIVE>Yes</ISLASTDEEMEDPOSITIVE>
            <AMOUNT>${totalAmount}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Sales</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <ISLASTDEEMEDPOSITIVE>No</ISLASTDEEMEDPOSITIVE>
            <AMOUNT>-${totalAmount}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`;
    
    // Tally Import XML structure
    const cleanDate = formattedDate.replace(/[^0-9]/g, ''); // Ensure only digits (YYYYMMDD)
    
    return `<ENVELOPE>
<HEADER>
<VERSION>1</VERSION>
<TALLYREQUEST>Import</TALLYREQUEST>
<TYPE>Data</TYPE>
<ID>Vouchers</ID>
</HEADER>
<BODY>
<DESC>
<STATICVARIABLES>
<SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
</STATICVARIABLES>
</DESC>
<DATA>
<TALLYMESSAGE xmlns:UDF="TallyUDF">
<VOUCHER REMOTEID="${this.escapeXml(orderId)}" ACTION="Create">
<DATE>${cleanDate}</DATE>
<VOUCHERTYPE>Sales Order</VOUCHERTYPE>
<VOUCHERNUMBER>${this.escapeXml(orderId)}</VOUCHERNUMBER>
<PARTYLEDGERNAME>${this.escapeXml(partyName)}</PARTYLEDGERNAME>
<NARRATION>Sales Order from DMS - ${this.escapeXml(orderId)}</NARRATION>
${inventoryEntries}
${ledgerEntries}
</VOUCHER>
</TALLYMESSAGE>
</DATA>
</BODY>
</ENVELOPE>`;
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
    
    // Use Day Book report for all voucher types - it's more reliable
    // Filtering by type will be done on backend
    // Day Book includes all voucher types and has a consistent structure
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
              <SVSTOCKITEMNAME>${this.escapeXml(itemName)}</SVSTOCKITEMNAME>
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

  /**
   * Generate a GUID for Tally voucher
   * @returns {string} GUID string
   */
  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export default new XMLBuilder();

