# TDG-Billing - Restaurant Chain Management System

## Concept & Vision

A sleek, fast-paced POS and restaurant management system inspired by KFC's operational efficiency. The interface channels the energy of a busy kitchen — bold typography, high-contrast visuals, and intuitive touch targets designed for rapid service. Every interaction feels responsive and purposeful, with real-time sync between front-of-house, kitchen, and management.

---

## Design Language

### Aesthetic Direction
**Industrial Fast-Food Modern** — Clean surfaces with bold accent colors, card-based layouts with subtle depth, and a dark theme for reduced eye strain during long shifts. Think: digital command center meets friendly fast-service counter.

### Color Palette (Light Theme)
```css
:root {
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-elevated: #f1f3f5;
  
  --accent-primary: #e63946;      /* KFC Red - primary actions */
  --accent-secondary: #f4a261;    /* Warm orange - highlights */
  --accent-success: #2a9d8f;     /* Teal - completed/available */
  --accent-warning: #e9c46a;     /* Yellow - pending/attention */
  --accent-info: #4895ef;        /* Blue - info/kitchen */
  
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a68;
  --text-muted: #9090a0;
  
  --border: #e5e5eb;
  --shadow: rgba(0, 0, 0, 0.08);
}
```

### Typography
- **Headings**: `'Bebas Neue', Impact, sans-serif` — Bold, industrial feel
- **UI/Body**: `'Inter', -apple-system, sans-serif` — Clean readability
- **Monospace** (KOT numbers, codes): `'JetBrains Mono', monospace`

### Spatial System
- Base unit: 8px
- Touch targets: minimum 48px (mobile), 40px (desktop)
- Card padding: 16px-24px
- Section gaps: 24px-32px
- Border radius: 8px (cards), 4px (buttons), 12px (modals)

### Motion Philosophy
- **Instant feedback**: Button press scales to 0.97, 100ms
- **Order entries**: Slide in from right, 200ms ease-out
- **Status changes**: Color pulse animation, 300ms
- **KOT cards**: Shake animation for urgent orders
- **Notifications**: Slide down from top, spring physics

### Visual Assets
- **Icons**: Lucide React (consistent stroke width: 2px)
- **Food images**: Placeholder system with category colors
- **Decorative**: Subtle grid patterns on backgrounds, glowing accents on active states

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPS                               │
├──────────┬──────────┬──────────┬──────────┬────────────────────┤
│   POS    │ Kitchen  │  Self    │  Owner   │   Mobile KOT       │
│  Counter │  Display │ Ordering │Dashboard │   (Kitchen)        │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────────┬───────────┘
     │          │          │          │               │
     └──────────┴──────────┴──────────┴───────────────┘
                            │
                    ┌───────▼───────┐
                    │   REST API    │
                    │  (Express.js) │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │  SQLite   │ │ WebSocket │ │   File    │
        │  Database │ │   Server  │ │  Storage  │
        └───────────┘ └───────────┘ └───────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│    Swiggy     │   │    Zomato     │   │   Own Website │
