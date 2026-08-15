import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Tablet, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  ExternalLink, 
  QrCode, 
  ArrowLeft, 
  Sparkles,
  ShoppingBag,
  Home,
  Menu as MenuIcon,
  User,
  Wallet,
  Gift,
  Bell,
  CheckCircle,
  Plus,
  Flame,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobilePreview() {
  const [deviceModel, setDeviceModel] = useState('iphone15'); // iphone15 | pixel8 | ipad
  const [orientation, setOrientation] = useState('portrait'); // portrait | landscape
  const [scale, setScale] = useState(1);
  const [activeScreen, setActiveScreen] = useState('home'); // home | menu | customizer | cart | wallet | referral | profile | order_placed
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [cartCount, setCartCount] = useState(2);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Check if flutter web app build is available at /app/
  const flutterAppUrl = '/app/index.html';

  const screens = [
    { id: 'home', label: 'Home Feed', icon: <Home size={16} /> },
    { id: 'menu', label: 'Menu & Categories', icon: <MenuIcon size={16} /> },
    { id: 'customizer', label: 'Gyro Builder', icon: <Flame size={16} /> },
    { id: 'cart', label: 'Cart & Checkout', icon: <ShoppingBag size={16} /> },
    { id: 'wallet', label: 'My Wallet & Assets', icon: <Wallet size={16} /> },
    { id: 'referral', label: 'Refer & Earn', icon: <Gift size={16} /> },
    { id: 'order_placed', label: 'Order Success', icon: <CheckCircle size={16} /> },
    { id: 'profile', label: 'User Profile', icon: <User size={16} /> },
  ];

  const getDeviceDimensions = () => {
    if (deviceModel === 'ipad') {
      return orientation === 'portrait' ? { w: 420, h: 620 } : { w: 620, h: 420 };
    }
    if (deviceModel === 'pixel8') {
      return orientation === 'portrait' ? { w: 360, h: 720 } : { w: 720, h: 360 };
    }
    // iphone15 pro default
    return orientation === 'portrait' ? { w: 375, h: 760 } : { w: 760, h: 375 };
  };

  const dim = getDeviceDimensions();

  return (
    <div style={{
      backgroundColor: '#121316',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: "'Lexend Deca', 'Outfit', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Controls Header */}
      <header style={{
        backgroundColor: '#1a1c22',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left: Navigation back to main web app */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#ffd700',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <ArrowLeft size={16} /> BACK TO WEBSITE
          </Link>
          <div style={{ height: '24px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <h1 style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.5px', margin: 0 }}>
              TDG MOBILE APP PREVIEW
            </h1>
          </div>
        </div>

        {/* Center: Device Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#121316',
          padding: '4px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Models */}
          <button 
            onClick={() => setDeviceModel('iphone15')}
            style={{
              background: deviceModel === 'iphone15' ? '#ffd700' : 'transparent',
              color: deviceModel === 'iphone15' ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '14px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Smartphone size={14} /> iPhone 15 Pro
          </button>

          <button 
            onClick={() => setDeviceModel('pixel8')}
            style={{
              background: deviceModel === 'pixel8' ? '#ffd700' : 'transparent',
              color: deviceModel === 'pixel8' ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '14px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Smartphone size={14} /> Pixel 8
          </button>

          <button 
            onClick={() => setDeviceModel('ipad')}
            style={{
              background: deviceModel === 'ipad' ? '#ffd700' : 'transparent',
              color: deviceModel === 'ipad' ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '14px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Tablet size={14} /> Tablet
          </button>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Rotate */}
          <button
            onClick={() => setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')}
            title="Rotate Device"
            style={{
              background: 'transparent',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RotateCw size={16} />
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => setScale(prev => Math.max(0.7, prev - 0.1))}
            style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '11px', color: '#ffd700', minWidth: '35px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(prev => Math.min(1.2, prev + 0.1))}
            style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Right: Download APK & QR Code */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowQrModal(true)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <QrCode size={14} /> SCAN QR
          </button>

          <a
            href="/app.apk"
            download
            style={{
              backgroundColor: '#e63946',
              color: '#fff',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(230, 57, 70, 0.3)'
            }}
          >
            <Download size={14} /> DOWNLOAD APK
          </a>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Left Side Panel: Interactive Screen Selector */}
        <aside style={{
          width: '260px',
          backgroundColor: '#16181d',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              📱 App Screens Navigation
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>
              Click any screen below to preview the mobile UI state in real-time:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {screens.map(scr => {
              const active = activeScreen === scr.id;
              return (
                <button
                  key={scr.id}
                  onClick={() => setActiveScreen(scr.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: active ? '1px solid rgba(255, 215, 0, 0.5)' : '1px solid transparent',
                    backgroundColor: active ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#ffd700' : '#d1d5db',
                    fontSize: '13px',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {scr.icon}
                    <span>{scr.label}</span>
                  </div>
                  {active && <ChevronRight size={14} color="#ffd700" />}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', backgroundColor: 'rgba(255, 215, 0, 0.04)', border: '1px dashed rgba(255, 215, 0, 0.2)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd700', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
              <Zap size={14} /> Flutter Native App
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>
              Compiled for Android & Web. Experience smooth 60FPS animations, offline sync, & instant order processing.
            </p>
          </div>
        </aside>

        {/* Center Canvas: Interactive Phone Mockup */}
        <main style={{
          flex: 1,
          backgroundColor: '#0c0d0f',
          backgroundImage: 'radial-gradient(rgba(255, 215, 0, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          overflow: 'auto'
        }}>
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease, width 0.3s ease, height 0.3s ease'
          }}>
            {/* Realistic Phone Bezel Frame */}
            <div style={{
              width: `${dim.w}px`,
              height: `${dim.h}px`,
              backgroundColor: '#000000',
              borderRadius: deviceModel === 'ipad' ? '28px' : '44px',
              padding: deviceModel === 'ipad' ? '12px' : '10px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 2px #2d3139, 0 0 0 5px #1a1c22, 0 0 30px rgba(255, 215, 0, 0.15)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Dynamic Island / Notch */}
              {orientation === 'portrait' && deviceModel !== 'ipad' && (
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: deviceModel === 'iphone15' ? '90px' : '70px',
                  height: deviceModel === 'iphone15' ? '24px' : '18px',
                  backgroundColor: '#000000',
                  borderRadius: '14px',
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.05)'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d2238', border: '1px solid #1a365d' }} />
                </div>
              )}

              {/* Status Bar */}
              <div style={{
                height: '34px',
                backgroundColor: '#1f2124',
                color: '#fff',
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 700,
                zIndex: 90,
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span>{currentTime}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>5G</span>
                  <span>📶</span>
                  <span>🔋 98%</span>
                </div>
              </div>

              {/* Mobile Screen Display View */}
              <div style={{
                flex: 1,
                backgroundColor: '#292c30',
                color: '#ffffff',
                overflowY: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    {renderMobileScreen(activeScreen, setActiveScreen, cartCount, setCartCount)}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mobile Bottom Navigation Bar */}
              <div style={{
                height: '56px',
                backgroundColor: '#1f2124',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                zIndex: 90,
                paddingBottom: '6px'
              }}>
                {[
                  { id: 'home', icon: <Home size={18} />, label: 'Home' },
                  { id: 'menu', icon: <MenuIcon size={18} />, label: 'Menu' },
                  { id: 'customizer', icon: <Flame size={18} />, label: 'Build' },
                  { id: 'cart', icon: <ShoppingBag size={18} />, label: 'Cart', badge: cartCount },
                  { id: 'wallet', icon: <Wallet size={18} />, label: 'Wallet' },
                ].map(item => {
                  const active = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveScreen(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: active ? '#ffd700' : '#8e8e93',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '9px',
                        fontWeight: active ? 800 : 500,
                        cursor: 'pointer',
                        position: 'relative',
                        padding: '4px'
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          backgroundColor: '#e63946',
                          color: '#fff',
                          fontSize: '8px',
                          fontWeight: 900,
                          width: '13px',
                          height: '13px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Home Bar Indicator */}
              {deviceModel !== 'ipad' && (
                <div style={{
                  height: '12px',
                  backgroundColor: '#1f2124',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100px',
                    height: '4px',
                    backgroundColor: '#ffffff',
                    opacity: 0.4,
                    borderRadius: '2px'
                  }} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* QR Modal */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1f2124',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '360px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ color: '#ffd700', fontSize: '18px', fontWeight: 900, margin: '0 0 8px' }}>
              📱 Open on Real Device
            </h3>
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '20px' }}>
              Scan with your phone camera or download the Android APK directly.
            </p>
            <div style={{
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '12px',
              display: 'inline-block',
              marginBottom: '20px'
            }}>
              {/* Simulated QR graphic */}
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://tendengyros.com/mobile" 
                alt="QR Code" 
                style={{ width: '160px', height: '160px', display: 'block' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div>
              <button
                onClick={() => setShowQrModal(false)}
                style={{
                  backgroundColor: '#ffd700',
                  color: '#000',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '13px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component to render interactive screen previews
function renderMobileScreen(screenId, setScreen, cartCount, setCartCount) {
  switch (screenId) {
    case 'home':
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(255,215,0,0.15)', border: '1px solid #ffd700',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#ffd700', fontSize: '12px'
              }}>
                TDG
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>Welcome to</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>TENDENS GYROS</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
                borderRadius: '12px', padding: '4px 8px', fontSize: '10px', fontWeight: 800, color: '#ffd700'
              }}>
                🪙 450 PTS
              </div>
            </div>
          </div>

          {/* Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #3d1b04 0%, #170900 100%)',
            border: '1px solid rgba(255, 215, 0, 0.4)',
            borderRadius: '16px',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffd700', letterSpacing: '1px' }}>FLAME-GRILLED SPECIAL</span>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: '4px 0 6px' }}>AUTHENTIC GREEK GYRO WRAPS</h3>
            <p style={{ fontSize: '10px', color: '#d1d5db', margin: '0 0 10px', lineHeight: 1.3 }}>Stuffed with tender marinated meat, crisp veggies, & cool homemade tzatziki spread.</p>
            <button 
              onClick={() => setScreen('customizer')}
              style={{
                backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '6px',
                padding: '6px 14px', fontSize: '10px', fontWeight: 900, cursor: 'pointer'
              }}
            >
              BUILD YOUR GYRO 🌯
            </button>
          </div>

          {/* Categories Horizontal */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#ffd700', marginBottom: '8px' }}>POPULAR CATEGORIES</div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { name: 'Gyros', icon: '🌯' },
                { name: 'Burgers', icon: '🍔' },
                { name: 'Sides', icon: '🍟' },
                { name: 'Shakes', icon: '🥤' },
                { name: 'Crispy', icon: '🍗' }
              ].map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setScreen('menu')}
                  style={{
                    backgroundColor: '#34393e', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer'
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Menu Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff' }}>SIGNATURE DISHES</span>
              <span onClick={() => setScreen('menu')} style={{ fontSize: '10px', color: '#ffd700', fontWeight: 700, cursor: 'pointer' }}>View All</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { name: 'Chicken Gyro Wrap', price: '₹99', img: '/hero_gyro_wrap.png', desc: 'Marinated chicken & tzatziki' },
                { name: 'Crispy Falafel Gyro', price: '₹99', img: '/crispy_chicken.png', desc: 'Golden falafel & tahini' },
                { name: 'Beef Gyro Plate', price: '₹120', img: '/hero_greek_gyro.png', desc: 'Flame-seared beef slices' },
                { name: 'Loaded Fries', price: '₹79', img: '/hero_wide_gyro.png', desc: 'Cheese & seasoned spices' }
              ].map((item, i) => (
                <div key={i} style={{
                  backgroundColor: '#34393e',
                  borderRadius: '12px',
                  padding: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ height: '80px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', backgroundColor: '#1a1c22' }}>
                    <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='/hero_gyro.png'} />
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '9px', color: '#9ca3af', margin: '2px 0 6px' }}>{item.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: '#ffd700' }}>{item.price}</span>
                    <button 
                      onClick={() => setCartCount(prev => prev + 1)}
                      style={{
                        backgroundColor: '#e63946', color: '#fff', border: 'none', borderRadius: '6px',
                        padding: '4px 8px', fontSize: '9px', fontWeight: 900, cursor: 'pointer'
                      }}
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'menu':
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#ffd700' }}>EXPLORE FULL MENU</div>
          <div style={{
            backgroundColor: '#34393e', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            🔍 Search gyros, burgers, shakes...
          </div>
          {[
            { name: 'Ten Den Signature Chicken Gyro', cat: 'GYROS', price: '₹99', desc: 'Juicy flame-grilled chicken, red onions, diced tomatoes, french fries inside, signature garlic tzatziki.' },
            { name: 'Greek Lamb Gyro Supreme', cat: 'GYROS', price: '₹140', desc: 'Slow roasted minced lamb, feta cheese crumble, oregano seasoning, cucumber tzatziki.' },
            { name: 'Crispy Falafel Mediterranean Wrap', cat: 'GYROS', price: '₹99', desc: 'Handcrafted chickpea falafel patties, hummus spread, fresh parsley, tahini dip.' },
            { name: 'Loaded Cheesy Gyro Fries', cat: 'SIDES', price: '₹89', desc: 'Crispy skin-on fries topped with melted mozzarella, pickled jalapenos, house sauce.' },
            { name: 'Kunafa Pistachio Thick Shake', cat: 'SHAKES', price: '₹149', desc: 'Rich creamy ice cream blended with toasted kataifi kunafa & crushed roasted pistachios.' }
          ].map((item, idx) => (
            <div key={idx} style={{
              backgroundColor: '#34393e', borderRadius: '10px', padding: '12px',
              border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '8px', fontWeight: 900, color: '#ffd700', backgroundColor: 'rgba(255,215,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.cat}
                </span>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '9.5px', color: '#9ca3af', margin: '3px 0 6px', lineHeight: 1.3 }}>{item.desc}</div>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#ffd700' }}>{item.price}</div>
              </div>
              <button 
                onClick={() => setCartCount(p => p + 1)}
                style={{
                  backgroundColor: '#e63946', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '8px 12px', fontSize: '10px', fontWeight: 900, cursor: 'pointer'
                }}
              >
                + ADD
              </button>
            </div>
          ))}
        </div>
      );

    case 'customizer':
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid #ffd700', borderRadius: '10px', padding: '10px' }}>
            <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffd700' }}>CUSTOM GYRO BUILDER</span>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff', marginTop: '2px' }}>CRAFT YOUR PERFECT WRAP</div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>STEP 1: SELECT PROTEIN</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {['Flame Chicken (+₹99)', 'Roasted Lamb (+₹140)', 'Grilled Beef (+₹120)', 'Crispy Falafel (+₹89)'].map((p, i) => (
              <div key={i} style={{
                backgroundColor: i === 0 ? '#ffd700' : '#34393e',
                color: i === 0 ? '#000' : '#fff',
                padding: '10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textAlign: 'center', cursor: 'pointer'
              }}>
                {p}
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700', marginTop: '6px' }}>STEP 2: SELECT SPREAD</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {['Garlic Tzatziki', 'Spicy Mayo', 'Hummus', 'Tahini Dip'].map((s, i) => (
              <div key={i} style={{
                backgroundColor: i === 0 ? 'rgba(255,215,0,0.2)' : '#34393e',
                color: i === 0 ? '#ffd700' : '#fff',
                border: i === 0 ? '1px solid #ffd700' : '1px solid transparent',
                padding: '8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, textAlign: 'center'
              }}>
                {s}
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              setCartCount(c => c + 1);
              setScreen('cart');
            }}
            style={{
              backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '8px',
              padding: '12px', fontSize: '12px', fontWeight: 900, cursor: 'pointer', marginTop: '10px'
            }}
          >
            ADD CUSTOM GYRO TO CART (₹99) 🛒
          </button>
        </div>
      );

    case 'cart':
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#ffd700' }}>YOUR BASKET ({cartCount} ITEMS)</div>
          
          <div style={{ backgroundColor: '#34393e', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#fff' }}>
              <span>Chicken Gyro Wrap</span>
              <span>₹99</span>
            </div>
            <div style={{ fontSize: '9px', color: '#9ca3af', margin: '2px 0' }}>Quantity: 1 • Extra Tzatziki</div>
          </div>

          <div style={{ backgroundColor: '#34393e', borderRadius: '10px', padding: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#fff' }}>
              <span>Loaded Cheesy Gyro Fries</span>
              <span>₹89</span>
            </div>
            <div style={{ fontSize: '9px', color: '#9ca3af', margin: '2px 0' }}>Quantity: 1</div>
          </div>

          <div style={{ backgroundColor: '#1f2124', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
              <span>Subtotal</span><span>₹188</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
              <span>Taxes & GST (5%)</span><span>₹9.40</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#10b981', marginBottom: '8px' }}>
              <span>Den Points Discount</span><span>-₹10.00</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '8px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: '#ffd700' }}>
              <span>TOTAL</span><span>₹187.40</span>
            </div>
          </div>

          <button
            onClick={() => setScreen('order_placed')}
            style={{
              backgroundColor: '#e63946', color: '#fff', border: 'none', borderRadius: '8px',
              padding: '12px', fontSize: '12px', fontWeight: 900, cursor: 'pointer'
            }}
          >
            PLACE ORDER NOW (₹187.40) 💳
          </button>
        </div>
      );

    case 'wallet':
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #2b2005 0%, #120e02 100%)',
            border: '1px solid #ffd700', borderRadius: '14px', padding: '16px'
          }}>
            <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>TDG REWARDS WALLET</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffd700', margin: '4px 0' }}>🪙 450 POINTS</div>
            <div style={{ fontSize: '9.5px', color: '#d1d5db' }}>Equivalent value: ₹45.00 discount on your next meal</div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 900, color: '#fff' }}>MY ASSETS & LEVELS</div>
          <div style={{ backgroundColor: '#34393e', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffd700' }}>SILVER DEN MEMBER</div>
              <div style={{ fontSize: '9px', color: '#9ca3af' }}>3 assets active in your network</div>
            </div>
          </div>

          <button 
            onClick={() => setScreen('referral')}
            style={{
              backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '8px',
              padding: '10px', fontSize: '11px', fontWeight: 900, cursor: 'pointer'
            }}
          >
            + ADD NEW ASSETS & EARN BONUS
          </button>
        </div>
      );

    case 'referral':
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#ffd700' }}>BUILD YOUR DEN</div>
          <p style={{ fontSize: '10px', color: '#aaa', margin: 0 }}>Refer friends to TDG. New friends get 15% OFF on 1st visit & 10% OFF on repeat visits! You earn 5% wallet cashback.</p>
          <div style={{ backgroundColor: '#34393e', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px dashed #ffd700' }}>
            <div style={{ fontSize: '9px', color: '#aaa' }}>YOUR REFERRAL CODE</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffd700', letterSpacing: '2px', margin: '4px 0' }}>TDG-GOLD-99</div>
            <button style={{ backgroundColor: 'rgba(255,215,0,0.15)', color: '#ffd700', border: '1px solid #ffd700', padding: '4px 12px', borderRadius: '4px', fontSize: '9px', fontWeight: 800 }}>
              COPY CODE
            </button>
          </div>
          <div style={{ backgroundColor: '#1a1c22', border: '1px solid rgba(255,215,0,0.2)', padding: '10px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#ffd700', marginBottom: '2px' }}>BENEFITS & TIER RULES</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#fff' }}>
              <span>🎁 Referred Friend 1st Visit</span><span style={{ color: '#ffd700', fontWeight: 800 }}>15% OFF</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#fff' }}>
              <span>🔁 Referred Friend Repeat Visit</span><span style={{ color: '#ffd700', fontWeight: 800 }}>10% OFF</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#fff' }}>
              <span>⭐ Primary User Initial Discount</span><span style={{ color: '#ffd700', fontWeight: 800 }}>30% OFF</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#fff' }}>
              <span>👥 Network Threshold</span><span style={{ color: '#ffd700', fontWeight: 800 }}>Add 10 Friends</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#fff' }}>
              <span>👔 Staff Discount & Reimbursement</span><span style={{ color: '#ffd700', fontWeight: 800 }}>50% OFF</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#fff' }}>
              <span>🚀 Partner Level Unlock</span><span style={{ color: '#ffd700', fontWeight: 800 }}>₹5,000 Spend</span>
            </div>
          </div>
        </div>
      );

    case 'order_placed':
      return (
        <div style={{ padding: '24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textCenter: 'center', flex: 1 }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '12px'
          }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 900, margin: '0 0 4px' }}>ORDER PLACED!</h2>
          <p style={{ color: '#ffd700', fontSize: '12px', fontWeight: 700, margin: '0 0 12px' }}>Order #TDG-8842</p>
          <p style={{ color: '#9ca3af', fontSize: '10px', textAlign: 'center', lineHeight: 1.4, margin: '0 0 20px' }}>
            Done, thanks for your order! We've received your request and our chefs are grilling it fresh.
          </p>
          <button 
            onClick={() => setScreen('home')}
            style={{
              backgroundColor: '#ffd700', color: '#000', border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '11px', fontWeight: 900, cursor: 'pointer'
            }}
          >
            BACK TO HOME
          </button>
        </div>
      );

    case 'profile':
      return (
        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#34393e', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '18px' }}>
              TD
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>Demo User</div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>9999999999 • Gold Den Member</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            {[
              { title: 'Personal Information', icon: '👤' },
              { title: 'My Orders', icon: '🧾' },
              { title: 'My Assets', icon: '👥' },
              { title: 'Addresses', icon: '📍' },
              { title: 'Payment Methods', icon: '💳' },
              { title: 'Terms & Conditions', icon: '📄' },
              { title: 'Help & Support', icon: '❓' },
              { title: 'Logout', icon: '🚪', isRed: true }
            ].map((item, i) => (
              <div key={i} style={{
                backgroundColor: '#34393e',
                padding: '12px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 600,
                color: item.isRed ? '#e63946' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
                <span style={{ opacity: 0.5, fontSize: '14px' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
