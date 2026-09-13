export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  if (req.method === "POST") {
    try {
      const { device, placeName, region, type = "click" } = req.body;
      const now = new Date().toISOString();
      const key = `activity_${device}`;

      let logs = [];
      try {
        const j = await fetch(`${url}/get/${key}`, { headers }).then(r => r.json());
        if (j.result) { logs = JSON.parse(j.result); if (!Array.isArray(logs)) logs = []; }
      } catch { logs = []; }

      logs.unshift({ placeName, region, viewedAt: now, type });
      if (logs.length > 100) logs.splice(100);

      await fetch(`${url}/pipeline`, {
        method: "POST", headers,
        body: JSON.stringify([["SET", key, JSON.stringify(logs)]])
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === "GET") {
    try {
      const keysJ = await fetch(`${url}/keys/activity_*`, { headers }).then(r => r.json());
      const keys = Array.isArray(keysJ.result) ? keysJ.result : [];
      if (keys.length === 0) return res.status(200).json({ ok: true, activities: [] });

      const valData = await fetch(`${url}/pipeline`, {
        method: "POST", headers,
        body: JSON.stringify(keys.map(k => ["GET", k]))
      }).then(r => r.json());

      const activities = keys.map((k, i) => {
        let logs = [];
        try {
          const raw = Array.isArray(valData) ? valData[i]?.result : null;
          if (raw) { logs = JSON.parse(raw); if (!Array.isArray(logs)) logs = []; }
        } catch { logs = []; }
        return { device: k.replace("activity_", ""), logs };
      });

      res.status(200).json({ ok: true, activities });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}
