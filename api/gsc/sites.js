const { refreshSession } = require("../_lib/google");
const { getSession } = require("../_lib/session");

module.exports = async (req, res) => {
  try {
    const current = getSession(req);
    if (!current) return res.status(401).json({ error: "Sign in required" });
    const session = await refreshSession(res, current);
    const response = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
      headers: { authorization: `Bearer ${session.accessToken}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Unable to load Search Console properties");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ sites: data.siteEntry || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
