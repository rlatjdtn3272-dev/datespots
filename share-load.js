export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { code } = req.query;
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    const r = await fetch(`${url}/get/share_${code}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await r.json();
    res.status(200).json({ ok: true, data: result.result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
