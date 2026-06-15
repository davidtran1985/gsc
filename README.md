# SearchPilot

Static frontend with Google OAuth and Google Search Console property discovery, deployed with Vercel Functions.

## Required Vercel environment variables

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `SESSION_SECRET`

Use this exact production redirect URI in both Google Cloud and Vercel:

```text
https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/google/callback
```

After adding or changing environment variables, redeploy the Vercel project.

## Authentication flow

- `/api/auth/google` starts Google OAuth.
- `/api/auth/google/callback` creates an encrypted session cookie.
- `/api/session` returns the signed-in Google user.
- `/api/gsc/sites` lists accessible Search Console properties.
- `/api/auth/logout` clears the local application session.
