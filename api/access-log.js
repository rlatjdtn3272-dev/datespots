export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (req.method === "POST") {
    try {
      const { device } = req.body;
      const now = new Date().toISOString();
      await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["SET", `access_${device}`, now]])
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === "GET") {
    try {
      const keysRes = await fetch(`${url}/keys/access_*`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const keysData = await keysRes.json();
      const keys = keysData.result || [];
      if (keys.length === 0) return res.status(200).json({ ok: true, logs: [] });
      const pipeline = keys.map(k => ["GET", k]);
      const valRes = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(pipeline)
      });
      const valData = await valRes.json();
      const logs = keys.map((k, i) => ({
        device: k.replace("access_", ""),
        lastAccess: valData[i]?.result || null
      }));
      res.status(200).json({ ok: true, logs });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}
