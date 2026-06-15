const { clearSession } = require("../_lib/session");

module.exports = (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  clearSession(res);
  res.status(200).json({ ok: true });
};
