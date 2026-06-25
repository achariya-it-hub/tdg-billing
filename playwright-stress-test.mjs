// TDG Billing — Full E2E Stress Test via Playwright
// Tests all modules through the browser UI

import { chromium } from 'playwright'

const TARGET_URL = 'https://darkslategrey-sandpiper-611004.hostingersite.com'
const REPORT = { pass: 0, fail: 0, steps: [] }
const PINS = { admin: '1234', manager: '5678', cashier: '0000', kitchen: '9999' }

function log(status, label, detail = '') {
  REPORT.steps.push({ status, label, detail })
  const icon = status === 'PASS' ? '✅' : '❌'
  console.log(`  ${icon} [${status}] ${label}${detail ? ' — ' + detail.substring(0, 100) : ''}`)
  if (status === 'PASS') REPORT.pass++; else REPORT.fail++
}

async function click(page, selector, desc) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 })
    await page.click(selector)
    return true
  } catch (e) {
    log('FAIL', desc, `element not found: ${selector}`)
    return false
  }
}

async function fillInput(page, selector, value, desc) {
  try {
    await page.waitForSelector(selector, { timeout: 3000 })
    await page.fill(selector, value)
    return true
  } catch (e) {
    log('FAIL', desc, `input not found: ${selector}`)
    return false
  }
}

async function waitForApp(page) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
}

