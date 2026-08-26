export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    const keysRes = await fetch(`${url}/keys/location_*`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const keysData = await keysRes.json();
    const keys = keysData.result || [];
    if (keys.length === 0) return res.status(200).json({ ok: true, locations: [] });
    const pipeline = keys.map(k => ["GET", k]);
    const valRes = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(pipeline)
    });
    const valData = await valRes.json();
    const locations = keys.map((k, i) => ({
      device: k.replace("location_", ""),
      ...(valData[i]?.result ? JSON.parse(valData[i].result) : {})
    }));
    res.status(200).json({ ok: true, locations });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
