import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div style={{ 
      backgroundColor: '#292c30', 
      color: '#ffffff', 
      minHeight: '100vh', 
      fontFamily: "'Lexend Deca', sans-serif",
      padding: '60px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <Link to="/" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#ffd700', 
          textDecoration: 'none', 
          fontWeight: 700, 
          fontSize: '14px',
          marginBottom: '30px' 
        }}>
          <ArrowLeft size={16} /> BACK TO HOME
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#1f2225',
            border: '2px solid rgba(255, 215, 0, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: 950, color: '#ffd700', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.5px' }}>
            PRIVACY POLICY
          </h1>
          
          <div style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p><strong>Effective Date:</strong> July 24, 2026</p>
            
            <p>Welcome to Ten Den Gyros (TDG). We are committed to protecting your personal information and your right to privacy. This Privacy Policy governs the privacy policies and practices of our website, mobile application, and POS billing services.</p>
            
            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '18px', marginTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>1. INFORMATION WE COLLECT</h2>
            <p>We collect information you provide directly to us when registering accounts, placing online orders, adding members to your referral Den, or redeeming points balances. This includes your name, mobile phone number, email address, physical delivery addresses, and payment transaction references.</p>

            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '18px', marginTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>2. HOW WE USE YOUR INFORMATION</h2>
            <p>We utilize the collected details to process checkout orders, verify referral accounts using WhatsApp OTP services, manage loyalty and distribution points transactions across your linked Den assets, and improve our services.</p>

            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '18px', marginTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>3. DATA PROTECTION & SHARING</h2>
            <p>Your details are stored securely. We do not sell or trade your data to third-party advertising companies. Transaction information is shared solely with trusted payment aggregators (e.g. CCAvenue) for checkout processing.</p>

            <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '18px', marginTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>4. YOUR RIGHTS</h2>
            <p>You have the right to request deletion of your account details or points history records, update verification settings, or opt out of loyalty distribution schemes at any time by contacting our administrator team at info@tendengyros.com.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
