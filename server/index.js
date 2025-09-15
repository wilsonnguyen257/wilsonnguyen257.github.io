const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function dataPath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Read site data
app.get('/api/site-data/:name', (req, res) => {
  const { name } = req.params;
  const file = dataPath(name);
  try {
    if (!fs.existsSync(file)) return res.json([]);
    const text = fs.readFileSync(file, 'utf8');
    try {
      const json = text ? JSON.parse(text) : [];
      return res.json(json);
    } catch {
      return res.json([]);
    }
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// Write site data
app.put('/api/site-data/:name', (req, res) => {
  const { name } = req.params;
  const file = dataPath(name);
  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? []);
    fs.writeFileSync(file, body, 'utf8');
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// Serve static production build if available
const DIST_DIR = path.join(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

