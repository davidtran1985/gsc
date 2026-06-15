const crypto = require("crypto");

const SESSION_COOKIE = "searchpilot_session";
const STATE_COOKIE = "searchpilot_oauth_state";
const MAX_AGE = 60 * 60 * 24 * 7;

function secretKey() {
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  return crypto.createHash("sha256").update(process.env.SESSION_SECRET).digest();
}

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function decode(value) {
  return Buffer.from(value, "base64url");
}

function encrypt(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return [encode(iv), encode(cipher.getAuthTag()), encode(encrypted)].join(".");
}

function decrypt(value) {
  try {
    const [iv, tag, encrypted] = value.split(".").map(decode);
    const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8"));
  } catch {
    return null;
  }
}

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map(item => {
    const index = item.indexOf("=");
    return [item.slice(0, index).trim(), decodeURIComponent(item.slice(index + 1))];
  }));
}

function cookie(name, value, maxAge = MAX_AGE) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function getSession(req) {
  const session = decrypt(cookies(req)[SESSION_COOKIE] || "");
  return session && session.expiresAt > Date.now() ? session : null;
}

function setSession(res, session) {
  res.setHeader("Set-Cookie", cookie(SESSION_COOKIE, encrypt(session)));
}

function clearSession(res) {
  res.setHeader("Set-Cookie", cookie(SESSION_COOKIE, "", 0));
}

function setState(res, state) {
  res.setHeader("Set-Cookie", cookie(STATE_COOKIE, encrypt({ state, expiresAt: Date.now() + 10 * 60 * 1000 }), 600));
}

function consumeState(req) {
  const state = decrypt(cookies(req)[STATE_COOKIE] || "");
  return state && state.expiresAt > Date.now() ? state.state : null;
}

module.exports = { clearSession, consumeState, getSession, setSession, setState };
