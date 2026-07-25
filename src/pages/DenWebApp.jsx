import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Download, QrCode, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DenWebApp() {
  const [viewMode, setViewMode] = useState('responsive'); // 'responsive' | 'mobile_frame' | 'fullscreen'
  const [key, setKey] = useState(0);

  const reloadApp = () => setKey(prev => prev + 1);

  return (
    <div style={{
      backgroundColor: '#121316',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Lexend Deca', sans-serif",
      overflow: 'hidden'
    }}>
      {/* Top Header Bar for Den Web App */}
      <header style={{
        backgroundColor: '#1a1c22',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
        height: '52px'
      }}>
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#ffd700',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 800,
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <ArrowLeft size={14} /> WEBSITE
          </a>
          <div style={{ height: '18px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/tdg-logo.png" alt="TDG" style={{ height: '24px', width: 'auto' }} onError={e => e.target.src='/favicon.svg'} />
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', letterSpacing: '1px' }}>
              MY DEN <span style={{ color: '#ffd700', fontSize: '11px', fontWeight: 700 }}>web app</span>
            </span>
          </div>
        </div>

        {/* Center: View Switcher (Desktop vs Mobile Frame vs Fullscreen) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#121316',
          padding: '3px 8px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={() => setViewMode('responsive')}
            style={{
              background: viewMode === 'responsive' ? '#ffd700' : 'transparent',
              color: viewMode === 'responsive' ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '12px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Monitor size={13} /> Fullscreen
          </button>
          <button
            onClick={() => setViewMode('mobile_frame')}
            style={{
              background: viewMode === 'mobile_frame' ? '#ffd700' : 'transparent',
              color: viewMode === 'mobile_frame' ? '#000' : '#aaa',
              border: 'none',
              borderRadius: '12px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Smartphone size={13} /> Phone View
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={reloadApp}
            title="Reload App"
            style={{
              background: 'transparent',
              color: '#ffd700',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <a
            href="/app.apk"
            download
            style={{
              backgroundColor: '#e63946',
              color: '#fff',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Download size={13} /> GET APK
          </a>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{
        flex: 1,
        backgroundColor: '#0c0d0f',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {viewMode === 'mobile_frame' ? (
          <div style={{
            width: '390px',
            height: '780px',
            maxHeight: 'calc(100vh - 80px)',
            backgroundColor: '#000000',
            borderRadius: '40px',
            padding: '10px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 0 2px #2d3139, 0 0 30px rgba(255, 215, 0, 0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <iframe
              key={key}
              src={`/app/index.html?t=${key}`}
              title="Ten Den Gyros Mobile Web App"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '30px',
                backgroundColor: '#292c30'
              }}
            />
          </div>
        ) : (
          <iframe
            key={key}
            src={`/app/index.html?t=${key}`}
            title="Ten Den Gyros Web App"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#292c30'
            }}
          />
        )}
      </main>
    </div>
  );
}
