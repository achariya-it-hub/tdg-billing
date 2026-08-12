// server/routes/whatsapp.js
import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

// Simple in-memory rate limiting: max 20 messages per minute per IP
const rateLimitWindow = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 20;
const ipCounters = {};

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (!ipCounters[ip]) {
    ipCounters[ip] = [];
  }
  // Remove timestamps older than window
  ipCounters[ip] = ipCounters[ip].filter(ts => now - ts < rateLimitWindow);
  if (ipCounters[ip].length >= maxRequestsPerWindow) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }
  ipCounters[ip].push(now);
  next();
}

router.post('/send', rateLimiter, async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required.' });
  }
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return res.status(500).json({ error: 'WhatsApp credentials not configured.' });
  }
  const url = `https://graph.facebook.com/v14.0/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: 'fixed_template', // placeholder name; should match created template
      language: { code: 'en_US' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: message }
          ]
        }
      ]
    }
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return res.status(500).json({ error: 'Failed to send WhatsApp message', details: data });
    }
    return res.json({ success: true, result: data });
  } catch (err) {
    console.error('WhatsApp request error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
