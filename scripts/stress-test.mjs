

const BASE = process.env.API_URL || 'http://localhost:3001'

const R = {
  pass: 0, fail: 0,
  results: []
}

function log(status, label, detail = '') {
  if (status === 'PASS') R.pass++; else R.fail++
  R.results.push({ status, label, detail: detail?.substring?.(0, 120) || detail })
  const icon = status === 'PASS' ? '✅' : '❌'
  console.log(`  ${icon} [${status}] ${label}${detail ? ' — ' + detail?.substring?.(0, 100) : ''}`)
}

async function api(method, path, body = undefined) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  }
  if (path.startsWith('/api/auth/') || path.startsWith('/api/wallet/') || path.startsWith('/api/orders') && !path.startsWith('/api/orders?') && !path.startsWith('/api/pos/')) {
    opts.headers['Authorization'] = `Bearer ${AUTH_TOKEN || ''}`
  }
  const res = await fetch(`${BASE}${path}`, opts)
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = text }
  return { ok: res.ok, status: res.status, data }
}

let AUTH_TOKEN = ''

// ====== TESTS ======
async function runAll() {
  console.log('\n========== TDG-BILLING STRESS TEST ==========\n')
  console.log(`Target: ${BASE}\n`)

  // ─── 1. HEALTH CHECK ───
  console.log('─── Module: Health ───')
  const health = await api('GET', '/health')
  log(health.ok ? 'PASS' : 'FAIL', 'GET /health', health.data?.status)

  // ─── 2. AUTH / MOBILE APP ───
  console.log('\n─── Module: Auth (Mobile) ───')
  const authRes = await api('POST', '/api/auth/login', { email: 'admin@tdg.com', password: 'admin123' })
  log(authRes.ok ? 'PASS' : 'FAIL', 'POST /api/auth/login (admin)', authRes.ok ? 'token received' : authRes.data?.message)
  if (authRes.ok) AUTH_TOKEN = authRes.data.token

  if (AUTH_TOKEN) {
    const prof = await api('GET', '/api/auth/profile')
    log(prof.ok ? 'PASS' : 'FAIL', 'GET /api/auth/profile', prof.ok ? prof.data?.name : prof.data?.message)
    const upd = await api('PUT', '/api/auth/profile', { name: 'Admin Updated', phone: '0000000000', email: 'admin@tdg.com' })
    log(upd.ok ? 'PASS' : 'FAIL', 'PUT /api/auth/profile', upd.ok ? 'updated' : upd.data?.message)
  }

  const signupRes = await api('POST', '/api/auth/signup', { name: 'Test User', email: `test${Date.now()}@test.com`, phone: `999999${Date.now() % 10000}`, password: 'test123' })
  log(signupRes.ok ? 'PASS' : 'FAIL', 'POST /api/auth/signup', signupRes.ok ? 'user created' : signupRes.data?.message)

  // ─── 3. MENU ───
  console.log('\n─── Module: Menu ───')
  const menuCat = await api('GET', '/api/menu/categories')
  log(menuCat.ok ? 'PASS' : 'FAIL', 'GET /api/menu/categories', `${menuCat.data?.length || 0} categories`)

  const menuItems = await api('GET', '/api/menu/items')
  log(menuItems.ok ? 'PASS' : 'FAIL', 'GET /api/menu/items', `${menuItems.data?.length || 0} items`)

  const menuAll = await api('GET', '/api/menu')
  log(menuAll.ok ? 'PASS' : 'FAIL', 'GET /api/menu', menuAll.ok ? 'menu data ok' : 'FAIL')

  // ─── 4. BILLING USERS ───
  console.log('\n─── Module: Billing Users ───')
  const billLogin = await api('POST', '/api/billing/login', { pin: '1234' })
  log(billLogin.ok ? 'PASS' : 'FAIL', 'POST /api/billing/login (pin:1234)', billLogin.ok ? billLogin.data?.user?.name : billLogin.data?.error)

  const billUsers = await api('GET', '/api/billing/users')
  log(billUsers.ok ? 'PASS' : 'FAIL', 'GET /api/billing/users', `${billUsers.data?.length || 0} users`)

  // ─── 5. POS ORDERS — 100 orders ───
  console.log('\n─── Module: POS Orders (100x) ───')
  const menuItemIds = menuItems.ok ? menuItems.data.map(i => i.id) : ['m4','m21','m36','m52','m39']
  const menuItemNames = menuItems.ok ? menuItems.data.map(i => i.name) : ['Item1','Item2','Item3','Item4','Item5']
  const menuItemPrices = menuItems.ok ? menuItems.data.map(i => i.price) : [100,129,100,39,59]

  const createdOrders = []
  for (let i = 1; i <= 100; i++) {
    const idx1 = Math.floor(Math.random() * menuItemIds.length)
    const idx2 = Math.floor(Math.random() * menuItemIds.length)
    const qty1 = Math.floor(Math.random() * 3) + 1
    const qty2 = Math.floor(Math.random() * 2) + 1
    const p1 = menuItemPrices[idx1] || 100
    const p2 = menuItemPrices[idx2] || 100
    const sub = (p1 * qty1) + (p2 * qty2)
    const tax = Math.round(sub * 0.18)
    const total = sub + tax
    const tableNum = `T${Math.floor(Math.random() * 20) + 1}`
    const custName = i % 5 === 0 ? `Customer ${i}` : ''
    const custPhone = i % 5 === 0 ? `999999${i}` : ''

    const orderRes = await api('POST', '/api/pos/orders', {
      type: i % 4 === 0 ? 'delivery' : 'dine-in',
      source: 'pos',
      items: [
        { menuItemId: menuItemIds[idx1], menuItemName: menuItemNames[idx1], quantity: qty1, unitPrice: p1, totalPrice: p1 * qty1 },
        { menuItemId: menuItemIds[idx2], menuItemName: menuItemNames[idx2], quantity: qty2, unitPrice: p2, totalPrice: p2 * qty2 }
      ],
      subtotal: sub,
      tax,
      total,
      tableNumber: tableNum,
      customerName: custName,
      customerPhone: custPhone,
      paymentMethod: 'cash'
    })
    const ok = orderRes.ok && orderRes.data?.id
    if (ok) createdOrders.push(orderRes.data)
    log(ok ? 'PASS' : 'FAIL', `Order ${i}/100`, ok ? `#${orderRes.data.orderNumber} table:${tableNum}` : orderRes.data?.error || 'no id')
  }
  console.log(`  → ${createdOrders.length} orders created`)

  // ─── 6. PROCESS ORDERS (pending → preparing → ready → completed/served) ───
  console.log('\n─── Module: Order Processing (100 bills) ───')
  let billedCount = 0
  for (let i = 0; i < createdOrders.length; i++) {
    const order = createdOrders[i]
    // pending → preparing
    const r1 = await api('PATCH', `/api/pos/orders/${order.id}/status`, { status: 'preparing' })
    if (!r1.ok) { log('FAIL', `Order ${i+1} → preparing`, r1.data?.error); continue }
    // preparing → completed
    const payMethod = i % 3 === 0 ? 'cash' : i % 3 === 1 ? 'card' : 'wallet'
    const r2 = await api('PATCH', `/api/pos/orders/${order.id}/status`, { status: 'completed', paymentStatus: 'paid', paymentMethod: payMethod })
    if (r2.ok) billedCount++
    log(r2.ok ? 'PASS' : 'FAIL', `Bill ${i+1}/100`, r2.ok ? `#${order.orderNumber} ${payMethod} ₹${order.total}` : r2.data?.error)
  }
  console.log(`  → ${billedCount} orders billed`)

  // ─── 7. PURCHASES — 50 entries ───
  console.log('\n─── Module: Purchases (50x) ───')
  let purchaseCount = 0
  const suppliers = ['Fresh Poultry Co.', 'City Bakery', 'Food Supplies Inc.', 'BevCo', 'Spice World']
  for (let i = 1; i <= 50; i++) {
    const sup = suppliers[i % suppliers.length]
    const total = Math.floor(Math.random() * 50000) + 1000
    const items = [
      { name: 'Item A', quantity: Math.floor(Math.random() * 50) + 10, rate: Math.floor(Math.random() * 200) + 50 },
      { name: 'Item B', quantity: Math.floor(Math.random() * 30) + 5, rate: Math.floor(Math.random() * 300) + 100 }
    ]
    const res = await api('POST', '/api/purchases', { supplier: sup, items, total })
    if (res.ok) purchaseCount++
    log(res.ok ? 'PASS' : 'FAIL', `Purchase ${i}/50`, res.ok ? `${sup} ₹${total}` : res.data?.error)
  }

  // ─── 8. INVENTORY ───
  console.log('\n─── Module: Inventory ───')
  const invRes = await api('GET', '/api/inventory')
  log(invRes.ok ? 'PASS' : 'FAIL', 'GET /api/inventory', `${invRes.data?.length || 0} items`)
  if (invRes.ok && invRes.data?.length) {
    for (const item of invRes.data.slice(0, 3)) {
      const upd = await api('PATCH', `/api/inventory/${item.id}`, { currentStock: item.currentStock + 50 })
      log(upd.ok ? 'PASS' : 'FAIL', `PATCH /api/inventory/${item.id}`, upd.ok ? `${item.name}: ${item.currentStock} → ${item.currentStock + 50}` : upd.data?.error)
    }
  }

  // ─── 9. EXPENSES ───
  console.log('\n─── Module: Expenses ───')
  const categories = ['Rent', 'Electricity', 'Salary', 'Marketing', 'Maintenance', 'Supplies']
  let expCount = 0
  for (let i = 0; i < 10; i++) {
    const res = await api('POST', '/api/expenses', {
      category: categories[i % categories.length],
      amount: Math.floor(Math.random() * 10000) + 500,
      description: `Test expense ${i+1}`
    })
    if (res.ok) expCount++
    log(res.ok ? 'PASS' : 'FAIL', `Expense ${i+1}/10`, res.ok ? `${categories[i % categories.length]} ₹${res.data?.amount}` : res.data?.error)
  }
  const expGet = await api('GET', '/api/expenses')
  log(expGet.ok ? 'PASS' : 'FAIL', 'GET /api/expenses', `${expGet.data?.length || 0} expenses total`)

  // ─── 10. ONLINE ORDERS ───
  console.log('\n─── Module: Online Orders ───')
  const aggRes = await api('GET', '/api/online-orders/aggregators')
  log(aggRes.ok ? 'PASS' : 'FAIL', 'GET /api/online-orders/aggregators', `${aggRes.data?.length || 0} aggregators`)

  const webhookRes = await api('POST', '/api/online-orders/webhook', {
    aggregator: 'swiggy',
    externalOrderId: `SW${Date.now() % 10000}`,
    customerName: 'Online Customer',
    customerPhone: `99999${Date.now() % 100000}`,
    items: [{ name: 'Chicken Burger', quantity: 2, price: 129, total: 258 }],
    total: 258
  })
  log(webhookRes.ok ? 'PASS' : 'FAIL', 'POST /api/online-orders/webhook', webhookRes.ok ? 'order received' : webhookRes.data?.error)

  if (webhookRes.ok) {
    const onlineOrders = await api('GET', '/api/online-orders')
    log(onlineOrders.ok ? 'PASS' : 'FAIL', 'GET /api/online-orders', `${onlineOrders.data?.length || 0} orders`)

    if (onlineOrders.data?.length) {
      const acceptRes = await api('POST', `/api/online-orders/${onlineOrders.data[0].id}/accept`, { estimatedTime: 25 })
      log(acceptRes.ok ? 'PASS' : 'FAIL', 'POST /api/online-orders/:id/accept', acceptRes.ok ? 'accepted + KOT sent' : acceptRes.data?.error)

      if (acceptRes.ok) {
        const statusRes = await api('PATCH', `/api/online-orders/${onlineOrders.data[0].id}/status`, { platformStatus: 'ready' })
        log(statusRes.ok ? 'PASS' : 'FAIL', 'PATCH /api/online-orders/:id/status (ready)', statusRes.ok ? 'marked ready' : statusRes.data?.error)
      }
    }

    const toggleRes = await api('POST', '/api/online-orders/aggregators/toggle', { id: 'zomato', isActive: false })
    log(toggleRes.ok ? 'PASS' : 'FAIL', 'POST /api/online-orders/aggregators/toggle', toggleRes.ok ? 'zomato toggled off' : toggleRes.data?.error)
  }

  // ─── 11. LOYALTY ───
  console.log('\n─── Module: Loyalty ───')
  log((await api('GET', '/api/loyalty/tiers')).ok ? 'PASS' : 'FAIL', 'GET /api/loyalty/tiers', 'tiers ok')

  const regRes = await api('POST', '/api/loyalty/register', {
    name: 'Loyalty Tester',
    phone: `88888${Date.now() % 100000}`,
    email: `loyalty${Date.now()}@test.com`
  })
  log(regRes.ok ? 'PASS' : 'FAIL', 'POST /api/loyalty/register', regRes.ok ? 'registered' : regRes.data?.error)

  if (regRes.ok) {
    const phone = regRes.data.user.phone
    const userRes = await api('GET', `/api/loyalty/user/${phone}`)
    log(userRes.ok ? 'PASS' : 'FAIL', `GET /api/loyalty/user/${phone}`, userRes.ok ? `${userRes.data?.name} pts:${userRes.data?.rubyPoints}` : userRes.data?.error)

    const profileRes = await api('GET', `/api/loyalty/profile/${phone}`)
    log(profileRes.ok ? 'PASS' : 'FAIL', `GET /api/loyalty/profile/${phone}`, profileRes.ok ? `tier:${profileRes.data?.tier}` : profileRes.data?.error)

    const historyRes = await api('GET', `/api/loyalty/points/history/${phone}`)
    log(historyRes.ok ? 'PASS' : 'FAIL', `GET /api/loyalty/points/history/${phone}`, `${historyRes.data?.length || 0} transactions`)
  }

  // Loyalty: den creation
  const denRes = await api('POST', '/api/loyalty/den/create', { phone: '0000000000', name: 'Test Den' })
  log(denRes.ok ? 'PASS' : 'FAIL', 'POST /api/loyalty/den/create', denRes.ok ? `den:${denRes.data?.name}` : denRes.data?.error)

  const denGet = await api('GET', '/api/loyalty/den/0000000000')
  log(denGet.ok ? 'PASS' : 'FAIL', 'GET /api/loyalty/den/:phone', denGet.ok ? (denGet.data?.den ? 'found' : 'none') : denGet.data?.error)

  // ─── 12. REPORTS ───
  console.log('\n─── Module: Reports ───')
  const report = await api('GET', '/api/reports/daily-closing')
  log(report.ok ? 'PASS' : 'FAIL', 'GET /api/reports/daily-closing', report.ok ?
    `inv:${report.data?.totalInvoices} sales:₹${report.data?.totalSales} exp:₹${report.data?.totalExpenses} purch:₹${report.data?.totalPurchases} profit:₹${report.data?.grossProfit}`
    : report.data?.error)

  // ─── 13. WALLET (mobile) ───
  if (AUTH_TOKEN) {
    console.log('\n─── Module: Wallet ───')
    const wallet = await api('GET', '/api/wallet')
    log(wallet.ok ? 'PASS' : 'FAIL', 'GET /api/wallet', wallet.ok ? `balance:₹${wallet.data?.rubyBalance}` : wallet.data?.message)

    const denProg = await api('GET', '/api/den')
    log(denProg.ok ? 'PASS' : 'FAIL', 'GET /api/den', denProg.ok ? `level:${denProg.data?.denLevel}` : denProg.data?.message)
  }

  // ─── 14. RECIPES / INVENTORY DEDUCTION ───
  console.log('\n─── Module: Recipes ───')
  const recipeRes = await api('POST', '/api/recipes/deduct', { orderItems: [{ menuItemId: 'm4', quantity: 2 }] })
  log(recipeRes.ok ? 'PASS' : 'FAIL', 'POST /api/recipes/deduct', recipeRes.ok ? 'deduction ok' : recipeRes.data?.error)

  // ─── 15. BILLING USER CRUD ───
  console.log('\n─── Module: Billing User CRUD ───')
  const newUser = await api('POST', '/api/billing/users', { name: 'Test Staff', pin: '2468', role: 'cashier', permissions: undefined })
  log(newUser.ok ? 'PASS' : 'FAIL', 'POST /api/billing/users', newUser.ok ? `created:${newUser.data?.user?.name}` : newUser.data?.error)

  if (newUser.ok && newUser.data?.user?.id) {
    const updUser = await api('PUT', `/api/billing/users/${newUser.data.user.id}`, { name: 'Test Staff Updated' })
    log(updUser.ok ? 'PASS' : 'FAIL', `PUT /api/billing/users/${newUser.data.user.id}`, updUser.ok ? 'updated' : updUser.data?.error)

    const delUser = await api('DELETE', `/api/billing/users/${newUser.data.user.id}`)
    log(delUser.ok ? 'PASS' : 'FAIL', `DELETE /api/billing/users/${newUser.data.user.id}`, delUser.ok ? 'deleted' : delUser.data?.error)
  }

  // ─── 16. CHANGE PIN ───
  console.log('\n─── Module: Change PIN ───')
  const changePin = await api('POST', '/api/billing/change-pin', { userId: billUsers.data?.[0]?.id || 'bu_unknown', currentPin: '1234', newPin: '1234' })
  log(changePin.ok ? 'PASS' : 'FAIL', 'POST /api/billing/change-pin', changePin.ok ? 'pin re-set ok' : changePin.data?.error)

  // ─── 17. ONLINE ORDER TOGGLE ───
  console.log('\n─── Module: Aggregators ───')
  const toggleBack = await api('POST', '/api/online-orders/aggregators/toggle', { id: 'zomato', isActive: true })
  log(toggleBack.ok ? 'PASS' : 'FAIL', 'POST /api/online-orders/aggregators/toggle (reactivate)', toggleBack.ok ? 'zomato reactivated' : toggleBack.data?.error)

  // ====== GENERATE REPORT ======
  console.log('\n\n========== STRESS TEST REPORT ==========')
  console.log(`Date: ${new Date().toISOString()}`)
  console.log(`Target: ${BASE}`)
  console.log(`Total Tests: ${R.pass + R.fail}`)
  console.log(`✅ Passed: ${R.pass}`)
  console.log(`❌ Failed: ${R.fail}`)
  console.log(`Success Rate: ${((R.pass / (R.pass + R.fail)) * 100).toFixed(1)}%`)
  console.log('')

  // Group by module
  const modules = {}
  for (const r of R.results) {
    const mod = r.label.split(/[/\s]/)[0] || 'Unknown'
    if (!modules[mod]) modules[mod] = { pass: 0, fail: 0, tests: [] }
    modules[mod][r.status.toLowerCase()]++
    modules[mod].tests.push(r)
  }
  console.log('─── Per Module ───')
  for (const [mod, data] of Object.entries(modules)) {
    const rate = ((data.pass / (data.pass + data.fail)) * 100).toFixed(0)
    console.log(`  ${mod}: ${data.pass}✅ ${data.fail}❌ (${rate}%)`)
  }

  // Failures detail
  const failures = R.results.filter(r => r.status === 'FAIL')
  if (failures.length) {
    console.log('\n─── Failures Detail ───')
    for (const f of failures) {
      console.log(`  ❌ ${f.label}${f.detail ? ': ' + f.detail : ''}`)
    }
  }

  console.log('\n========================================\n')
}

runAll().catch(e => {
  console.error('FATAL:', e.message)
  process.exit(1)
})
