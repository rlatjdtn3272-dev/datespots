export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (req.method === "POST") {
    try {
      const { device, standalone, sessionStart } = req.body;
      const now = new Date().toISOString();
      const today = now.slice(0, 10); // YYYY-MM-DD

      // 기존 데이터 + 오늘 체류시간 가져오기
      const [prevRes, todayRes] = await Promise.all([
        fetch(`${url}/get/access_${device}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${url}/get/daily_${device}_${today}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);

      let prevData = null;
      try { if (prevRes.result) prevData = JSON.parse(prevRes.result); } catch {}

      // standalone: 한 번이라도 true면 유지
      const finalStandalone = (prevData?.standalone === true || standalone === true) ? true : standalone;

      // 세션 시작 시간
      let finalSessionStart = sessionStart;
      if (prevData?.lastAccess) {
        const diffMin = (new Date() - new Date(prevData.lastAccess)) / 1000 / 60;
        if (diffMin < 2 && prevData.sessionStart) finalSessionStart = prevData.sessionStart;
      }

      // 현재 세션 체류시간
      const stayMinutes = finalSessionStart
        ? Math.round((new Date() - new Date(finalSessionStart)) / 1000 / 60)
        : 0;

      // 오늘 누적 체류시간 (30초 = 0.5분 추가)
      let todayMinutes = 0;
      try { if (todayRes.result) todayMinutes = parseFloat(todayRes.result) || 0; } catch {}
      todayMinutes = Math.round((todayMinutes + 0.5) * 10) / 10;

      const data = JSON.stringify({ lastAccess: now, standalone: finalStandalone, sessionStart: finalSessionStart, stayMinutes });

      await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["SET", `access_${device}`, data],
          ["SET", `daily_${device}_${today}`, String(todayMinutes), "EX", "604800"] // 7일 후 만료
        ])
      });
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === "GET") {
    try {
      const keysRes = await fetch(`${url}/keys/access_*`, { headers: { Authorization: `Bearer ${token}` } });
      const keysData = await keysRes.json();
      const keys = Array.isArray(keysData.result) ? keysData.result : [];
      if (keys.length === 0) return res.status(200).json({ ok: true, logs: [] });

      // 접속 데이터 + 해당 기기들의 daily 데이터 가져오기
      const devices = keys.map(k => k.replace("access_", ""));
      const dailyKeysRes = await fetch(`${url}/keys/daily_*`, { headers: { Authorization: `Bearer ${token}` } });
      const dailyKeysData = await dailyKeysRes.json();
      const dailyKeys = Array.isArray(dailyKeysData.result) ? dailyKeysData.result : [];

      const allKeys = [...keys, ...dailyKeys];
      const pipeline = allKeys.map(k => ["GET", k]);
      const valRes = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(pipeline)
      });
      const valData = await valRes.json();

      const logs = keys.map((k, i) => {
        const raw = Array.isArray(valData) ? valData[i]?.result : null;
        try {
          const parsed = JSON.parse(raw);
          return { device: k.replace("access_", ""), lastAccess: parsed.lastAccess, standalone: parsed.standalone, stayMinutes: parsed.stayMinutes || 0 };
        } catch {
          return { device: k.replace("access_", ""), lastAccess: raw, standalone: null, stayMinutes: 0 };
        }
      });

      // daily 데이터 정리 - {device: {YYYY-MM-DD: minutes}}
      const dailyStats = {};
      dailyKeys.forEach((k, i) => {
        const valIdx = keys.length + i;
        const parts = k.replace("daily_", "").split("_");
        const date = parts[parts.length - 1]; // YYYY-MM-DD
        const device = parts.slice(0, parts.length - 1).join("_");
        if (!dailyStats[device]) dailyStats[device] = {};
        const minutes = parseFloat(Array.isArray(valData) ? valData[valIdx]?.result : 0) || 0;
        dailyStats[device][date] = minutes;
      });

      res.status(200).json({ ok: true, logs, dailyStats });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}
