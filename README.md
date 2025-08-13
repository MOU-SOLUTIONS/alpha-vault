# Alpha Vault

A **full-stack personal finance platform** built with **Spring Boot (Java)** and **Angular**, designed for tracking income, expenses, budgets, savings, debts, and investments — with powerful analytics and responsive UI.

---

## 📂 Project Structure
- **`/Backend`** → Spring Boot REST API
  - Modules: Income, Expense, Budget, Saving Goal, Debt (with payment history), Investment
  - JWT authentication (pre-wired), analytics endpoints (daily, weekly, monthly, yearly)
  - MySQL database integration
- **`/Frontend`** → Angular single-page application
  - Responsive dashboard with charts, tables, and filters
  - SEO-ready components, Bootstrap grid system
  - Parent→child data flow with OnPush change detection

---

## 🚀 Features
- **Authentication** → JWT-based secure login
- **Income & Expense Tracking** → CRUD + analytics
- **Budgeting** → Monthly budgets by category with remaining balance tracking
- **Saving Goals** → Progress bars, deadlines, priority indicators
- **Debt Management** → Track remaining amounts, due dates, interest
- **Investments** → Manual + dynamic (crypto, stocks, etc.)
- **Analytics** → Chart-ready data (category breakdowns, payment methods, top 5 lists)

---

## 🛠️ Tech Stack
**Backend:**
- Java 17, Spring Boot, Spring Data JPA, MySQL, JWT Security  
**Frontend:**
- Angular, RxJS, Bootstrap, Chart.js

---

## 📦 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/Alpha-vault.git
cd Alpha-vault