│   Partner     │   │   Partner     │   │    Ordering   │
│   Portal      │   │   Portal      │   │    Portal     │
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                    Webhook Events
```

---

## Data Models

### 1. Category
```typescript
{
  id: string;
  name: string;
  displayOrder: number;
  color: string;
  icon: string;
  isActive: boolean;
}
```

### 2. MenuItem
```typescript
{
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
  prepTime: number; // minutes
  variants: Variant[];
  addOns: AddOn[];
}
```

### 3. Variant
```typescript
{
  id: string;
  name: string;
  priceModifier: number;
}
```

### 4. AddOn
```typescript
{
  id: string;
  name: string;
  price: number;
}
```

### 5. Order
```typescript
{
  id: string;
  orderNumber: number;
  type: 'dine-in' | 'takeaway' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  source: 'pos' | 'kiosk' | 'online';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  tableNumber: string | null;
  customerName: string | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
```

### 6. OrderItem
```typescript
{
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  variantId: string | null;
  variantName: string | null;
  addOns: { id: string; name: string; price: number }[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  notes: string;
}
```

### 7. InventoryItem
```typescript
{
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  reorderLevel: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: Date;
}
```

### 8. InventoryTransaction
```typescript
{
  id: string;
  inventoryItemId: string;
  type: 'stock-in' | 'stock-out' | 'adjustment';
  quantity: number;
  reason: string;
  createdAt: Date;
  createdBy: string;
}
```

### 9. User
```typescript
{
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'kitchen';
  pin: string;
  isActive: boolean;
}
```

### 10. Online Order
```typescript
{
  id: string;
  externalOrderId: string;      // From aggregator
  aggregator: 'swiggy' | 'zomato' | 'zepto' | 'direct';
  orderId: string;             // Internal order ID (links to Order)
  platformStatus: 'received' | 'accepted' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
  estimatedTime: number;        // minutes
  actualDeliveryTime: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  aggregatorCommission: number;
  deliveryFee: number;
  packagingFee: number;
  rawPayload: object;          // Full webhook payload
  createdAt: Date;
  updatedAt: Date;
}
```

### 11. Aggregator Configuration
```typescript
{
  id: string;
  name: 'swiggy' | 'zomato' | 'zepto' | 'direct';
  displayName: string;
  isActive: boolean;
  apiKey: string | null;
  apiSecret: string | null;
  storeId: string | null;
  webhookSecret: string | null;
  autoAcceptOrders: boolean;
  defaultPrepTime: number;     // minutes
  menuMappings: MenuMapping[];
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 12. Menu Mapping
```typescript
{
  id: string;
  aggregatorId: string;
  internalItemId: string;
  externalItemId: string;
  externalItemName: string;
  priceOverride: number | null;
  isAvailable: boolean;
}
```

### 13. KOT (Kitchen Order Ticket)
```typescript
{
  id: string;
  orderId: string;
  orderNumber: string;
  items: KOTItem[];
  priority: 'normal' | 'rush';
  status: 'new' | 'acknowledged' | 'in-progress' | 'ready';
  createdAt: Date;
  acknowledgedAt: Date | null;
  completedAt: Date | null;
}
```

---

## Application Screens

### 1. POS (Point of Sale) - `/pos`

**Purpose**: Primary billing interface for counter staff

**Layout**:
- Left sidebar (20%): Category list with icons
- Center (55%): Menu items grid (4 columns)
- Right panel (25%): Current order with running total

**Features**:
- Quick category switching with visual feedback
- Menu items show: image, name, price, availability badge
- Tap item → adds to order (with quantity if already exists)
- Long press → shows variants/add-ons modal
- Swipe left on item → remove from order
- Tap quantity → increment/decrement
- Order panel shows: items list, subtotal, tax (18% GST), discount field, total
- Payment buttons: Cash, Card, UPI, Wallet
- Order type toggle: Dine-In, Takeaway, Delivery
- Table number input for dine-in
- Hold Order / Recall Order functionality
- Quick actions bar: New Order, Hold, Recall, End Day

**States**:
- Item unavailable: Greyed out with "Unavailable" badge
- Order empty: Large "+" icon with "Start a new order" text
- Processing payment: Spinner overlay with "Processing..."

---

### 2. Kitchen Display System (KDS) - `/kitchen`

**Purpose**: Digital order display for kitchen staff

**Layout**:
- Full-screen dark theme
- Header: Current time, active order count, average wait time
- Orders displayed as cards in a 3-4 column grid (responsive)
- Each card: Order number (large), items list, time elapsed, status badge

**Features**:
- Real-time order updates via WebSocket
- Auto-sort by: time elapsed (oldest first)
- Color-coded urgency:
  - Green: 0-5 min
  - Yellow: 5-10 min
  - Red: 10+ min (pulsing)
- Tap card → expands to show full details
- Swipe/button to mark item ready
- Bump (complete) entire order
- Rush order highlighting
- Sound notifications for new orders
- Filter: All | In Progress | Ready

**Animations**:
- New order: Slides in from right with attention sound
- Urgent order: Subtle pulse/glow
- Completed order: Slides out left

---

### 3. Mobile KOT - `/kot`

**Purpose**: Tablet/mobile interface for kitchen staff

**Layout**:
- Single-column list optimized for touch
- Large touch targets (56px minimum)
- Bottom action bar: Bump, Rush, Recalc
- Top status bar: Connection status, order count

**Features**:
- Simplified item list with checkboxes
- Tap item → toggle served status
- All items checked → auto-bump option
- Offline-capable with sync
- Voice-ready (future)

---

### 4. Self-Ordering Kiosk - `/kiosk`

**Purpose**: Customer-facing self-service ordering

**Layout**:
- Full-screen, no browser chrome (kiosk mode)
- Large category icons at top
- Menu items in 2-3 column grid with large images
- Cart preview (collapsed) at bottom-right
- Progress indicator showing order steps

**Flow**:
1. Welcome screen with "Start Order" button
2. Category selection
3. Item selection with customization
4. Cart review
5. Customer details (optional: name for order)
6. Payment selection
7. Order confirmation with number
8. Auto-reset to welcome after 30 seconds

**Features**:
- Large touch targets (64px buttons)
- High contrast for visibility
- Audio feedback on interactions
- Upsell suggestions ("Add a drink?")
- Combo meal highlights
- Customization modals with clear options
- Order number display (large, repeating)

---

### 5. Online Ordering Portal - `/online-orders`

**Purpose**: Central hub for managing orders from Swiggy, Zomato, and other aggregators

**Layout**:
- Header: Aggregator logos (Swiggy/Zomato) with status indicators
- Left panel: Real-time order feed (newest first)
- Center: Selected order details
- Right panel: Quick actions and order history

**Features**:
- **Unified Inbox**: All aggregator orders in single feed
- **Auto-Print KOT**: Automatic kitchen ticket on new order
- **One-Click Accept**: Accept order with prep time suggestion
- **Menu Mapping**: Map aggregator items to internal menu
- **Price Sync**: Sync prices across platforms
- **Availability Toggle**: Mark items unavailable across all platforms
- **Commission Tracking**: Track per-order aggregator fees
- **Auto-Status Update**: Sync status changes to aggregators
- **Sound Alerts**: Audio notification for new online orders

**Aggregator Status Badges**:
- Swiggy: Orange (#ff5200)
- Zomato: Red (#e23744)
- Zepto: Purple (#9d2b6b)
- Direct (Own Website): Blue (#4895ef)

---

### 6. Owner's Dashboard - `/dashboard`

**Purpose**: Business analytics and management

**Layout**:
- Sidebar navigation: Overview, Orders, Inventory, Staff, Online, Settings
- Main content area with date range selector
- Cards with key metrics at top
- Charts and tables below

**Sections**:

**Overview**:
- Today's sales (vs yesterday, % change)
- Orders count (split: POS vs Online)
- Average order value
- Top selling items (bar chart)
- Sales by hour (line chart)
- Sales by category (pie chart)
- Sales by source (POS / Swiggy / Zomato)
- Active orders status

**Orders**:
- Filterable/sortable table (all sources)
- Export to CSV
- Order details modal
- Refund functionality
- Link to original aggregator order

**Online Aggregators**:
- Platform performance comparison
- Commission breakdown by aggregator
- Order volume trends per platform
- Menu sync status
- Price mismatch alerts

**Inventory**:
- Stock levels with visual indicators
- Low stock alerts
- Restock history
- Cost analysis
- Supplier list

**Staff**:
- User list with roles
- Activity log
- Shift summary

**Settings**:
- Menu item management (CRUD)
- Category management
- Tax rates
- Business info
- KOT settings
- Aggregator credentials

### 7. Purchase Module - `/purchase`

**Purpose**: Manage suppliers and purchase orders

**Features**:
- Supplier directory with contact info, ratings
- Create and manage purchase orders
- Track order status (pending, approved, ordered, delivered)
- Supplier performance tracking
- Quick reorder functionality

**Components**:
- Stats cards (total orders, pending, delivered, total value)
- Purchase orders table with status badges
- Supplier cards grid with ratings
- Add supplier/PO modals

### 8. Inventory Module - `/inventory`

**Purpose**: Track and manage inventory stock levels

**Features**:
- Real-time stock level monitoring
- Low stock alerts with configurable thresholds
- Stock transaction history
- Restock functionality
- Category-wise organization
- Stock value calculation

**Components**:
- Stock level cards with progress bars
- Low stock alerts table
- Transaction history log
- Restock modal

### 9. HR Module - `/hr`

**Purpose**: Staff management, attendance, and shift scheduling

**Features**:
- Staff directory with profiles
- Role-based access (manager, cashier, kitchen)
- Daily attendance tracking
- Shift management (morning, afternoon, night)
- Weekly schedule planner
- Performance metrics

**Components**:
- Staff profile cards with ratings
- Attendance table with mark present/absent
- Shift schedule cards
- Weekly schedule grid

---

## API Endpoints

### Menu
- `GET /api/categories` - List all categories
- `GET /api/menu-items` - List all menu items
- `GET /api/menu-items/:id` - Get single item
- `POST /api/menu-items` - Create item
- `PUT /api/menu-items/:id` - Update item
- `DELETE /api/menu-items/:id` - Delete item
- `PATCH /api/menu-items/:id/availability` - Toggle availability

### Orders
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update status
- `POST /api/orders/:id/payment` - Process payment
- `POST /api/orders/:id/refund` - Refund order

### KOT
- `GET /api/kot` - Get active KOTs
- `POST /api/kot` - Create KOT from order
- `PATCH /api/kot/:id/status` - Update KOT status
- `PATCH /api/kot/:id/priority` - Set priority

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update item
- `POST /api/inventory/:id/restock` - Restock item
- `GET /api/inventory/alerts` - Low stock alerts

### Analytics
- `GET /api/analytics/sales` - Sales data
- `GET /api/analytics/top-items` - Top selling
- `GET /api/analytics/hourly` - Hourly breakdown

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `POST /api/users/login` - Staff login

### Online Aggregators
- `GET /api/aggregators` - List configured aggregators
- `POST /api/aggregators` - Configure new aggregator
- `PUT /api/aggregators/:id` - Update aggregator settings
- `DELETE /api/aggregators/:id` - Remove aggregator
- `GET /api/aggregators/orders` - List online orders (with filters)
- `GET /api/aggregators/orders/:id` - Get online order details
- `POST /api/aggregators/webhook/:aggregator` - Webhook receiver
- `POST /api/aggregators/:id/sync-menu` - Sync menu with aggregator
- `GET /api/aggregators/:id/menu-mappings` - Get item mappings
- `POST /api/aggregators/:id/menu-mappings` - Set item mapping
- `PATCH /api/aggregators/:id/items/:itemId/availability` - Toggle item availability
- `POST /api/aggregators/:id/accept/:orderId` - Accept order
- `POST /api/aggregators/:id/decline/:orderId` - Decline order
- `PATCH /api/aggregators/:id/status/:orderId` - Update order status
- `POST /api/aggregators/:id/cancel/:orderId` - Cancel order
- `GET /api/aggregators/analytics` - Aggregator performance analytics
- `GET /api/aggregators/health` - Check aggregator connections

### Own Website Ordering (Direct)
- `GET /api/direct-orders/menu` - Public menu (limited info)
- `POST /api/direct-orders` - Create direct order
- `GET /api/direct-orders/:id` - Get order status
- `POST /api/direct-orders/:id/cancel` - Cancel order

### WebSocket Events
- `order:created` - New order placed (POS or online)
- `order:updated` - Order status changed
- `online-order:new` - New aggregator order received
- `online-order:status` - Aggregator order status update
- `kot:created` - New KOT generated
- `kot:updated` - KOT status changed
- `menu:updated` - Menu item changed
- `aggregator:connected` - Aggregator connection status
- `aggregator:disconnected` - Aggregator connection lost

---

## Component Inventory

### Core Components

**Button**
- Variants: primary, secondary, ghost, danger
- Sizes: sm (32px), md (40px), lg (48px), xl (56px)
- States: default, hover (brightness +10%), active (scale 0.97), disabled (opacity 0.5), loading (spinner)

**Card**
- Background: var(--bg-card)
- Border: 1px solid var(--border)
- Shadow: 0 4px 12px var(--shadow)
- States: default, hover (border-color accent), selected (accent border + glow)

**MenuItem Card**
- 1:1 aspect ratio image area
- Name (Bebas Neue, 18px)
- Price (Inter bold, 16px, accent)
- Availability badge (corner)
- States: default, unavailable (greyed), selected (accent border)

**OrderItem Row**
- Item name, quantity badge, price
- Variant/add-on chips
- Notes indicator
- Swipe-to-delete gesture

**KOT Card**
- Large order number (Bebas Neue, 48px)
- Time elapsed (monospace, color-coded)
- Items list with checkboxes
- Priority badge (rush = red)
- Status progress bar

**Category Tab**
- Icon + name
- Active state: accent background, white text
- Inactive: transparent, muted text

**Modal**
- Centered, max-width 480px
- Dark overlay (rgba(0,0,0,0.8))
- Slide + fade animation
- Close on overlay click or X button

**Toast Notifications**
- Position: top-right
- Auto-dismiss: 4 seconds
- Types: success (green), error (red), warning (yellow), info (blue)
- Slide-in animation

**Data Table**
- Sortable columns
- Pagination
- Row hover highlight
- Action buttons per row
- Empty state with icon

**Stat Card (Dashboard)**
- Icon, label, value
- Trend indicator (+/-%)
- Comparison text
- Background gradient option

**Online Order Card**
- Aggregator badge (colored logo)
- Order number (large, monospace)
- Customer name and phone
- Items summary (count + total)
- Time elapsed since received
- Prep time estimate
- Status badge with platform color
- Action buttons: Accept, View Details, Cancel
- States: new (pulsing), accepted, preparing, ready, delivered, cancelled

**Aggregator Status Indicator**
- Connected: Green dot + "Connected"
- Disconnected: Red dot + "Disconnected"
- Syncing: Yellow dot + spinning icon
- Shows last sync time on hover

**Menu Mapping Row**
- Internal item name
- Arrow indicator
- External item ID/Name
- Price override input
- Availability toggle
- Sync status icon

---

## Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router v6** for navigation
- **Zustand** for state management
- **Socket.io Client** for real-time
- **Recharts** for dashboard charts
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **SQLite** with better-sqlite3 (synchronous, fast)
- **Socket.io** for WebSocket
- **uuid** for ID generation
- **cors** for cross-origin

### Project Structure
```
TDG-Billing/
├── server/
│   ├── index.js              # Express server + Socket.io
│   ├── db.js                 # SQLite setup + queries
│   ├── routes/
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── inventory.js
│   │   ├── users.js
│   │   ├── aggregators.js    # Online aggregator integration
│   │   ├── webhooks.js       # Webhook handlers
│   │   └── analytics.js
│   ├── services/
│   │   ├── swiggy.js         # Swiggy API integration
│   │   ├── zomato.js         # Zomato API integration
│   │   └── aggregator.js     # Generic aggregator service
│   ├── middleware/
│   │   ├── auth.js
│   │   └── webhookVerify.js  # Webhook signature verification
│   └── seed.js               # Sample data
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── stores/
│   │   ├── orderStore.js
│   │   ├── menuStore.js
│   │   ├── onlineOrderStore.js
│   │   └── aggregatorStore.js
│   ├── components/
│   │   ├── ui/               # Button, Card, Modal, etc.
│   │   ├── pos/              # POS-specific components
│   │   ├── kitchen/          # KDS components
│   │   ├── online/           # Online order components
│   │   └── dashboard/        # Dashboard components
│   ├── pages/
│   │   ├── POS.jsx
│   │   ├── Kitchen.jsx
│   │   ├── KOT.jsx
│   │   ├── Kiosk.jsx
│   │   ├── OnlineOrders.jsx   # Aggregator order management
│   │   ├── Dashboard.jsx
│   │   └── Settings.jsx
│   └── lib/
│       ├── socket.js
│       └── api.js
├── public/
│   ├── swiggy-badge.svg
│   ├── zomato-badge.svg
│   └── zepto-badge.svg
├── package.json
├── vite.config.js
└── SPEC.md
```

---

## Sample Data

### Categories
1. Burgers (icon: sandwich, color: #e63946)
2. Chicken (icon: drumstick, color: #f4a261)
3. Sides (icon: french-fries, color: #e9c46a)
4. Beverages (icon: cup-soda, color: #4895ef)
5. Desserts (icon: cake, color: #2a9d8f)
6. Combos (icon: package, color: #9b5de5)

### Sample Menu Items
- Zinger Burger - ₹299
- Classic Burger - ₹199
- Hot Wings (6pc) - ₹249
- Famous Bowl - ₹349
- Fries (Regular) - ₹99
- Pepsi (500ml) - ₹79
- Choco Lava Cake - ₹149

### Default Users
- Admin: PIN 1234
- Manager: PIN 5678
- Cashier: PIN 0000
- Kitchen: PIN 9999

---

## Online Aggregator Integration

### Supported Platforms
1. **Swiggy** - Indian food delivery platform
2. **Zomato** - Indian restaurant aggregator
3. **Zepto** - Quick commerce with food delivery
4. **Direct** - Own website ordering system

### Webhook Events Handled

| Event | Swiggy | Zomato | Action |
|-------|--------|--------|--------|
| New Order | `order.created` | `order.placed` | Auto-print KOT, notify kitchen |
| Order Accepted | `order.accepted` | - | Update status |
| Order Picked Up | `order.picked_up` | `order.picked_up` | Mark ready |
| Order Delivered | `order.delivered` | `order.completed` | Mark completed |
| Order Cancelled | `order.cancelled` | `order.cancelled` | Cancel order, notify staff |
| Order Updated | `order.updated` | `order.updated` | Update details |

### Menu Sync Strategy
1. Pull menu from aggregator (API or manual)
2. Map aggregator items → internal menu items
3. Set base price or override
4. Push availability status
5. Monitor for price updates

### Order Flow (Online)
```
Aggregator App → Webhook → Our Server → Validate → Create Order → Generate KOT
                                                      ↓
                                              Notify Kitchen (Sound + Visual)
                                                      ↓
                                              Kitchen prepares → Mark Ready
                                                      ↓
                                              Aggregator driver picks up
                                                      ↓
                                              Auto-update status → Complete
```

### Aggregator-Specific UI Colors
- Swiggy: `#ff5200` (Orange)
- Zomato: `#e23744` (Red)
- Zepto: `#9d2b6b` (Purple)
- Direct: `#4895ef` (Blue)
