import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  ChefHat, 
  Tv, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Minus, 
  UserPlus, 
  Award, 
  FileText, 
  AlertTriangle, 
  RefreshCw, 
  QrCode,
  DollarSign,
  Smartphone
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Fallback Mock Data in case server is not running
const MOCK_MENU = {
  categories: ['Gyros', 'Fries', 'Combos', 'Drinks'],
  items: [
    { id: "m1", category: "Gyros", name: "The Classic Gyro", desc: "Juicy grilled chicken, fresh veggies & our special sauce.", price: 199, tag: "Bestseller" },
    { id: "m2", category: "Gyros", name: "Spicy Chicken Gyro", desc: "Spicy chicken, jalapeños, lettuce & spicy sauce.", price: 219, tag: "Spicy" },
    { id: "m3", category: "Gyros", name: "BBQ Chicken Gyro", desc: "BBQ chicken, onions, cheese & BBQ sauce.", price: 219, tag: "" },
    { id: "m4", category: "Gyros", name: "Veggie Gyro", desc: "Falafel, hummus, veggies & tahini sauce.", price: 179, tag: "Healthy" },
    { id: "m5", category: "Gyros", name: "Lamb Gyro", desc: "Tender lamb, onions, lettuce & garlic sauce.", price: 249, tag: "Premium" },
    { id: "m6", category: "Fries", name: "Classic Fries", desc: "Crispy golden fries with seasoning.", price: 99, tag: "" },
    { id: "m7", category: "Fries", name: "Loaded Fries", desc: "Fries topped with cheese, jalapeños & sauce.", price: 149, tag: "Spicy" },
    { id: "m8", category: "Fries", name: "Masala Fries", desc: "Spiced fries with Indian masala blend.", price: 119, tag: "" },
    { id: "m9", category: "Combos", name: "Gyro + Fries Combo", desc: "Any gyro + classic fries + drink.", price: 299, tag: "Value pack" },
    { id: "m10", category: "Combos", name: "Double Gyro Combo", desc: "Two gyros + fries.", price: 399, tag: "Feast" },
    { id: "m11", category: "Drinks", name: "Coke Can", desc: "Chilled Coca-Cola 330ml.", price: 60, tag: "" },
    { id: "m12", category: "Drinks", name: "Fresh Lime Soda", desc: "Sweet or salted fresh lime soda.", price: 69, tag: "Refreshing" },
    { id: "m13", category: "Drinks", name: "Water Bottle", desc: "500ml mineral water.", price: 30, tag: "" }
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState('billing');
  const [isServerConnected, setIsServerConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // App States
  const [menu, setMenu] = useState(MOCK_MENU);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [purchases, setPurchases] = useState([]);

  // POS States
  const [selectedCategory, setSelectedCategory] = useState('Gyros');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('walkin');
  const [orderType, setOrderType] = useState('Dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Self-Ordering Portal States (Simulated QR)
  const [portalTable, setPortalTable] = useState('T4');
  const [portalCategory, setPortalCategory] = useState('Gyros');
  const [portalCart, setPortalCart] = useState([]);
  const [portalView, setPortalView] = useState('menu'); // menu, cart, checkout, success
  const [portalLastOrder, setPortalLastOrder] = useState(null);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'rubies', 'scratch', 'stock', 'purchase', 'add_customer'
  const [activeItem, setActiveItem] = useState(null); // Row object being edited
  const [modalForm, setModalForm] = useState({});

  // Initialize data
  useEffect(() => {
    fetchData();
    // Set up auto-polling for active orders (TV display and KOT sync)
    const interval = setInterval(() => {
      pollOrdersAndInventory();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Menu
      const menuRes = await fetch(`${API_BASE}/menu`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenu(menuData);
      }
      
      // 2. Fetch Orders
      const ordersRes = await fetch(`${API_BASE}/admin/orders`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // 3. Fetch Customers
      const custRes = await fetch(`${API_BASE}/admin/customers`);
      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData);
      }

      // 4. Fetch Inventory
      const invRes = await fetch(`${API_BASE}/inventory`);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData);
      }

      // 5. Fetch Purchases
      const purRes = await fetch(`${API_BASE}/purchases`);
      if (purRes.ok) {
        const purData = await purRes.json();
        setPurchases(purData);
      }

      setIsServerConnected(true);
    } catch (e) {
      console.warn("Backend server not responding, running in Mock Database mode.", e);
      setIsServerConnected(false);
      // Populate Mock Data
      setInventory([
        { id: "i1", name: "Gyro Meat (kg)", stock: 25.5, unit: "kg", lowStockThreshold: 5.0 },
        { id: "i2", name: "Falafel Patty (pcs)", stock: 80, unit: "pcs", lowStockThreshold: 20 },
        { id: "i3", name: "Potatoes (kg)", stock: 45.0, unit: "kg", lowStockThreshold: 10.0 },
        { id: "i4", name: "Cheese Sauce (liters)", stock: 8.5, unit: "liters", lowStockThreshold: 2.0 },
        { id: "i5", name: "Gyro Bread (pcs)", stock: 120, unit: "pcs", lowStockThreshold: 30 },
        { id: "i6", name: "Coke Can (330ml)", stock: 48, unit: "pcs", lowStockThreshold: 12 },
        { id: "i7", name: "Water Bottle (500ml)", stock: 60, unit: "pcs", lowStockThreshold: 15 }
      ]);
      setPurchases([
        { id: "p1", supplier: "Fresh Farms Ltd", date: new Date(Date.now() - 86400000 * 3).toISOString(), items: [{ name: "Potatoes (kg)", quantity: 20, unit: "kg", price: 30 }], total: 600 },
        { id: "p2", supplier: "Global Foods", date: new Date(Date.now() - 86400000).toISOString(), items: [{ name: "Gyro Bread (pcs)", quantity: 100, unit: "pcs", price: 15 }, { name: "Coke Can (330ml)", quantity: 24, unit: "pcs", price: 35 }], total: 2340 }
      ]);
      setCustomers([
        { id: "u1", name: "ROHIT", email: "rohit@example.com", phone: "+91 9876543210", rubyBalance: 2450, denLevel: "Gold", completedDens: 4, denProgress: 6, scratchCards: [{ id: "s1", title: "Weekend Special", amount: 150, claimed: false }] },
        { id: "u2", name: "Bala", email: "ithead@achariya.org", phone: "7904761795", rubyBalance: 2950, denLevel: "Gold", completedDens: 4, denProgress: 6, scratchCards: [] }
      ]);
      setOrders([
        { id: "ORD10023", userId: "u1", customerName: "ROHIT", items: [{ name: "The Classic Gyro", price: 199, quantity: 1 }], subtotal: 199, tax: 18, deliveryFee: 30, total: 247, status: "Delivered", paymentMethod: "Cash on Delivery", deliveryAddress: "123, Luxury Suites, Sector 5, HSR Layout, Bengaluru", createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const pollOrdersAndInventory = async () => {
    try {
      const ordersRes = await fetch(`${API_BASE}/admin/orders`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
      const invRes = await fetch(`${API_BASE}/inventory`);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData);
      }
    } catch (_) {
      // Silent error during polling fallback
    }
  };

  // --- ACTIONS ---

  // POS Add to cart
  const handleAddToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // POS Change Quantity
  const handleUpdateQty = (itemId, change) => {
    const updated = cart.map(c => {
      if (c.id === itemId) {
        const newQty = c.quantity + change;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean);
    setCart(updated);
  };

  // Calculate pricing
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const deliveryFee = orderType === 'Delivery' ? 30 : 0;
  const total = subtotal + tax + deliveryFee;

  // POS Checkout Submit
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty");
    if (orderType === 'Dine-in' && !tableNumber) return alert("Please specify table number");

    const orderData = {
      userId: selectedCustomer,
      items: cart.map(c => ({ name: c.name, price: c.price, quantity: c.quantity })),
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod,
      deliveryAddress: orderType === 'Delivery' ? deliveryAddress : '',
      orderType,
      tableNumber: orderType === 'Dine-in' ? tableNumber : ''
    };

    try {
      if (isServerConnected) {
        const response = await fetch(`${API_BASE}/admin/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || "Failed to create order");
        alert(resData.message);
      } else {
        // Mock Implementation
        const newOrderId = `ORD${10000 + orders.length + 1}`;
        const customerObj = customers.find(c => c.id === selectedCustomer);
        
        let mockRubyBal = null;
        if (customerObj) {
          if (paymentMethod === 'Rubies Wallet') {
            if (customerObj.rubyBalance < total) return alert("Insufficient Rubies in customer wallet");
            customerObj.rubyBalance -= total;
          } else {
            // Earn 10%
            customerObj.rubyBalance += Math.round(total * 0.1);
          }
          mockRubyBal = customerObj.rubyBalance;
        }

        const newMockOrder = {
          id: newOrderId,
          userId: selectedCustomer,
          customerName: customerObj ? customerObj.name : 'Walk-in Customer',
          customerPhone: customerObj ? customerObj.phone : '',
          items: orderData.items,
          subtotal,
          tax,
          deliveryFee,
          total,
          status: 'Placed',
          paymentMethod,
          deliveryAddress: orderData.deliveryAddress,
          orderType,
          tableNumber: orderData.tableNumber,
          createdAt: new Date().toISOString()
        };

        setOrders([newMockOrder, ...orders]);
        setCustomers([...customers]);
        alert("Order placed successfully (Mock DB Mode)!");
      }
      
      // Clean POS form
      setCart([]);
      setTableNumber('');
      setDeliveryAddress('');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // KOT Status Progression
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      if (isServerConnected) {
        await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } else {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
      pollOrdersAndInventory();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  // Admin Customer Adjustment Submit
  const handleCustomerAdjustSubmit = async (e) => {
    e.preventDefault();
    const { id } = activeItem;
    const { rubies, type, description } = modalForm;

    try {
      if (isServerConnected) {
        const response = await fetch(`${API_BASE}/admin/customers/${id}/rubies`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rubies, type, description })
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
      } else {
        const userObj = customers.find(c => c.id === id);
        const amount = Number(rubies);
        if (type === 'debit' && userObj.rubyBalance < amount) return alert("Insufficient balance");
        userObj.rubyBalance = type === 'credit' ? userObj.rubyBalance + amount : userObj.rubyBalance - amount;
        setCustomers([...customers]);
      }
      alert("Rubies updated successfully!");
      setActiveModal(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Award Scratch Card
  const handleAwardScratchSubmit = async (e) => {
    e.preventDefault();
    const { id } = activeItem;
    const { title, amount } = modalForm;

    try {
      if (isServerConnected) {
        const response = await fetch(`${API_BASE}/admin/customers/${id}/scratch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, amount })
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
      } else {
        const userObj = customers.find(c => c.id === id);
        if (!userObj.scratchCards) userObj.scratchCards = [];
        userObj.scratchCards.push({
          id: 's_' + Date.now(),
          title,
          amount: Number(amount),
          claimed: false
        });
        setCustomers([...customers]);
      }
      alert("Scratch card awarded successfully!");
      setActiveModal(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Adjust stock
  const handleStockAdjustSubmit = async (e) => {
    e.preventDefault();
    const { id } = activeItem;
    const { stock } = modalForm;

    try {
      if (isServerConnected) {
        const response = await fetch(`${API_BASE}/inventory`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, stock })
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
      } else {
        setInventory(inventory.map(inv => inv.id === id ? { ...inv, stock: Number(stock) } : inv));
      }
      alert("Stock level updated!");
      setActiveModal(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Record vendor purchases
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    const { supplier, itemName, quantity, unit, price, totalCost } = modalForm;

    if (!supplier || !itemName || !quantity || !price) return alert("Please fill all fields");

    const calculatedTotal = Number(quantity) * Number(price);

    const purchaseData = {
      supplier,
      items: [{ name: itemName, quantity: Number(quantity), unit: unit || 'pcs', price: Number(price) }],
      total: calculatedTotal
    };

    try {
      if (isServerConnected) {
        const response = await fetch(`${API_BASE}/purchases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(purchaseData)
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
      } else {
        const newMockPurchase = {
          id: 'p_' + Date.now(),
          supplier,
          date: new Date().toISOString(),
          items: purchaseData.items,
          total: calculatedTotal
        };
        // Update mock inventory
        const matchedInv = inventory.find(inv => inv.name.toLowerCase().includes(itemName.toLowerCase()));
        if (matchedInv) {
          matchedInv.stock += Number(quantity);
        } else {
          inventory.push({
            id: 'i_' + Date.now(),
            name: itemName,
            stock: Number(quantity),
            unit: unit || 'pcs',
            lowStockThreshold: 10
          });
        }
        setInventory([...inventory]);
        setPurchases([newMockPurchase, ...purchases]);
      }
      alert("Purchase transaction logged and stock updated!");
      setActiveModal(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // POS Add customer in-memory or database
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone } = modalForm;
    if (!name || !phone || !email) return alert("Please fill all details");

    try {
      if (isServerConnected) {
        const response = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password: 'pos_customer_123' })
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
      } else {
        const newMockCust = {
          id: 'u_' + Date.now(),
          name,
          email,
          phone,
          rubyBalance: 100, // starting bonus
          denLevel: 'Bronze',
          completedDens: 0,
          denProgress: 0,
          scratchCards: []
        };
        customers.push(newMockCust);
        setCustomers([...customers]);
      }
      alert("Customer added successfully!");
      setActiveModal(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- SELF-ORDERING PORTAL (QR PORTAL SIMULATOR) ---
  
  const portalSubtotal = portalCart.reduce((sum, c) => sum + (c.price * c.quantity), 0);
  const portalTax = Math.round(portalSubtotal * 0.05);
  const portalTotal = portalSubtotal + portalTax;

  const handlePortalAddToCart = (item) => {
    const existing = portalCart.find(c => c.id === item.id);
    if (existing) {
      setPortalCart(portalCart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setPortalCart([...portalCart, { ...item, quantity: 1 }]);
    }
  };

  const handlePortalUpdateQty = (itemId, change) => {
    const updated = portalCart.map(c => {
      if (c.id === itemId) {
        const newQty = c.quantity + change;
        return newQty > 0 ? { ...c, quantity: newQty } : null;
      }
      return c;
    }).filter(Boolean);
    setPortalCart(updated);
  };

  const handlePortalSubmitOrder = async () => {
    if (portalCart.length === 0) return;
    
    const orderData = {
      userId: 'walkin', // self orders are typically walkins unless logged in
      items: portalCart.map(c => ({ name: c.name, price: c.price, quantity: c.quantity })),
      subtotal: portalSubtotal,
      tax: portalTax,
      deliveryFee: 0,
      total: portalTotal,
      paymentMethod: 'Self-Service Cash/POS',
      deliveryAddress: '',
      orderType: 'Dine-in',
      tableNumber: portalTable
    };

    try {
      if (isServerConnected) {
        const response = await fetch(`${API_BASE}/admin/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
        setPortalLastOrder(resData.order);
      } else {
        const newOrderId = `ORD${10000 + orders.length + 1}`;
        const newMockOrder = {
          id: newOrderId,
          userId: 'walkin',
          customerName: `Table ${portalTable} Self-Order`,
          customerPhone: '',
          items: orderData.items,
          subtotal: portalSubtotal,
          tax: portalTax,
          deliveryFee: 0,
          total: portalTotal,
          status: 'Placed',
          paymentMethod: 'Self-Service Cash/POS',
          deliveryAddress: '',
          orderType: 'Dine-in',
          tableNumber: portalTable,
          createdAt: new Date().toISOString()
        };

        setOrders([newMockOrder, ...orders]);
        setPortalLastOrder(newMockOrder);
      }
      
      setPortalCart([]);
      setPortalView('success');
      // Sync dashboard
      pollOrdersAndInventory();
    } catch (e) {
      alert("Error placing self-order");
    }
  };


  // --- RENDERING TABS ---

  const renderBilling = () => {
    const itemsFiltered = menu.items.filter(item => item.category === selectedCategory);

    return (
      <div className="pos-layout">
        <div className="pos-main">
          {/* Category Bar */}
          <div className="category-bar">
            {menu.categories.map(cat => (
              <button 
                key={cat} 
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="items-grid">
            {itemsFiltered.map(item => (
              <div key={item.id} className="item-card" onClick={() => handleAddToCart(item)}>
                {item.tag && <span className="item-tag">{item.tag}</span>}
                <div className="item-img">
                  {/* Icon representations instead of missing local image assets */}
                  {item.category === 'Gyros' && <Utensils size={32} color="#888" />}
                  {item.category === 'Fries' && <TrendingUp size={32} color="#888" />}
                  {item.category === 'Combos' && <ShoppingCart size={32} color="#888" />}
                  {item.category === 'Drinks' && <Tv size={32} color="#888" />}
                </div>
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-desc">{item.desc}</div>
                </div>
                <div className="item-price-row">
                  <div className="item-price">₹{item.price}</div>
                  <button className="btn-add-item">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POS Side bar Cart */}
        <div className="pos-sidebar">
          <div className="cart-header">
            <span>Active Cart</span>
            <span style={{ fontSize: '13px', color: 'var(--gold)' }}>{cart.length} items</span>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-grey)', marginTop: '40px', fontSize: '14px' }}>
                Cart is empty. Tap items on the left to add.
              </div>
            ) : (
              cart.map(c => (
                <div key={c.id} className="cart-item">
                  <div className="cart-item-details">
                    <div className="cart-item-name">{c.name}</div>
                    <div className="cart-item-price">₹{c.price}</div>
                  </div>
                  <div className="cart-qty-ctrl">
                    <button className="qty-btn" onClick={() => handleUpdateQty(c.id, -1)}><Minus size={10} /></button>
                    <span className="cart-qty">{c.quantity}</span>
                    <button className="qty-btn" onClick={() => handleUpdateQty(c.id, 1)}><Plus size={10} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="pos-order-details" onSubmit={handleCheckout}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Customer (Earns 10% Rubies)</label>
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  onClick={() => {
                    setModalForm({});
                    setActiveModal('add_customer');
                  }}
                >
                  <UserPlus size={12} /> New Customer
                </button>
              </div>
              <select 
                className="form-control"
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
              >
                <option value="walkin">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone} - Tier: {c.denLevel})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Order Type</label>
              <div className="btn-group-toggle">
                {['Dine-in', 'Takeaway', 'Delivery'].map(type => (
                  <div 
                    key={type}
                    className={`toggle-btn ${orderType === type ? 'active' : ''}`}
                    onClick={() => setOrderType(type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>

            {orderType === 'Dine-in' && (
              <div className="form-group">
                <label>Table Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. T1, T2" 
                  className="form-control" 
                  value={tableNumber}
                  onChange={e => setTableNumber(e.target.value)}
                  required
                />
              </div>
            )}

            {orderType === 'Delivery' && (
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea 
                  placeholder="Enter full address" 
                  className="form-control" 
                  rows="2"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Payment Method</label>
              <select 
                className="form-control"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card / UPI</option>
                <option value="Rubies Wallet">Rubies Wallet (Burn Rubies)</option>
              </select>
              {paymentMethod === 'Rubies Wallet' && selectedCustomer !== 'walkin' && (
                <div style={{ fontSize: '11px', color: 'var(--gold)', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Wallet Balance:</span>
                  <span>{customers.find(c => c.id === selectedCustomer)?.rubyBalance || 0} Rubies</span>
                </div>
              )}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              {orderType === 'Delivery' && (
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Place POS Order & Print KOT
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderKOT = () => {
    // Filter active orders that are not Completed or Delivered
    const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered');

    return (
      <div className="pos-main">
        {activeOrders.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--text-grey)' }}>
            <ChefHat size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No Active Kitchen Orders</h3>
            <p style={{ marginTop: '8px' }}>Orders placed via POS or Self-Ordering Portal will appear here.</p>
          </div>
        ) : (
          <div className="kot-board">
            {activeOrders.map(o => (
              <div key={o.id} className={`kot-ticket status-${o.status.toLowerCase()}`}>
                <div className="kot-header">
                  <div>
                    <div className="kot-id">{o.id}</div>
                    <div className="kot-time">{new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                  <span className={`stock-status ${o.status === 'Placed' ? 'low' : o.status === 'Preparing' ? 'normal' : 'normal'}`} style={{ fontSize: '10px' }}>
                    {o.status}
                  </span>
                </div>

                <div className="kot-details">
                  <span>Type: <strong>{o.orderType || 'Dine-in'}</strong></span>
                  {o.tableNumber && <span>Table: <strong>{o.tableNumber}</strong></span>}
                </div>

                <div className="kot-items">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="kot-item">
                      <span className="kot-item-qty">{item.quantity}x</span>
                      <span className="kot-item-name">{item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="kot-footer">
                  {o.status === 'Placed' && (
                    <button className="btn btn-gold" style={{ padding: '8px' }} onClick={() => handleUpdateStatus(o.id, 'Preparing')}>
                      Start Preparing
                    </button>
                  )}
                  {o.status === 'Preparing' && (
                    <button className="btn btn-primary" style={{ padding: '8px' }} onClick={() => handleUpdateStatus(o.id, 'Ready')}>
                      Mark Ready for Pickup
                    </button>
                  )}
                  {o.status === 'Ready' && (
                    <button className="btn btn-secondary" style={{ padding: '8px', borderColor: 'var(--green)', color: 'var(--green)' }} onClick={() => handleUpdateStatus(o.id, 'Completed')}>
                      Complete / Handover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDisplay = () => {
    const preparingOrders = orders.filter(o => o.status === 'Placed' || o.status === 'Preparing');
    const readyOrders = orders.filter(o => o.status === 'Ready');

    return (
      <div className="tv-display-layout">
        {/* Preparing Panel */}
        <div className="tv-column">
          <div className="tv-column-header preparing">
            <RefreshCw className="pulse-animation" size={24} /> Preparing
          </div>
          <div className="tv-orders-list">
            {preparingOrders.map(o => (
              <div key={o.id} className="tv-order-badge preparing">
                {o.id.replace('ORD', '#')}
                <div className="tv-table-num">
                  {o.orderType === 'Dine-in' ? `Table ${o.tableNumber}` : o.orderType}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready Panel */}
        <div className="tv-column">
          <div className="tv-column-header ready">
            <Award size={24} /> Ready for Pickup
          </div>
          <div className="tv-orders-list">
            {readyOrders.map(o => (
              <div key={o.id} className="tv-order-badge ready">
                {o.id.replace('ORD', '#')}
                <div className="tv-table-num">
                  {o.orderType === 'Dine-in' ? `Table ${o.tableNumber}` : o.orderType}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    return (
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Loyalty Tier</th>
              <th>Rubies Balance</th>
              <th>Scratch Cards</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: '600' }}>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>
                  <span className={`tier-badge ${c.denLevel.toLowerCase()}`}>
                    {c.denLevel}
                  </span>
                </td>
                <td>
                  <span className="ruby-count">💎 {c.rubyBalance}</span>
                </td>
                <td>
                  <span style={{ fontSize: '13px' }}>
                    {c.scratchCards ? c.scratchCards.filter(sc => !sc.claimed).length : 0} Available
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setActiveItem(c);
                        setModalForm({ rubies: 100, type: 'credit', description: 'Loyalty Bonus' });
                        setActiveModal('rubies');
                      }}
                    >
                      Adjust Rubies
                    </button>
                    <button 
                      className="btn btn-gold" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        setActiveItem(c);
                        setModalForm({ title: 'Special Diner Scratch Card', amount: 200 });
                        setActiveModal('scratch');
                      }}
                    >
                      Give Scratch Card
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInventory = () => {
    return (
      <div className="pos-main">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button 
            className="btn btn-gold"
            onClick={() => {
              setModalForm({ supplier: '', itemName: 'Potatoes (kg)', quantity: 10, unit: 'kg', price: 30 });
              setActiveModal('purchase');
            }}
          >
            <Plus size={16} /> Record Supply Purchase
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ingredient Name</th>
                <th>Current Stock</th>
                <th>Unit</th>
                <th>Low Stock Warning Limit</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(inv => {
                const isLow = inv.stock <= inv.lowStockThreshold;
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: '600' }}>{inv.name}</td>
                    <td style={{ color: isLow ? 'var(--red-light)' : 'var(--text-white)', fontWeight: '700' }}>
                      {inv.stock}
                    </td>
                    <td>{inv.unit}</td>
                    <td>{inv.lowStockThreshold}</td>
                    <td>
                      <span className={`stock-status ${isLow ? 'low' : 'normal'}`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => {
                          setActiveItem(inv);
                          setModalForm({ stock: inv.stock });
                          setActiveModal('stock');
                        }}
                      >
                        Adjust Level
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPurchases = () => {
    return (
      <div className="pos-main">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button 
            className="btn btn-gold"
            onClick={() => {
              setModalForm({ supplier: '', itemName: 'Gyro Bread (pcs)', quantity: 50, unit: 'pcs', price: 15 });
              setActiveModal('purchase');
            }}
          >
            <Plus size={16} /> Log Supply Purchase
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendor / Supplier</th>
                <th>Invoice Date</th>
                <th>Items Logged</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--gold)', fontWeight: '600' }}>{p.id}</td>
                  <td>{p.supplier}</td>
                  <td>{new Date(p.date).toLocaleDateString()} {new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td>
                    {p.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '13px' }}>
                        {item.name} - {item.quantity} {item.unit} @ ₹{item.price}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--green)' }}>₹{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSelfOrdering = () => {
    return (
      <div className="portal-container">
        <div style={{ marginRight: '40px', maxWidth: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <QrCode size={40} color="var(--gold)" />
            <h2 style={{ fontFamily: 'var(--font-heading)' }}>Table QR ordering</h2>
          </div>
          <p style={{ color: 'var(--text-grey)', fontSize: '14px', lineHeight: '1.5' }}>
            Simulate a customer scanning a table QR code with their mobile phone. Placed orders instantly flash onto the kitchen KOT screen and cashier display without any human delay.
          </p>
          
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Scan / Dine-in Table Number</label>
            <select 
              className="form-control"
              value={portalTable}
              onChange={e => setPortalTable(e.target.value)}
            >
              {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map(tab => (
                <option key={tab} value={tab}>Table {tab}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Mockup */}
        <div className="mobile-frame">
          <div className="mobile-notch"></div>
          <div className="mobile-screen">
            {portalView === 'menu' && (
              <>
                <div className="portal-brand">
                  <div className="logo-icon" style={{ width: '28px', height: '28px', fontSize: '14px' }}>TDG</div>
                  <h2>Ten Dens Gyros</h2>
                </div>

                <div style={{ backgroundColor: 'var(--card-dark)', padding: '10px', borderRadius: '10px', fontSize: '12px', textAlign: 'center', color: 'var(--gold)', border: '1px dashed var(--gold)', marginBottom: '16px' }}>
                  👋 Ordering from <strong>Table {portalTable}</strong>
                </div>

                {/* Categories */}
                <div className="category-bar" style={{ gap: '8px', marginBottom: '16px' }}>
                  {menu.categories.map(cat => (
                    <button 
                      key={cat} 
                      className={`category-tab ${portalCategory === cat ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => setPortalCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Menu items */}
                <div className="portal-menu-grid">
                  {menu.items.filter(item => item.category === portalCategory).map(item => (
                    <div key={item.id} className="portal-item-card">
                      <div className="portal-item-img">
                        <Utensils size={20} color="#666" />
                      </div>
                      <div className="portal-item-details">
                        <div className="portal-item-name">{item.name}</div>
                        <div className="portal-item-price">₹{item.price}</div>
                      </div>
                      <button 
                        className="btn-add-item" 
                        style={{ width: '28px', height: '28px' }}
                        onClick={() => handlePortalAddToCart(item)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {portalCart.length > 0 && (
                  <div className="portal-cart-bar" style={{ marginTop: '20px' }} onClick={() => setPortalView('cart')}>
                    <span>View Cart ({portalCart.length})</span>
                    <span>₹{portalSubtotal} →</span>
                  </div>
                )}
              </>
            )}

            {portalView === 'cart' && (
              <>
                <div className="portal-brand">
                  <h2>Your Food Cart</h2>
                </div>

                <div className="cart-items" style={{ flex: 'none', maxHeight: '350px' }}>
                  {portalCart.map(c => (
                    <div key={c.id} className="cart-item">
                      <div className="cart-item-details">
                        <div className="cart-item-name">{c.name}</div>
                        <div className="cart-item-price">₹{c.price}</div>
                      </div>
                      <div className="cart-qty-ctrl">
                        <button className="qty-btn" onClick={() => handlePortalUpdateQty(c.id, -1)}><Minus size={10} /></button>
                        <span className="cart-qty">{c.quantity}</span>
                        <button className="qty-btn" onClick={() => handlePortalUpdateQty(c.id, 1)}><Plus size={10} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary" style={{ marginTop: '16px' }}>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{portalSubtotal}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST (5%)</span>
                    <span>₹{portalTax}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Bill</span>
                    <span>₹{portalTotal}</span>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={handlePortalSubmitOrder}>
                    Confirm & Send to Kitchen
                  </button>
                  <button className="btn btn-secondary" onClick={() => setPortalView('menu')}>
                    ← Add more items
                  </button>
                </div>
              </>
            )}

            {portalView === 'success' && portalLastOrder && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--green)', fontSize: '32px', marginBottom: '16px', justifyContent: 'center' }}>
                  ✓
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)' }}>Order Received!</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-grey)', marginTop: '8px' }}>
                  Your order <strong>{portalLastOrder.id}</strong> has been sent to the chef.
                </p>
                <div style={{ backgroundColor: 'var(--card-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', width: '100%', padding: '12px', marginTop: '16px', fontSize: '12px', textAlign: 'left' }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '6px', fontWeight: 'bold' }}>Receipt Details</div>
                  {portalLastOrder.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px', fontWeight: 'bold', color: 'var(--gold)' }}>
                    <span>Total Bill</span>
                    <span>₹{portalLastOrder.total}</span>
                  </div>
                </div>
                <button className="btn btn-gold" style={{ width: '100%', marginTop: '24px' }} onClick={() => setPortalView('menu')}>
                  Order More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="brand">
          <div className="logo-icon">TDG</div>
          <div className="brand-text">Ten Dens <span>Gyros</span></div>
        </div>

        <div className="nav-menu">
          <div className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
            <ShoppingCart size={18} /> POS Billing
          </div>
          <div className={`nav-item ${activeTab === 'kot' ? 'active' : ''}`} onClick={() => setActiveTab('kot')}>
            <ChefHat size={18} /> KOT / Kitchen
          </div>
          <div className={`nav-item ${activeTab === 'display' ? 'active' : ''}`} onClick={() => setActiveTab('display')}>
            <Tv size={18} /> TV Display Board
          </div>
          <div className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
            <Users size={18} /> Customer Loyalty
          </div>
          <div className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Package size={18} /> Stock Inventory
          </div>
          <div className={`nav-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
            <FileText size={18} /> Supply Purchases
          </div>
          <div className={`nav-item ${activeTab === 'selfordering' ? 'active' : ''}`} onClick={() => setActiveTab('selfordering')}>
            <Smartphone size={18} /> QR Self-Ordering
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="db-status">
            <div className="status-indicator" style={{ backgroundColor: isServerConnected ? 'var(--green)' : 'var(--amber)', boxShadow: isServerConnected ? '0 0 8px var(--green)' : '0 0 8px var(--amber)' }}></div>
            <span>{isServerConnected ? 'API Connected' : 'Running Offline Mode'}</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px', fontSize: '12px' }} onClick={fetchData}>
            <RefreshCw size={12} /> Sync Database
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className="main-content">
        <div className="view-header">
          <div className="view-title">
            <h1>
              {activeTab === 'billing' && <><ShoppingCart /> Cashier POS Terminal</>}
              {activeTab === 'kot' && <><ChefHat /> Active Kitchen KOT Tickets</>}
              {activeTab === 'display' && <><Tv /> Customer Order Display Board</>}
              {activeTab === 'customers' && <><Users /> Customer Loyalty & Rewards Database</>}
              {activeTab === 'inventory' && <><Package /> Raw Materials Inventory</>}
              {activeTab === 'purchases' && <><FileText /> Vendor Supply Purchases</>}
              {activeTab === 'selfordering' && <><Smartphone /> Mobile QR Self-Ordering Portal</>}
            </h1>
            <p>
              {activeTab === 'billing' && "Take orders, search customers, deduct ruby wallets, and print tickets."}
              {activeTab === 'kot' && "Monitor food prep statuses and notify cashier/customers."}
              {activeTab === 'display' && "Visual customer pickup board showing queue numbers and status."}
              {activeTab === 'customers' && "Manage restaurant diners, scratch cards, loyalty tiers, and ruby points ledger."}
              {activeTab === 'inventory' && "Monitor stocks and adjust low threshold warning levels."}
              {activeTab === 'purchases' && "Log supplier stock deliveries to auto-increment inventory counts."}
              {activeTab === 'selfordering' && "Simulate interactive QR table orders sent directly to KDS."}
            </p>
          </div>
        </div>

        {/* Render actual content */}
        {activeTab === 'billing' && renderBilling()}
        {activeTab === 'kot' && renderKOT()}
        {activeTab === 'display' && renderDisplay()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'purchases' && renderPurchases()}
        {activeTab === 'selfordering' && renderSelfOrdering()}
      </div>

      {/* --- MODALS --- */}

      {/* Rubies Adjustment Modal */}
      {activeModal === 'rubies' && activeItem && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleCustomerAdjustSubmit}>
            <div className="modal-header">
              <h2>Adjust Rubies: {activeItem.name}</h2>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Balance</label>
                <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>💎 {activeItem.rubyBalance} Rubies</div>
              </div>
              <div className="form-group">
                <label>Adjustment Type</label>
                <select 
                  className="form-control"
                  value={modalForm.type}
                  onChange={e => setModalForm({...modalForm, type: e.target.value})}
                >
                  <option value="credit">Credit (Add points)</option>
                  <option value="debit">Debit (Deduct points)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rubies Amount</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={modalForm.rubies}
                  onChange={e => setModalForm({...modalForm, rubies: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason / Description</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={modalForm.description}
                  onChange={e => setModalForm({...modalForm, description: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Adjustment</button>
            </div>
          </form>
        </div>
      )}

      {/* Award Scratch Card Modal */}
      {activeModal === 'scratch' && activeItem && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleAwardScratchSubmit}>
            <div className="modal-header">
              <h2>Award Scratch Card: {activeItem.name}</h2>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Scratch Card Title</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={modalForm.title}
                  onChange={e => setModalForm({...modalForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ruby Value (Hidden inside card)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={modalForm.amount}
                  onChange={e => setModalForm({...modalForm, amount: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-gold">Award Scratch Card</button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Level Adjust Modal */}
      {activeModal === 'stock' && activeItem && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleStockAdjustSubmit}>
            <div className="modal-header">
              <h2>Adjust Stock: {activeItem.name}</h2>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Stock: {activeItem.stock} {activeItem.unit}</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-control"
                  value={modalForm.stock}
                  onChange={e => setModalForm({...modalForm, stock: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Update Stock</button>
            </div>
          </form>
        </div>
      )}

      {/* Log Purchase Modal */}
      {activeModal === 'purchase' && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handlePurchaseSubmit}>
            <div className="modal-header">
              <h2>Log Supply Delivery Invoice</h2>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Vendor / Supplier</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fresh Farms Ltd" 
                  className="form-control"
                  value={modalForm.supplier}
                  onChange={e => setModalForm({...modalForm, supplier: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ingredient Item</label>
                <select 
                  className="form-control"
                  value={modalForm.itemName}
                  onChange={e => {
                    const matched = inventory.find(i => i.name === e.target.value);
                    setModalForm({...modalForm, itemName: e.target.value, unit: matched ? matched.unit : 'pcs'});
                  }}
                >
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.name}>{inv.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity Delivered</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-control"
                  value={modalForm.quantity}
                  onChange={e => setModalForm({...modalForm, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit of Measure</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={modalForm.unit || 'pcs'}
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Cost per Unit (₹)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={modalForm.price}
                  onChange={e => setModalForm({...modalForm, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group" style={{ backgroundColor: 'var(--card-mid)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Calculated Invoice Cost:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--green)' }}>
                  ₹{(Number(modalForm.quantity || 0) * Number(modalForm.price || 0)) || 0}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-gold">Log Invoice & Add Stock</button>
            </div>
          </form>
        </div>
      )}

      {/* POS Add Customer Modal */}
      {activeModal === 'add_customer' && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleAddCustomerSubmit}>
            <div className="modal-header">
              <h2>Register New Customer</h2>
              <button type="button" className="modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  type="text" 
                  placeholder="Enter full name" 
                  className="form-control"
                  value={modalForm.name}
                  onChange={e => setModalForm({...modalForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="form-control"
                  value={modalForm.email}
                  onChange={e => setModalForm({...modalForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 9876543210" 
                  className="form-control"
                  value={modalForm.phone}
                  onChange={e => setModalForm({...modalForm, phone: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Diner Profile</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
