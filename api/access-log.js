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
      const { device, standalone, sessionStart } = req.body;
      if (!device) return res.status(400).json({ ok: false, error: "device required" });

      const now = new Date().toISOString();
      const today = now.slice(0, 10);

      // 기존 데이터 조회
      let prevData = null;
      try {
        const j = await fetch(`${url}/pipeline`, {
          method: "POST", headers,
          body: JSON.stringify([["GET", `access_${device}`], ["GET", `daily_${device}_${today}`]])
        }).then(r => r.json());
        if (Array.isArray(j) && j[0]?.result) prevData = JSON.parse(j[0].result);
        var prevDailyMin = Array.isArray(j) && j[1]?.result ? parseFloat(j[1].result) || 0 : 0;
      } catch { var prevDailyMin = 0; }

      const finalStandalone = (prevData?.standalone === true || standalone === true) ? true : (standalone ?? false);

      let finalSessionStart = sessionStart || now;
      if (prevData?.lastAccess) {
        const diffSec = (new Date(now) - new Date(prevData.lastAccess)) / 1000;
        if (diffSec < 120 && prevData.sessionStart) finalSessionStart = prevData.sessionStart;
      }

      const stayMinutes = Math.round((new Date(now) - new Date(finalSessionStart)) / 1000 / 60);
      const todayMinutes = Math.round((prevDailyMin + 0.5) * 10) / 10;

      const data = JSON.stringify({ lastAccess: now, standalone: finalStandalone, sessionStart: finalSessionStart, stayMinutes });

      await fetch(`${url}/pipeline`, {
        method: "POST", headers,
        body: JSON.stringify([
          ["SET", `access_${device}`, data],
          ["SET", `daily_${device}_${today}`, String(todayMinutes), "EX", 604800]
        ])
      });

      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === "GET") {
    try {
      const [accessKeysJ, dailyKeysJ] = await Promise.all([
        fetch(`${url}/keys/access_*`, { headers }).then(r => r.json()),
        fetch(`${url}/keys/daily_*`, { headers }).then(r => r.json()),
      ]);

      const accessKeys = Array.isArray(accessKeysJ.result) ? accessKeysJ.result : [];
      const dailyKeys = Array.isArray(dailyKeysJ.result) ? dailyKeysJ.result : [];

      if (accessKeys.length === 0) return res.status(200).json({ ok: true, logs: [], dailyStats: {} });

      const allKeys = [...accessKeys, ...dailyKeys];
      const valData = await fetch(`${url}/pipeline`, {
        method: "POST", headers,
        body: JSON.stringify(allKeys.map(k => ["GET", k]))
      }).then(r => r.json());

      const logs = accessKeys.map((k, i) => {
        try {
          const raw = Array.isArray(valData) ? valData[i]?.result : null;
          if (!raw) return { device: k.replace("access_", ""), lastAccess: null, standalone: null, stayMinutes: 0 };
          const p = JSON.parse(raw);
          return { device: k.replace("access_", ""), lastAccess: p.lastAccess || null, standalone: p.standalone ?? null, stayMinutes: p.stayMinutes || 0 };
        } catch {
          return { device: k.replace("access_", ""), lastAccess: null, standalone: null, stayMinutes: 0 };
        }
      });

      const dailyStats = {};
      dailyKeys.forEach((k, i) => {
        const val = Array.isArray(valData) ? valData[accessKeys.length + i]?.result : null;
        const minutes = parseFloat(val) || 0;
        const withoutPrefix = k.replace("daily_", "");
        const dateMatch = withoutPrefix.match(/(\d{4}-\d{2}-\d{2})$/);
        if (!dateMatch) return;
        const date = dateMatch[1];
        const device = withoutPrefix.slice(0, withoutPrefix.length - date.length - 1);
        if (!dailyStats[device]) dailyStats[device] = {};
        dailyStats[device][date] = minutes;
      });

      res.status(200).json({ ok: true, logs, dailyStats });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}
