# Salesforce Admin Website

A modern Angular 18+ admin dashboard built from Figma designs with pixel-perfect accuracy.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
cd admin-website
npm install

# Start development server
npm start
```

Open http://localhost:4200 to view the dashboard.

## 📊 What's Implemented

### Admin Dashboard (Landing Page)
✅ **Complete implementation** of the Figma admin panel design:

#### Components Built:
1. **Sidebar Navigation** (255px width)
   - Company logo/name
   - 12 navigation menu items
   - Glass morphism styling
   - Active state indicators

2. **Top Header Bar**
   - Page title
   - Search bar with icon
   - Notification bell (with badge)
   - User profile avatar

3. **Stats Cards** (3 cards)
   - Total Sales (Today): ₹14,50,000
   - Active Workers: 124
   - Active Routes: 8 Routes Live
   - Trend indicators (positive/negative)

4. **Actions Required Section**
   - 5 actionable alerts
   - Dynamic action buttons
   - Hover states

5. **Sales vs Targets Chart**
   - Time range selector (Daily/Weekly/Monthly)
   - Chart placeholder (ready for Chart.js integration)

6. **AI Chat Assistant**
   - Floating button (bottom-right)
   - Expandable chat modal
   - Connection states
   - Chat interface

7. **Footer**
   - Copyright information
   - Design credits

## 🎨 Design System

### Colors (Extracted from Figma)
- **Primary**: `#6C4423` (Brown)
- **Success**: `#16a34a` (Green)
- **Error**: `#de3b40` (Red)
- **Background**: `#FFFCF8` (Cream)
- **Text**: `#000000`, `#5a5a5b`

### Layout
- Sidebar: 255px fixed
- Header: 64px fixed
- Content: Responsive grid
- Max width: 1400px

## 📱 Features

- ✅ Fully responsive design
- ✅ Glass morphism effects
- ✅ Smooth animations
- ✅ Interactive components
- ✅ TypeScript strict mode
- ✅ SCSS with design tokens
- ✅ Lazy-loaded routes
- ✅ Print-friendly styles

## 🗂️ Project Structure

```
admin-website/src/app/
├── core/
│   └── layout/
│       ├── sidebar/          # Sidebar navigation
│       └── header/           # Top header bar
├── shared/
│   └── components/          # Reusable components
│       ├── button/
│       ├── card/
│       └── input/
└── features/
    ├── admin-dashboard/     # Main dashboard (NEW)
    │   └── components/
    │       ├── stats-card/
    │       ├── action-item/
    │       ├── sales-chart/
    │       └── ai-assistant/
    ├── components-demo/     # Component showcase
    └── dashboard/           # Legacy welcome page
```

## 🛣️ Routes

All navigation routes are configured:

- `/` → Redirects to `/dashboard`
- `/dashboard` → Admin Dashboard (Main page)
- `/products` → Product Master
- `/routes` → Routes Management
- `/distributors` → Distributors
- `/super-stockist` → Super Stockist
- `/finance` → Finance
- `/marketing` → Marketing
- `/tasks` → Assign Task
- `/employees` → Employees
- `/ai-chat` → AI Chat Bot
- `/assets` → Assets
- `/settings` → Settings
- `/demo` → Component Demo

**Note**: Currently, all routes except `/dashboard` and `/demo` show placeholder content. Ready to build!

## 🎯 Next Steps

### 1. Install & Run
```bash
cd admin-website
npm install
npm start
```

### 2. Build Additional Pages
Using the same Figma extraction process:
- Product Master page
- Routes page
- Distributors page
- And all other admin sections

### 3. Add Real Data
- Connect to backend API
- Replace mock data with real endpoints
- Add state management (NgRx/Signals)

### 4. Enhance Features
- Integrate Chart.js for sales chart
- Add real-time notifications
- Implement AI chat functionality
- Add authentication & guards

## 🔧 Development

### Available Commands

```bash
npm start          # Dev server (localhost:4200)
npm run build      # Production build
npm run watch      # Build in watch mode
npm test           # Run tests
```

### Key Technologies

- **Angular**: 18.2.0 (Standalone components)
- **TypeScript**: 5.5.2 (Strict mode)
- **SCSS**: With design tokens
- **RxJS**: 7.8.0

## 📐 Design Specifications

Based on Figma admin panel:
- Frame size: 1280 x 832px
- Typography: Modern sans-serif
- Color scheme: Light theme with brown accents
- Spacing: Consistent 8px grid
- Border radius: 4-16px range
- Shadows: Multi-layer with blur effects

## 🎨 Figma Integration

This dashboard was built using:
1. **Figma API**: Direct data extraction
2. **Design Tokens**: Auto-generated from Figma styles
3. **Component Mapping**: Figma frames → Angular components

Your Figma file: `CEsDhoAMxFi2vDpDmtyCTJ`

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup (if available)
- [Quick Start](QUICK_START.md) - 5-minute guide (if available)
- Component docs in each component's README

## 💡 Tips

1. **Navigation**: All sidebar links are active and routed
2. **Responsive**: Test on mobile/tablet using dev tools
3. **Dark Mode**: Ready to implement with CSS variables
4. **Accessibility**: Basic ARIA labels included

## 🐛 Troubleshooting

### Styles not loading
- Run `npm install` again
- Clear browser cache
- Check console for errors

### Build errors
- Delete `node_modules` and `.angular` cache
- Run `npm install` fresh
- Ensure Node.js 18+ is installed

## 📞 Support

Built with ❤️ from your Figma designs!

---

**Status**: ✅ Dashboard Complete
**Version**: 1.0.0
**Last Updated**: December 30, 2025
