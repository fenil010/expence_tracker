# 💎 Premium Expense Tracker

A beautiful, Apple-inspired expense tracking web application built with React and Tailwind CSS. Features a clean, minimal design with Bento-style layouts, smooth animations, and a production-ready interface.

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?style=flat&logo=vite)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat)

</div>

---

## ✨ Features

### 🎨 **Premium Design System**
- **Apple-Inspired Aesthetics** — Clean, minimal, and elegant design language
- **Glass Morphism** — Subtle backdrop blur and translucent surfaces
- **Bento-Style Layout** — Modern card-based grid system
- **Premium Typography** — SF Pro Display / Inter with perfect hierarchy
- **Calm Color Palette** — Neutral grays with soft accent colors
- **Smooth Micro-interactions** — 150-250ms transitions for delightful UX

### 📊 **Dashboard Components**

#### **Summary Cards** (Bento Style)
- 💰 **Total Balance** — Current account balance with trend indicators
- 📈 **Monthly Income** — Total income with growth percentage  
- 📊 **Monthly Expenses** — Spending overview with trend
- 🎯 **Savings** — Income minus expenses calculation

#### **Financial Insights**
- 📉 **Monthly Spending Chart** — Bar chart showing 6-month spending trend
- 🍰 **Category Distribution** — Donut chart breaking down expenses by category
- 📝 **Transaction List** — Recent 8 transactions with category icons
- 🎯 **Savings Goals** — Progress bars for financial goals

#### **Premium UI Elements**
- 🧭 **Top Navigation** — Logo, month selector, user profile
- ➕ **Add Expense Modal** — Apple-style modal with smooth animations
- 🏷️ **Category Icons** — Emoji-based category visualization
- ✨ **Hover States** — Subtle lift and shadow effects
- 🪟 **Glass Cards** — Frosted glass effect with soft shadows

---

## 🎯 Design Principles

### **Visual Hierarchy**
```
Headings:    font-semibold (600) + tight letter-spacing
Body Text:   font-medium (500) + normal weight
Labels:      font-medium (500) + smaller size
```

### **Color System**
```css
Neutrals:    50-900 grayscale palette
Accent:      Violet/Blue (#5c7cfa)
Success:     Emerald green (#10b981)
Error:       Rose red (#f43f5e)
```

### **Spacing & Layout**
```
Cards:       rounded-2xl (20px)
Padding:     p-6 (24px) standard
Gaps:        gap-6 (24px) between components
Max Width:   max-w-7xl (1280px) container
```

