const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET /api/payments/methods — Available payment gateways
router.get('/methods', (req, res) => {
  const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY || null;
  const stripePublicKey = process.env.STRIPE_PUBLIC_KEY || null;

  res.json({
    midtrans: {
      enabled: Boolean(midtransClientKey),
      client_key: midtransClientKey,
      supported_methods: ['qris', 'gopay', 'bca_va', 'mandiri_va', 'bni_va']
    },
    stripe: {
      enabled: Boolean(stripePublicKey),
      public_key: stripePublicKey,
      supported_methods: ['card', 'google_pay', 'apple_pay']
    },
    manual_transfer: {
      enabled: true
    }
  });
});

// POST /api/payments/checkout-session — Create payment request
router.post('/checkout-session', auth, async (req, res) => {
  const { plan, gateway = 'auto' } = req.body;
  const userId = req.user.id;

  if (!['pro', 'enterprise'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  const prices = {
    pro: { idr: 450000, usd: 29 },
    enterprise: { idr: 3000000, usd: 199 }
  };

  const amountIdr = prices[plan].idr;
  const orderId = `VIBE-${plan.toUpperCase()}-${userId}-${Date.now()}`;

  try {
    // Record pending transaction log
    await pool.query(
      `INSERT INTO usage_logs (user_id, action, resource_type, resource_id) VALUES ($1, $2, $3, $4)`,
      [userId, `checkout_initiated_${plan}`, 'subscription', 0]
    ).catch(() => {});

    // If Midtrans Server Key is configured in environment:
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    if (midtransServerKey && (gateway === 'midtrans' || gateway === 'auto')) {
      const authHeader = Buffer.from(midtransServerKey + ':').toString('base64');
      const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
      const snapUrl = isProduction 
        ? 'https://app.midtrans.com/snap/v1/transactions' 
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const response = await fetch(snapUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authHeader}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: amountIdr
          },
          customer_details: {
            first_name: req.user.name,
            email: req.user.email
          },
          item_details: [{
            id: plan,
            price: amountIdr,
            quantity: 1,
            name: `Promptara ${plan.toUpperCase()} Plan Subscription`
          }]
        })
      });

      const snapData = await response.json();
      if (response.ok && snapData.token) {
        return res.json({
          gateway: 'midtrans',
          token: snapData.token,
          redirect_url: snapData.redirect_url,
          order_id: orderId
        });
      }
    }

    // Fallback response for manual bank transfer if gateway API keys are not set
    res.json({
      gateway: 'manual',
      order_id: orderId,
      amount_idr: amountIdr,
      amount_usd: prices[plan].usd,
      message: 'Automatic payment gateway keys not configured on server. Please use manual bank transfer.'
    });

  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/payments/webhook — Midtrans / Gateway notification handler
router.post('/webhook', async (req, res) => {
  const notification = req.body;
  console.log('[PAYMENT WEBHOOK RECEIVED]', notification);

  try {
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing order_id' });
    }

    // Order ID format: VIBE-PRO-12-1678900000
    const parts = orderId.split('-');
    if (parts.length < 3 || parts[0] !== 'VIBE') {
      return res.status(400).json({ error: 'Invalid order_id format' });
    }

    const plan = parts[1].toLowerCase();
    const userId = parseInt(parts[2]);

    let isSuccess = false;
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') isSuccess = true;
    } else if (transactionStatus === 'settlement') {
      isSuccess = true;
    }

    if (isSuccess) {
      // Upgrade user plan in DB
      await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, userId]);
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan, status, expires_at)
         VALUES ($1, $2, 'active', NOW() + INTERVAL '1 year')
         ON CONFLICT (user_id) DO UPDATE SET plan = EXCLUDED.plan, status = 'active', expires_at = NOW() + INTERVAL '1 year'`,
        [userId, plan]
      );

      console.log(`✅ [PAYMENT SUCCESS] Upgraded user ${userId} to plan ${plan}`);
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.error('Payment webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

module.exports = router;
