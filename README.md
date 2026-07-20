# 💸 BudgetBuddy

### **"Track every rupee. Build smarter financial habits."**

BudgetBuddy is a modern, premium-quality personal finance and budget tracker designed to resemble high-end consumer products like Apple, Notion, Stripe, and CRED. It provides elegant visual typography, micro-animations, glassmorphic layout styles, and multi-dimensional insights completely offline.

---

## 🎨 Visual Themes & Typography

- **Deep Space Velvet (Default Dark)** and **Polar Ice (Light Mode)**
- **Colors**: Indigo `#4F46E5`, Emerald `#10B981`, Rose `#EF4444`, Amber `#F59E0B`, Dark Slate `#0F172A` / `#1E293B`
- **Fonts**: **Inter** (Body text) paired with **Space Grotesk** (Display headings) and **JetBrains Mono** (Statistical numbers)

---

## 🚀 Outstanding Key Features

### 1. Unified Dashboard
- Visual summary cards for Net Balance, Total Income, Total Expenses, and Monthly Savings Rate.
- Financial Health Score out of 100 with dynamic progress indicators.
- Interactive Smart Insights engine generating customized alerts (e.g., food overspend warnings, savings habits praise).
- Real-time month progress bar tracked against category budget boundaries.

### 2. Add / Edit Transaction Form
- Large floating trigger actions.
- Income vs Expense categorization with beautiful category badges.
- Fields: Amount, Title, Category, Date, Payment Method, Notes, and Recurring triggers.

### 3. Integrated Financial Instruments
- **Budget Planner**: Create and adjust spending limits for individual categories with immediate over-limit warnings.
- **Savings Goals**: Set goals for Laptop, Bike, Vacation, and Emergency Fund with progress bars and dynamic celebration animations.
- **Wishlist**: Track long-term aspirational purchases, prioritize, and click to automatically log purchase expenses.
- **EMI Scheduler**: Record loan/credit installations, set monthly due-dates, and mark items as paid.

### 4. Interactive Calendars & Visual Charts
- **Expense Calendar**: Highlighting daily spending footprints on a monthly grid. Click any date to examine its ledger.
- **Analytical Charts** powered by **Chart.js**:
  1. *Pie Chart*: Category Outflow Distribution.
  2. *Bar Chart*: Last 4 Months Income vs Expenses.
  3. *Line Chart*: 14-day Daily Outflow Trends.
  4. *Doughnut Chart*: Overall Budget Utilization.

### 5. Utilities & Settings
- **Currency Converter**: Supports ₹ (Rupee), $ (Dollar), and € (Euro).
- **Custom Quick Add**: Create one-click shortcuts (e.g. `+₹50 Tea`) to immediately log routine spending.
- **System Backups**: Export local data as structured JSON files, restore from JSON backups, or export transactions to Excel CSV spreadsheets.
- **Keyboard Shortcuts**:
  - `Ctrl + N`: Open Add Transaction Form
  - `Ctrl + F`: Jump focus to search filter box
  - `Esc`: Close active modals/dialogs

---

## 🏗️ Folder Structure

```
BudgetBuddy/
├── index.html                   # HTML Entry template (Vite injection)
├── metadata.json                # Project configuration metadata
├── package.json                 # Core dependencies (React, Vite, Tailwind v4, Chart.js)
├── src/
│   ├── main.tsx                 # Main client entry point
│   ├── index.css                # Global styles, fonts and Tailwind imports
│   ├── types.ts                 # Type definition interfaces
│   ├── initialData.ts           # Realistic default transaction profiles
│   ├── App.tsx                  # Primary workspace controller containing modals, tables, and tabs
│   └── components/
│       ├── CategoryIcons.tsx    # Category-to-Lucide icon matching engine
│       ├── FinanceCharts.tsx    # Chart.js canvasses registration and rendering
│       ├── DailySpendingAndInsights.tsx # Health scores and smart advice heuristic generators
│       ├── WishlistAndEMI.tsx   # Savings wishlist & monthly EMI scheduler
│       ├── FinanceCalendar.tsx  # Spending heatmaps calendar
│       ├── GoalsTracker.tsx     # Goal targets and deposits manager
│       └── BudgetPlanner.tsx    # Monthly spend limits and thresholds
```

---

## 🛠️ Technologies Used

- **Framework**: React (Vite-bundler)
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Animation**: Native CSS transitions, glassmorphic layout accents
- **Visualization**: Chart.js v4 (Canvas rendering)
- **Persistence**: Browser LocalStorage

---

## 🌟 Future Enhancements

1. **OCR Receipts Reader**: Instantly snap a picture of invoices to extract details using client-side vision APIs.
2. **Category Auto-Tagging**: Utilize lightweight NLP heuristics to automatically categorize transactions based on title keywords.
3. **Multi-device P2P Syncing**: Introduce secure client-side WebRTC replication to synchronize ledgers across desktop and mobile.

---

## 👤 Author
Developed with ❤️ by Javeriya Jamadar.
