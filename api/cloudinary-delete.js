// Vercel Serverless Function to delete a Cloudinary image securely
// Requires env vars: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, VITE_CLOUDINARY_CLOUD_NAME
// Auth: verifies Firebase ID token via Identity Toolkit and checks admin email

const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { public_id, idToken } = req.body || {};
    if (!public_id || !idToken) {
      res.status(400).json({ error: 'Missing public_id or idToken' });
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;
    const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    if (!adminEmail || !firebaseApiKey) {
      res.status(500).json({ error: 'Server not configured for auth' });
      return;
    }

    // Verify Firebase ID token using Identity Toolkit
    const verifyResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}` , {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (!verifyResp.ok) {
      const err = await verifyResp.json().catch(() => ({}));
      res.status(401).json({ error: 'Invalid auth token', details: err });
      return;
    }
    const verifyData = await verifyResp.json();
    const user = verifyData.users && verifyData.users[0];
    if (!user || user.email !== adminEmail) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Prepare Cloudinary destroy request
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      res.status(500).json({ error: 'Cloudinary server env not configured' });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const form = new URLSearchParams();
    form.set('public_id', public_id);
    form.set('timestamp', String(timestamp));
    form.set('api_key', apiKey);
    form.set('signature', signature);

    const destroyResp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });

    const destroyData = await destroyResp.json();
    if (!destroyResp.ok || destroyData.result !== 'ok') {
      res.status(500).json({ error: 'Cloudinary destroy failed', details: destroyData });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('cloudinary-delete error', e);
    res.status(500).json({ error: 'Server error' });
  }
};

