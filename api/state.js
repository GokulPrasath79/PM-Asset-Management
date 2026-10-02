// Vercel serverless function: shared storage on Upstash Redis (REST API, no dependencies)
const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const cmd = async (c) => {
  const r = await fetch(U, { method: "POST", headers: { Authorization: "Bearer " + T }, body: JSON.stringify(c) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
};
const obj = (a) => { const o = {}; for (let i = 0; i < (a || []).length; i += 2) o[a[i]] = JSON.parse(a[i + 1]); return o; };

module.exports = async (req, res) => {
  const pw = process.env.APP_PASSWORD;
  if (pw && req.headers["x-app-password"] !== pw) return res.status(401).json({ error: "Wrong or missing password" });
  if (!U || !T) return res.status(500).json({ error: "Database not configured (add Upstash Redis to the project)" });
  try {
    if (req.method === "GET") {
      const [a, l] = await Promise.all([cmd(["HGETALL", "pm:assets"]), cmd(["HGETALL", "pm:logs"])]);
      return res.status(200).json({ assets: Object.values(obj(a)), logs: obj(l) });
    }
    const b = req.body || {};
    if (b.action === "addAsset") {
      const ok = await cmd(["HSETNX", "pm:assets", b.asset.code, JSON.stringify(b.asset)]);
      if (!ok) return res.status(409).json({ error: "Asset code already exists" });
    } else if (b.action === "delAsset") {
      await cmd(["HDEL", "pm:assets", b.code]);
      const keys = Object.keys(obj(await cmd(["HGETALL", "pm:logs"]))).filter((k) => k.startsWith(b.code + "|"));
      if (keys.length) await cmd(["HDEL", "pm:logs", ...keys]);
    } else if (b.action === "saveLog") {
      const old = await cmd(["HGET", "pm:logs", b.key]);
      await cmd(["HSET", "pm:logs", b.key, JSON.stringify({ ...(old ? JSON.parse(old) : {}), ...b.data })]);
    } else return res.status(400).json({ error: "Bad action" });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
