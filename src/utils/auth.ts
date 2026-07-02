import fs from "fs/promises";
import path from "path";
import os from "os";

type Profile = { projectId: string; webApiKey: string; refreshToken: string };
type AuthConfig = { profiles: Record<string, Profile>; current: string };

let cachedToken: { idToken: string; exp: number } | null = null;

async function loadAuthConfig(): Promise<Profile> {
  const p = path.join(os.homedir(), ".dead", "auth.json");
  const raw = await fs.readFile(p, "utf8");
  const cfg: AuthConfig = JSON.parse(raw);
  const prof = cfg.profiles?.[cfg.current];
  if (!prof?.webApiKey || !prof?.refreshToken) {
    throw new Error("Missing webApiKey or refreshToken in ~/.dead/auth.json");
  }
  return prof;
}

async function exchangeRefreshForIdToken(webApiKey: string, refreshToken: string) {
  const url = `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(webApiKey)}`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await resp.json();

    if (resp.status !== 200) {
      throw new Error(`SecureToken ${resp.status}: ${JSON.stringify(data)}`);
    }

    const idToken: string = data.id_token;
    const expiresInSec: number = parseInt(data.expires_in, 10) || 3600;
    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    return { idToken, exp };
  } catch (e: any) {
    const msg = e?.message || e?.toString?.() || 'secure token exchange failed';
    throw new Error(`[auth] refresh idToken failed: ${msg}`);
  }
}

export async function getIdToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedToken && cachedToken.exp - 60 > Math.floor(Date.now() / 1000)) {
    return cachedToken.idToken;
  }
  const { webApiKey, refreshToken } = await loadAuthConfig();
  const { idToken, exp } = await exchangeRefreshForIdToken(webApiKey, refreshToken);
  cachedToken = { idToken, exp };
  return idToken;
}
