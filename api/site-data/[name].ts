import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list, put } from '@vercel/blob';

function ok<T>(res: VercelResponse, data: T) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(data as any);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const nameParam = req.query.name;
  const name = Array.isArray(nameParam) ? nameParam[0] : nameParam;
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  // CORS preflight
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const key = `site-data/${name}.json`;

  if (method === 'GET') {
    try {
      const blobs = await list({ prefix: key, limit: 1 });
      const found = blobs.blobs.find((b) => b.pathname === key);
      if (!found) return ok(res, []);
      const resp = await fetch(found.url, { cache: 'no-store' });
      if (!resp.ok) return res.status(resp.status).send(await resp.text());
      const text = await resp.text();
      // If empty or invalid, return empty array
      try {
        const json = text ? JSON.parse(text) : [];
        return ok(res, json);
      } catch {
        return ok(res, []);
      }
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to read data' });
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
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Failed to write data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