(async () => {
  console.log('\n========== TDG BILLING — PLAYWRIGHT STRESS TEST ==========\n')
  console.log(`Target: ${TARGET_URL}\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true
  })
  const page = await context.newPage()

  // Collect console errors
  const consoleErrors = []
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', err => consoleErrors.push(err.message))

  try {
    // ─── 1. LOGIN ───
    console.log('─── Module: Login ───')
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)

    // The page should load the React app. Look for the PIN display or keypad
    const loginTitle = await page.locator('text=Staff Login').count()
    if (loginTitle > 0) {
      log('PASS', 'Login page loaded', 'Staff Login visible')

      // Click PIN digits: 1, 2, 3, 4
      await page.locator('button:has-text("1")').click()
      await page.waitForTimeout(100)
      await page.locator('button:has-text("2")').click()
      await page.waitForTimeout(100)
      await page.locator('button:has-text("3")').click()
      await page.waitForTimeout(100)
      await page.locator('button:has-text("4")').click()
      await page.waitForTimeout(2000)

      // Should navigate to POS page
      const posTitle = await page.locator('text=POS').count()
      log(posTitle > 0 ? 'PASS' : 'FAIL', 'Login with PIN 1234', posTitle > 0 ? 'Redirected to POS' : 'POS not visible after login')
    } else {
      log('FAIL', 'Login page', 'Login page did not load')
      await page.screenshot({ path: '/tmp/login-fail.png' })
    }

    // ─── 2. SIDEBAR NAVIGATION ───
    console.log('\n─── Module: Navigation ───')
    const navItems = ['POS', 'Kitchen', 'KOT', 'Billing', 'Menu', 'Inventory', 'Purchase', 'Online Orders', 'Loyalty', 'Customers', 'Expenses', 'Reports', 'Dashboard', 'HR', 'Users']
    for (const item of navItems) {
      const count = await page.locator(`text=${item}`).count()
      log(count > 0 ? 'PASS' : 'FAIL', `Nav item visible: ${item}`, count > 0 ? 'found' : 'missing')
    }

    // ─── 3. POS — Create 100 Orders ───
    console.log('\n─── Module: POS Orders (100x via UI) ───')
    // Navigate to POS
    await page.goto(`${TARGET_URL}/pos`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)

    let ordersCreated = 0
    let ordersFailed = 0

    for (let i = 1; i <= 100; i++) {
      try {
        // Click on a category button (first = Gyros, we cycle through)
        const catIndex = (i % 4) + 1
        const catButtons = page.locator('button').filter({ hasText: /Gyros|Burger|Fried|Chicken|Shakes|Ice Cream/ })
        const catCount = await catButtons.count()
        if (catCount > 0) {
          const targetCat = catIndex % catCount
          await catButtons.nth(targetCat).click()
          await page.waitForTimeout(200)
        }

        // Click on a menu item (first item in the category)
        const items = page.locator('[class*="menu-item"], button').filter({ hasText: /Veg|Non-Veg|Chicken|Fries|Coke/ })
        const itemCount = await items.count()
        if (itemCount > 0) {
          await items.first().click()
          await page.waitForTimeout(100)
        }
        if (itemCount > 1) {
          await items.nth(Math.min(i % itemCount, itemCount - 1)).click()
          await page.waitForTimeout(100)
        }

        // Select table
        const tableSelect = page.locator('select')
        if (await tableSelect.count() > 0) {
          const tableNum = `T${(i % 20) + 1}`
          await tableSelect.selectOption(tableNum)
          await page.waitForTimeout(100)
        }

        // Click Send to Kitchen / Place Order
        const sendBtn = page.locator('button').filter({ hasText: /Send to Kitchen|Place Order|Send/i })
        if (await sendBtn.count() > 0) {
          await sendBtn.first().click()
          await page.waitForTimeout(500)
          ordersCreated++
        } else {
          // Try any primary action button
          const actionBtn = page.locator('button').filter({ hasText: /Order|Place|Send|Submit/i })
          if (await actionBtn.count() > 0) {
            await actionBtn.first().click()
            await page.waitForTimeout(500)
            ordersCreated++
          }
        }
      } catch (e) {
        ordersFailed++
        if (ordersFailed > 5) {
          log('FAIL', 'POS order creation', `Too many failures (${ordersFailed}), stopping`)
          break
        }
      }

      if (i % 10 === 0) {
        console.log(`  → ${i}/100 orders processed (${ordersCreated} created, ${ordersFailed} failed)`)
      }
    }
    log(ordersCreated > 0 ? 'PASS' : 'FAIL', `POS Orders`, `${ordersCreated} created, ${ordersFailed} failed`)

    // ─── 4. BILLING — Process Orders ───
    console.log('\n─── Module: Billing (via UI) ───')
    await page.goto(`${TARGET_URL}/billing`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(3000)

    let billsCompleted = 0
    for (let b = 1; b <= Math.min(ordersCreated, 100); b++) {
      try {
        // Look for a "Pay" or "Complete" or "Bill" button for pending orders
        const payBtn = page.locator('button').filter({ hasText: /Pay|Complete|Bill|Settle/i })
        if (await payBtn.count() > 0) {
          await payBtn.first().click()
          await page.waitForTimeout(500)
          billsCompleted++
        } else {
          // Check if there's an order row to click
          const orderRows = page.locator('table tr, [class*="order"]').filter({ hasText: /T\d|₹/ })
          if (await orderRows.count() > 0) {
            await orderRows.first().click()
            await page.waitForTimeout(300)
            const confirmBtn = page.locator('button').filter({ hasText: /Pay|Complete|Confirm|Settle/i })
            if (await confirmBtn.count() > 0) {
              await confirmBtn.first().click()
              await page.waitForTimeout(500)
              billsCompleted++
            }
          } else {
            break // No more orders to bill
          }
        }
      } catch (e) {
        // skip
      }
    }
    log(billsCompleted > 0 ? 'PASS' : 'FAIL', 'Billing', `${billsCompleted} bills processed`)

    // ─── 5. INVENTORY PAGE ───
    console.log('\n─── Module: Inventory ───')
    await page.goto(`${TARGET_URL}/inventory`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const invItems = await page.locator('table tr, [class*="inventory"]').count()
    log(invItems > 0 ? 'PASS' : 'FAIL', 'Inventory page loaded', `${invItems} items found`)

    // ─── 6. MENU PAGE ───
    console.log('\n─── Module: Menu ───')
    await page.goto(`${TARGET_URL}/menu`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const menuItems = await page.locator('text=/Veg|Non-Veg|Chicken|Fries|Shakes|Coke|Burger|Gyros/').count()
    log(menuItems > 0 ? 'PASS' : 'FAIL', 'Menu page loaded', `${menuItems} items visible`)

    // ─── 7. KITCHEN PAGE ───
    console.log('\n─── Module: Kitchen ───')
    await page.goto(`${TARGET_URL}/kitchen`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(3000)
    const kitConnected = await page.locator('text=Connected').count()
    log(kitConnected > 0 ? 'PASS' : 'FAIL', 'Kitchen page', kitConnected > 0 ? 'WebSocket connected' : 'Not connected')

    // ─── 8. KOT PAGE ───
    console.log('\n─── Module: KOT ───')
    await page.goto(`${TARGET_URL}/kot`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(3000)
    const kotConnected = await page.locator('text=Connected').count()
    log(kotConnected > 0 ? 'PASS' : 'FAIL', 'KOT page', kotConnected > 0 ? 'WebSocket connected' : 'Not connected')

    // ─── 9. PURCHASE PAGE ───
    console.log('\n─── Module: Purchase ───')
    await page.goto(`${TARGET_URL}/purchase`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const purchTabs = await page.locator('text=/Orders|Suppliers|GRN/').count()
    log(purchTabs > 0 ? 'PASS' : 'FAIL', 'Purchase page loaded', purchTabs > 0 ? 'Tabs visible' : 'No tabs')

    // ─── 10. ONLINE ORDERS ───
    console.log('\n─── Module: Online Orders ───')
    await page.goto(`${TARGET_URL}/online-orders`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const onlineUI = await page.locator('text=/Swiggy|Zomato|Zepto|Aggregator/').count()
    log(onlineUI > 0 ? 'PASS' : 'FAIL', 'Online Orders page', onlineUI > 0 ? 'Content loaded' : 'No content')

    // ─── 11. EXPENSES ───
    console.log('\n─── Module: Expenses ───')
    await page.goto(`${TARGET_URL}/expenses`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const expUI = await page.locator('text=/Expense|Category|Amount|Add Expense|Total/').count()
    log(expUI > 0 ? 'PASS' : 'FAIL', 'Expenses page', expUI > 0 ? 'Content loaded' : 'No content')

    // ─── 12. LOYALTY ───
    console.log('\n─── Module: Loyalty ───')
    await page.goto(`${TARGET_URL}/loyalty`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const loyUI = await page.locator('text=/Ruby|Points|Tier|Bronze|Silver|Gold/').count()
    log(loyUI > 0 ? 'PASS' : 'FAIL', 'Loyalty page', loyUI > 0 ? 'Content loaded' : 'No content')

    // ─── 13. CUSTOMERS ───
    console.log('\n─── Module: Customers ───')
    await page.goto(`${TARGET_URL}/customers`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const custUI = await page.locator('text=/Customer|Phone|Search|Name/').count()
    log(custUI > 0 ? 'PASS' : 'FAIL', 'Customers page', custUI > 0 ? 'Content loaded' : 'No content')

    // ─── 14. REPORTS ───
    console.log('\n─── Module: Reports ───')
    await page.goto(`${TARGET_URL}/reports`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const repUI = await page.locator('text=/Sales|Revenue|Report|Daily|Closing|Profit/').count()
    log(repUI > 0 ? 'PASS' : 'FAIL', 'Reports page', repUI > 0 ? 'Content loaded' : 'No content')

    // ─── 15. DASHBOARD ───
    console.log('\n─── Module: Dashboard ───')
    await page.goto(`${TARGET_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const dashUI = await page.locator('text=/Sales|Revenue|Order|Total|Today/').count()
    log(dashUI > 0 ? 'PASS' : 'FAIL', 'Dashboard page', dashUI > 0 ? 'Content loaded' : 'No content')

    // ─── 16. HR ───
    console.log('\n─── Module: HR ───')
    await page.goto(`${TARGET_URL}/hr`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const hrUI = await page.locator('text=/Staff|Employee|Department|Attendance/').count()
    log(hrUI > 0 ? 'PASS' : 'FAIL', 'HR page', hrUI > 0 ? 'Content loaded' : 'No content')

    // ─── 17. USERS ───
    console.log('\n─── Module: Users ───')
    await page.goto(`${TARGET_URL}/users`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const userUI = await page.locator('text=/User|Permission|Role|Admin|Manager|Cashier/').count()
    log(userUI > 0 ? 'PASS' : 'FAIL', 'Users page', userUI > 0 ? 'Content loaded' : 'No content')

    // ─── 18. CHECK FOR JS ERRORS ───
    console.log('\n─── Module: Console Errors ───')
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('manifest') && !e.includes('service worker') &&
      !e.includes('_redirects') && !e.includes('404') && !e.includes('TDG LOGO')
    )
    log(criticalErrors.length === 0 ? 'PASS' : 'FAIL', 'No critical console errors',
      criticalErrors.length > 0 ? `${criticalErrors.length} errors found: ${criticalErrors[0]?.substring(0, 80)}` : 'Clean console')

    // ─── REPORT ───
    console.log('\n\n========== PLAYWRIGHT STRESS TEST REPORT ==========')
    console.log(`Target: ${TARGET_URL}`)
    console.log(`Total Tests: ${REPORT.pass + REPORT.fail}`)
    console.log(`✅ Passed: ${REPORT.pass}`)
    console.log(`❌ Failed: ${REPORT.fail}`)
    console.log(`Success Rate: ${((REPORT.pass / (REPORT.pass + REPORT.fail)) * 100).toFixed(1)}%`)
    console.log('')
    console.log('─── Failures Detail ───')
    for (const s of REPORT.steps.filter(s => s.status === 'FAIL')) {
      console.log(`  ❌ ${s.label}${s.detail ? ': ' + s.detail : ''}`)
    }
    console.log('\n=================================================\n')

    await page.screenshot({ path: '/tmp/stress-test-final.png', fullPage: true })
    console.log('Screenshot: /tmp/stress-test-final.png')

  } catch (e) {
    console.error('FATAL:', e.message)
    await page.screenshot({ path: '/tmp/stress-test-fatal.png' })
  } finally {
    await browser.close()
  }
})()
