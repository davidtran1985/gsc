const { redirectUri, tokenRequest } = require("../../_lib/google");
const { consumeState, setSession } = require("../../_lib/session");

module.exports = async (req, res) => {
  try {
    if (req.query.error) throw new Error(req.query.error_description || req.query.error);
    if (!req.query.code || req.query.state !== consumeState(req)) throw new Error("Invalid or expired OAuth state");

    const token = await tokenRequest({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: req.query.code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(req),
    });
    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${token.access_token}` },
    });
    const user = await userResponse.json();
    if (!userResponse.ok) throw new Error("Unable to load Google profile");

    setSession(res, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      accessTokenExpiresAt: Date.now() + token.expires_in * 1000,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      user: { email: user.email, name: user.name, picture: user.picture },
    });
    res.redirect(302, "/");
  } catch (error) {
    res.redirect(302, `/?auth_error=${encodeURIComponent(error.message)}`);
  }
};
