const crypto = require("crypto");
const { redirectUri } = require("../_lib/google");
const { setState } = require("../_lib/session");

module.exports = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Google OAuth environment variables are not configured" });
  }
  const state = crypto.randomBytes(24).toString("hex");
  setState(res, state);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(req),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    state,
    scope: "openid email profile https://www.googleapis.com/auth/webmasters.readonly",
  });
  res.redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};
