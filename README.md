# FleetFlow - Fleet & Logistics Management

FleetFlow is a comprehensive, production-ready Fleet & Logistics Management dashboard. It handles real-time vehicle registries, personnel compliance tracking, and an automated rule-based trip dispatching engine.

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Distinct dashboards, actions, and features restricted conditionally per user:
  - **Fleet Manager:** Global access to analytics, asset creation, personnel onboarding, and dispatch rules.
  - **Dispatcher:** Unrestricted access to coordinate active trips and assign routes.
  - **Safety Officer:** Audits human resource compliance, license expirations, and safety scores.
  - **Financial Analyst:** Read-only access to ROI, fuel expenses, and cost-basis analysis.
- **Trip Dispatcher Engine:** Automated safety constraints block route assignment if a vehicle is overloaded or if a driver's commercial license is EXPIRED.
- **Asset Registration:** Complete CRUD management for your vehicles (Vans, Box-Trucks, Heavy-duty Trucks) with automated status adjustments and odometer telemetry tracking.
- **Human Resources & Compliance:** Interactive toggle module for personnel statuses (On Duty, Off Duty, Suspended) mixed with auto-calculating Safety Scores upon trip completion.

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **Authentication:** NextAuth.js (v5 beta) with Credentials and Prisma Adapter
- **Database:** PostgreSQL (neon.tech) managed via Prisma ORM
- **Styling:** Tailwind CSS v4 & generic CSS modules
- **Animations:** Framer Motion
- **Icons:** Lucide-React

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database URL

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd fleetflow
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
# Your postgres database url
DATABASE_URL="postgresql://user:password@host:port/database"

# Needed for NextAuth cryptographic signing
AUTH_SECRET="your-super-secret-key-at-least-32-chars"
```

### 3. Database Sync & Generation
Push the Prisma schema to the database and generate the Prisma client:
```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Strategy
You can seed basic dummy data or use the UI to manually register initial `Admin` credentials. (An initialization script can be created and run if desired). 

### 5. Running the Application
Spin up the local development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## 📝 License
This project is for demonstration and production deployment under standard commercial operating procedures.
