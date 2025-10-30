import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list, put } from '@vercel/blob';

function ok<T>(res: VercelResponse, data: T) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(data);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const nameParam = req.query.name;
  const name = Array.isArray(nameParam) ? nameParam[0] : nameParam;
  if (!name) return res.status(400).json({ error: 'Missing name' });

  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const key = `site-data/${name}.json`;

  if (method === 'GET') {
    try {
      const blobs = await list({ prefix: key, limit: 1 });
      const found = blobs.blobs.find((b) => b.pathname === key);
      if (!found) return ok(res, []);
      const r = await fetch(found.url, { cache: 'no-store' });
      if (!r.ok) return res.status(r.status).send(await r.text());
      const text = await r.text();
      try { return ok(res, text ? JSON.parse(text) : []); } catch { return ok(res, []); }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read';
      return res.status(500).json({ error: errorMessage });
    }
  }

  if (method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? []);
      await put(key, body, {
        access: 'public',
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return ok(res, { success: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to write';
      return res.status(500).json({ error: errorMessage });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