### **Shadows**
```
shadow-sm:   Light shadow for cards at rest
shadow-md:   Enhanced shadow on hover
shadow-lg:   Deep shadow for modals
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2 | UI framework (functional components + hooks) |
| **Tailwind CSS** | 4.x | Utility-first styling with custom design tokens |
| **Recharts** | 2.8 | Beautiful, responsive chart components |
| **Vite** | 7.x | Lightning-fast dev server and build tool |
| **LocalStorage** | — | Client-side data persistence (no backend) |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Top navigation bar
│   │   ├── SummaryCards.jsx        # 4 metric summary cards
│   │   ├── ExpenseList.jsx         # Recent transactions list
│   │   ├── SpendingChart.jsx       # Monthly spending bar chart
│   │   ├── CategoryChart.jsx       # Category donut chart
│   │   ├── SavingsGoals.jsx        # Goal progress component
│   │   └── AddExpenseModal.jsx     # Add transaction modal
│   ├── pages/
│   │   └── Dashboard.jsx           # Main dashboard layout
│   ├── hooks/
│   │   └── useExpenseData.js       # Data management hook
│   ├── data/
│   │   ├── schema.js               # Data models + defaults
│   │   └── storage.js              # LocalStorage utilities
│   ├── utils/
│   │   └── helpers.js              # Helper functions (format, icons)
│   ├── App.jsx                     # Root component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles + Tailwind
├── public/                         # Static assets
├── tailwind.config.js              # Custom design tokens
├── vite.config.js                  # Vite configuration
└── package.json                    # Dependencies
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn

### **Installation**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### **Build for Production**

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 💡 Usage

### **Adding Transactions**
1. Click the **"+ Add Expense"** button in the top navigation
2. Choose transaction type: **Expense** or **Income**
3. Enter **amount**, select **category**, add **description**
4. Click **"Add Transaction"** to save

### **Data Persistence**
- All data is stored in browser **LocalStorage**
- Data persists across sessions and page refreshes
- Clear browser data to reset the app

### **Mock Data**
The app comes pre-loaded with realistic demo transactions for **January-February 2026**, including:
- Salary income
- Grocery expenses
- Transportation costs
- Entertainment subscriptions
- And more...

---

## 🎨 Design Highlights

### **Bento Grid Layout**
- Responsive card-based design
- Asymmetric grid for visual interest
- Whitespace as a design feature

### **Typography**
- Font stack: `SF Pro Display → Inter → system-ui`
- Negative letter-spacing on headings for tighter look
- Clear hierarchy with size and weight

### **Color Usage**
- High contrast for accessibility (WCAG AA compliant)
- Subtle accent color (blue/violet) for CTAs
- Neutral grayscale foundation
- Semantic colors for income (green) / expense (neutral)

### **Animations**
- **Card hover**: `translate-y` + enhanced shadow
- **Modal**: fade-in + zoom-in effect
- **Button press**: scale down on active
- **All transitions**: 150-250ms for snappy feel

---

## 🔧 Customization

### **Change Accent Color**
Edit `tailwind.config.js`:
```js
accent: {
  500: '#5c7cfa', // ← Change this hex value
  600: '#4263eb',
  // ...
}
```

### **Modify Card Shadows**
Edit `src/index.css`:
```css
.card {
  @apply shadow-sm; /* Change to shadow-md or shadow-lg */
}
```

### **Update Mock Data**
Edit `src/data/schema.js` — modify the `DEFAULT_DATA` object

---

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| **Desktop** (1280px+) | Full 3-column layout with sidebar |
| **Tablet** (768px-1279px) | 2-column adaptive grid |
| **Mobile** (< 768px) | Single column stack |

---

## 🎭 Component API Reference

### **SummaryCards**
```jsx
<SummaryCards 
  balance={28750}
  income={13200} 
  expenses={3453}
  savings={9747}
/>
```

### **ExpenseList**
```jsx
<ExpenseList transactions={transactionArray} />
```

### **AddExpenseModal**
```jsx
<AddExpenseModal
  isOpen={true}
  onClose={() => setShowModal(false)}
  onAdd={(transaction) => handleAdd(transaction)}
/>
```

### **SpendingChart**
```jsx
<SpendingChart /> 
// Uses internal mock data for 6-month trend
```

### **CategoryChart**
```jsx
<CategoryChart transactions={transactionArray} />
// Automatically calculates top 6 categories
```

---

## 🏆 Best Practices Implemented

✅ Clean component separation  
✅ Reusable utility functions  
✅ Semantic HTML5  
✅ Accessible color contrast  
✅ Smooth 60fps animations  
✅ Production-ready code quality  
✅ No console errors or warnings  
✅ Consistent naming conventions  
✅ JSDoc type definitions  

---

## 📝 Roadmap & Future Enhancements

- [ ] 🌙 Dark mode toggle
- [ ] 📅 Date range filtering
- [ ] 📤 Export to CSV/PDF
- [ ] 🔔 Budget alerts and notifications
- [ ] 💱 Multi-currency support
- [ ] 🔁 Recurring transactions
- [ ] 🔌 Backend API integration
- [ ] 🔐 User authentication
- [ ] 📊 Advanced analytics dashboard
- [ ] 📱 Mobile app (React Native)

---

## 📸 Screenshots

### Dashboard Overview
Clean, minimal interface with Bento-style cards and intuitive navigation.

### Add Expense Modal
Apple-inspired modal with smooth animations and form validation.

### Charts & Insights
Beautiful charts powered by Recharts with custom tooltips.

---

## 🙏 Credits & Inspiration

Design inspiration from:
- **Apple** — Design Guidelines & Human Interface
- **Linear.app** — Clean, modern SaaS UI
- **Stripe Dashboard** — Financial dashboard patterns
- **Notion** — Minimal, elegant interfaces
- **Dribbble.com** — Premium design shots

---

## 📄 License

This project is open source and available under the **MIT License**.

---

## 👨‍💻 Developer

Built with ❤️ using **React**, **Tailwind CSS**, and modern design principles.

**Happy expense tracking! 💸**

