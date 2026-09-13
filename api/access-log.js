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
      const today = now.slice(0, 10);

      // 기존 데이터 조회
      let prevData = null;
      try {
        const r = await fetch(`${url}/get/access_${device}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const j = await r.json();
        if (j.result) prevData = JSON.parse(j.result);
      } catch {}

      // standalone: 한 번이라도 true면 유지
      const finalStandalone = (prevData?.standalone === true || standalone === true) ? true : (standalone ?? false);

      // 세션 시작 시간
      let finalSessionStart = sessionStart;
      if (prevData?.lastAccess) {
        const diffSec = (new Date() - new Date(prevData.lastAccess)) / 1000;
        if (diffSec < 120 && prevData.sessionStart) finalSessionStart = prevData.sessionStart;
      }

      // 세션 체류시간
      const stayMinutes = finalSessionStart
        ? Math.round((new Date() - new Date(finalSessionStart)) / 1000 / 60)
        : 0;

      // 오늘 누적 체류시간
      let todayMinutes = 0;
      try {
        const r = await fetch(`${url}/get/daily_${device}_${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const j = await r.json();
        if (j.result) todayMinutes = parseFloat(j.result) || 0;
      } catch {}
      todayMinutes = Math.round((todayMinutes + 0.5) * 10) / 10;

      // 저장 (별도 요청으로 분리해서 안정성 확보)
      const data = JSON.stringify({ lastAccess: now, standalone: finalStandalone, sessionStart: finalSessionStart, stayMinutes });
      await fetch(`${url}/set/access_${device}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value: data })
      });
      await fetch(`${url}/set/daily_${device}_${today}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value: String(todayMinutes), ex: 604800 })
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
      if (keys.length === 0) return res.status(200).json({ ok: true, logs: [], dailyStats: {} });

      const devices = keys.map(k => k.replace("access_", ""));

      // 접속 데이터 가져오기
      const accessPipeline = keys.map(k => ["GET", k]);
      const accessRes = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(accessPipeline)
      });
      const accessData = await accessRes.json();

      const logs = keys.map((k, i) => {
        try {
          const raw = Array.isArray(accessData) ? accessData[i]?.result : null;
          if (!raw) return { device: k.replace("access_", ""), lastAccess: null, standalone: null, stayMinutes: 0 };
          const parsed = JSON.parse(raw);
          return { device: k.replace("access_", ""), lastAccess: parsed.lastAccess, standalone: parsed.standalone, stayMinutes: parsed.stayMinutes || 0 };
        } catch {
          return { device: k.replace("access_", ""), lastAccess: null, standalone: null, stayMinutes: 0 };
        }
      });

      // daily 데이터 가져오기
      const dailyKeysRes = await fetch(`${url}/keys/daily_*`, { headers: { Authorization: `Bearer ${token}` } });
      const dailyKeysData = await dailyKeysRes.json();
      const dailyKeys = Array.isArray(dailyKeysData.result) ? dailyKeysData.result : [];

      let dailyStats = {};
      if (dailyKeys.length > 0) {
        const dailyPipeline = dailyKeys.map(k => ["GET", k]);
        const dailyRes = await fetch(`${url}/pipeline`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(dailyPipeline)
        });
        const dailyData = await dailyRes.json();

        dailyKeys.forEach((k, i) => {
          const val = Array.isArray(dailyData) ? dailyData[i]?.result : null;
          const minutes = parseFloat(val) || 0;
          // key 형식: daily_{device}_{YYYY-MM-DD}
          const withoutPrefix = k.replace("daily_", "");
          const dateMatch = withoutPrefix.match(/(\d{4}-\d{2}-\d{2})$/);
          if (!dateMatch) return;
          const date = dateMatch[1];
          const device = withoutPrefix.replace("_" + date, "");
          if (!dailyStats[device]) dailyStats[device] = {};
          dailyStats[device][date] = minutes;
        });
      }

      res.status(200).json({ ok: true, logs, dailyStats });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}
