# Tally Connector Backend

Backend API server for Tally Prime integration. This server acts as a bridge between the Angular frontend and Tally Prime, converting XML requests/responses to JSON.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd admin-website/backend
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will start on **http://localhost:5000**

### 3. Verify it's Running
Open in browser: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "ok",
  "message": "Tally Connector API is running"
}
```

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Tally Prime** running with:
   - ODBC Server enabled
   - A company loaded
   - Port 9000 accessible

## 🔧 Configuration

Edit `src/config.js` to change:
- Tally server URL (default: `http://localhost:9000`)
- Backend port (default: `5000`)
- CORS origin (default: `http://localhost:4200`)

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Companies
- `GET /api/companies` - List all companies
- `GET /api/companies/test` - Test Tally connection

### Ledgers
- `GET /api/ledgers` - Get all ledgers
- `GET /api/ledgers/:name` - Get specific ledger with vouchers
- `GET /api/ledgers/:name/vouchers` - Get vouchers for a ledger

### Vouchers
- `GET /api/vouchers` - Get vouchers
  - Query params: `?type=Sales&fromDate=20240101&toDate=20241231`

### Stock
- `GET /api/stock` - Get all stock items
- `GET /api/stock/:name` - Get specific stock item

### Reports
- `GET /api/reports/outstanding` - Outstanding receivables/payables
- `GET /api/reports/trial-balance` - Trial balance

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Run `npm install` to ensure dependencies are installed

### Cannot connect to Tally
- Ensure Tally Prime is running
- Verify ODBC server is enabled (F11 → Features → Enable Tally.NET Services)
- Check if Tally is listening on port 9000
- Make sure a company is loaded in Tally

### CORS errors
- Backend is configured to allow requests from `http://localhost:4200`
- If you change the frontend port, update `src/config.js`

## 📝 Development Scripts

```bash
npm start          # Start server
npm run dev        # Start with auto-reload (Node 18+)
```

