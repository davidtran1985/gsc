const { setSession } = require("./session");

function redirectUri(req) {
  return process.env.GOOGLE_REDIRECT_URI || `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/auth/google/callback`;
}

async function tokenRequest(params) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || "Google token request failed");
  return data;
}

async function refreshSession(res, session) {
  if (session.accessToken && session.accessTokenExpiresAt > Date.now() + 60_000) return session;
  if (!session.refreshToken) throw new Error("Google authorization expired. Please sign in again.");
  const token = await tokenRequest({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: session.refreshToken,
    grant_type: "refresh_token",
  });
  const updated = {
    ...session,
    accessToken: token.access_token,
    accessTokenExpiresAt: Date.now() + token.expires_in * 1000,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  setSession(res, updated);
  return updated;
}

module.exports = { redirectUri, refreshSession, tokenRequest };
