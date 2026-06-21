# TDG Billing System — Walkthrough

## Overview

**TDG (Ten Dens Gyros) Billing System** is a full restaurant chain management platform with two interfaces:

- **Web App** (React + Vite) — Staff-facing: POS, Kitchen Display, Billing, Inventory, HR, Reports, etc.
- **Mobile App** (Flutter) — Customer-facing: Loyalty, ordering, wallet, den/team

Both share the **same backend** (Express + Socket.IO on port 3001).

---

## How to Run

```bash
# Install dependencies
npm install

# Run both server + frontend
npm run dev

# Or run separately:
npm run server    # Express backend → http://localhost:3001
npm run client    # Vite dev server  → http://localhost:3000
```

---

## Web App (Staff)

### Login
- Navigate to `http://localhost:3000/login` (or `/` redirects if not logged in)
- Enter any 4-digit PIN. Demo users: `1111` (Admin), `2222` (Captain), `3333` (Kitchen)
- PINs authenticate to roles which determine available sidebar nav items

### Navigation — Sidebar (14 modules)

| Module | Route | Purpose |
|---|---|---|
| **Dashboard** | `/dashboard` | Revenue charts, order trends, hourly sales, category/source breakdown |
| **POS** | `/pos` | Place dine-in/takeaway/delivery orders. Browse 9 categories, cart, cash/card/UPI/wallet payment |
| **Captain** | `/captain` | Table management, assign servers, bill requests |
| **KOT** | `/kot` | Kitchen Order Tickets — auto-print, priority sorting, bumping |
| **Kitchen** | `/kitchen` | Real-time display via WebSocket — shows incoming orders by status |
| **Billing** | `/billing` | Generate bills from ready KOTs, process payments, print receipts |
| **Online Orders** | `/online-orders` | Swiggy/Zomato/Zepto orders — accept, prepare, mark dispatched |
| **Menu** | `/menu` | CRUD menu items (54 items, 9 categories), recipes with ingredient mapping + cost calculator |
| **Purchase** | `/purchase` | Suppliers, Purchase Orders (PO), Goods Receipt Notes (GRN) |
| **Inventory** | `/inventory` | Stock tracking, low-stock alerts, restock, stock movement history |
| **HR** | `/hr` | Staff management, attendance, shifts, tasks, targets, milestones |
| **Customers** | `/customers` | Customer loyalty profiles, tier progression, points history |
| **Loyalty** | `/loyalty` | Ruby points system — tiers, dens (teams), referrals, points transfer/redeem |
| **Reports** | `/reports` | KOT report, Bill report, Food costing, consumption, stock reports |

### Key Workflows

**POS → Kitchen → Billing:**
1. **POS** takes order → emits `kot:created` via WebSocket
2. **Kitchen** receives real-time KOT → cooks → bumps when ready
3. **Billing** shows ready KOTs → generates bill → processes payment

**Order lifecycle:** `pending` → `preparing` → `ready` → `served`

### Real-time
- Socket.IO enables instant KOT delivery to Kitchen Display
- Kitchen bumps trigger `kot:bumped` event → Billing page updates automatically

---

## Mobile App (Customer — Flutter)

Located in `ttt/` directory. Built with Flutter.

### Features

| Screen | Purpose |
|---|---|
| **Onboarding/Login** | Sign up with email/phone + password, or login |
| **Home** | Category grid, popular items, quick-access to wallet/offers/den/referral |
| **Menu** | Browse by category, add to cart |
| **Cart/Checkout** | Promo codes, delivery fees, wallet or cash payment |
| **Orders** | Order history with status filters |
| **Wallet** | Ruby (loyalty points) balance, scratch card mini-game, transaction history, buy rubies |
| **Den** | Team-based loyalty (max 10 members), den levels, Pride Lion bonus |
| **Referral** | Share referral code — referrer gets 50 Ruby, referral gets 25 Ruby |
| **Offers** | Promotional deals |
| **Notifications** | In-app notification inbox |
| **Profile** | Edit profile, payment methods, team, orders, help/support, terms |

### Loyalty System

- **Ruby points** earned via purchases, referrals, account bonus (400 for first 1000 users)
- **Tiers:** Bronze → Silver → Gold → Platinum → Diamond → Emerald (Ruby Crown at 25,000 points)
- **Dens:** Create or join a team of up to 10 members — collective progress unlocks den levels
- **Transfer:** Send points to other users (max 200 per transfer)
- **Redeem:** Minimum 3,000 points, redeemable in multiples of 100

---

## API Endpoints

All routes served by the single Express server at `http://localhost:3001`.

### General
- `GET /` — API info
- `GET /health` — Health check

### Menu
- `GET /api/menu/categories` — All categories
- `GET /api/menu/items?categoryId=` — Items by category
- `GET /api/menu` — Mobile format (categories + items combined)

### POS Orders (no auth)
- `GET /api/pos/orders?status=&source=` — List orders
- `POST /api/pos/orders` — Create order
- `PATCH /api/pos/orders/:id/status` — Update status

### Inventory
- `GET /api/inventory` — Stock list
- `PATCH /api/inventory/:id` — Update stock
- `POST /api/recipes/deduct` — Deduct ingredients

### Loyalty (by phone, in-memory)
- `POST /api/loyalty/register` — Register with optional referral
- `GET /api/loyalty/user/:phone` — Get user
- `GET /api/loyalty/profile/:phone` — Full profile + tier
- `POST /api/loyalty/den/create` — Create den
- `POST /api/loyalty/den/join` — Join den by code
- `POST /api/loyalty/points/transfer` — Transfer points
- `POST /api/loyalty/points/redeem` — Redeem points
- `GET /api/loyalty/points/history/:phone` — Transaction history

### Mobile App Auth (JWT required)
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile
- `PUT /api/auth/profile` — Update profile

### Mobile Wallet/Den/Orders (JWT required)
- `GET /api/wallet` — Balance + scratch cards + transactions
- `POST /api/wallet/scratch` — Claim a scratch card
- `POST /api/wallet/add` — Add rubies
- `GET /api/den` — Den progress
- `GET /api/orders` — User's orders
- `POST /api/orders` — Place order (supports wallet payment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router 6 + Zustand + Framer Motion + Recharts |
| Backend | Express 4 + Socket.IO |
| Mobile | Flutter (Dart) |
| Build | Vite |
| Auth | JWT (mobile), PIN-based (staff web) |
| State | Zustand with localStorage persistence |
| Real-time | Socket.IO (KOT flow, kitchen display) |
| Offline | Service Worker + pending request queue |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Project Structure

```
├── server/index.js          # Express + Socket.IO backend
├── src/
│   ├── App.jsx              # Router + auth guard
│   ├── main.jsx             # Entry point
│   ├── index.css            # Global styles
│   ├── components/          # Layout, UI kit (Button, Card, Modal, Toaster)
│   ├── pages/               # 16 page modules
│   ├── stores/              # 4 Zustand stores
│   └── lib/                 # API config, socket, print service
├── ttt/                     # Flutter mobile app (20 screens)
├── index.html               # Vite entry
├── vite.config.js
├── package.json
└── vercel.json / railway.json
```
