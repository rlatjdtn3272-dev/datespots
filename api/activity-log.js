export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (req.method === "POST") {
    try {
      const { device, placeName, region } = req.body;
      const now = new Date().toISOString();
      // 최근 50개 활동 로그 유지
      const key = `activity_${device}`;
      const existing = await fetch(`${url}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());

      const logs = existing.result ? JSON.parse(existing.result) : [];
      logs.unshift({ placeName, region, viewedAt: now });
      if (logs.length > 50) logs.splice(50);

      await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([["SET", key, JSON.stringify(logs)]])
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === "GET") {
    try {
      const keysRes = await fetch(`${url}/keys/activity_*`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const keysData = await keysRes.json();
      const keys = keysData.result || [];
      if (keys.length === 0) return res.status(200).json({ ok: true, activities: [] });

      const pipeline = keys.map(k => ["GET", k]);
      const valRes = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(pipeline)
      });
      const valData = await valRes.json();
      const activities = keys.map((k, i) => ({
        device: k.replace("activity_", ""),
        logs: valData[i]?.result ? JSON.parse(valData[i].result) : []
      }));
      res.status(200).json({ ok: true, activities });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}
