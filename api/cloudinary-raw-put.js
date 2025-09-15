// Vercel Serverless Function to upload/overwrite a JSON file to Cloudinary (raw resource)
// Requires env vars: CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, VITE_CLOUDINARY_CLOUD_NAME
// Auth: verifies Firebase ID token via Identity Toolkit and checks admin email

const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, data, idToken } = req.body || {};
    if (!name || typeof name !== 'string' || !['events','reflections','gallery'].includes(name)) {
      res.status(400).json({ error: 'Invalid or missing name' });
      return;
    }
    if (typeof data === 'undefined') {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if (!idToken) {
      res.status(401).json({ error: 'Missing idToken' });
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;
    const firebaseApiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    if (!adminEmail || !firebaseApiKey) {
      res.status(500).json({ error: 'Server not configured for auth' });
      return;
    }

    // Verify Firebase ID token via Identity Toolkit
    const verifyResp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`, {
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

    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      res.status(500).json({ error: 'Cloudinary server env not configured' });
      return;
    }

    const publicId = `site-data/${name}.json`;
    const timestamp = Math.floor(Date.now() / 1000);
    const overwrite = true;
    const invalidate = true;

    // Build signature
    const paramsToSign = [
      `invalidate=${invalidate}`,
      `overwrite=${overwrite}`,
      `public_id=${publicId}`,
      `timestamp=${timestamp}`,
    ].sort().join('&');
    const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

    // Prepare body
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const base64 = Buffer.from(jsonString, 'utf8').toString('base64');
    const form = new URLSearchParams();
    form.set('file', `data:application/json;base64,${base64}`);
    form.set('public_id', publicId);
    form.set('overwrite', String(overwrite));
    form.set('invalidate', String(invalidate));
    form.set('api_key', apiKey);
    form.set('timestamp', String(timestamp));
    form.set('signature', signature);

    const uploadResp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });
    const payload = await uploadResp.json().catch(() => ({}));
    if (!uploadResp.ok) {
      res.status(500).json({ error: 'Cloudinary raw upload failed', details: payload });
      return;
    }

    res.status(200).json({ ok: true, result: payload });
  } catch (e) {
    console.error('cloudinary-raw-put error', e);
    res.status(500).json({ error: 'Server error' });
  }
};

