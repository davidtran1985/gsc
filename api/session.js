const { getSession } = require("./_lib/session");

module.exports = (req, res) => {
  const session = getSession(req);
  res.setHeader("Cache-Control", "no-store");
  if (!session) return res.status(200).json({ authenticated: false });
  res.status(200).json({ authenticated: true, user: session.user });
};
