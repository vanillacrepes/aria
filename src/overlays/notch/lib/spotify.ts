const clientId = "db0a3e81ad0c4da08ef0edeccb8c8faf";
const redirectUri = "aria://callback";

const scope =
  "user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing";
const authUrl = new URL("https://accounts.spotify.com/authorize?");

// PKCE Functions

const generateRandomString = (length: number): string => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export async function authorizePKCE(): Promise<{
  verifier: string;
  challenge: string;
}> {
  const verifier = generateRandomString(64);
  const hashed = await sha256(verifier);
  const challenge = base64encode(hashed);
  return { verifier, challenge };
}

export function buildAuthUrl(challenge: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  return authUrl + params.toString();
}

export async function getTokens(code: string, verifier: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!response.ok)
    throw new Error(`Failed to get token: ${response.statusText}`);
  return response.json();
}

export async function refreshToken(refreshToken: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok)
    throw new Error(`Failed to get token: ${response.statusText}`);
  return response.json();
}

export function saveTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
) {
  localStorage.setItem("spotify_access_token", accessToken);
  localStorage.setItem("spotify_refresh_token", refreshToken);
  localStorage.setItem(
    "spotify_token_expiry",
    String(Date.now() + expiresIn * 1000),
  );
}

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem("spotify_access_token"),
    refreshToken: localStorage.getItem("spotify_refresh_token"),
    expiry: Number(localStorage.getItem("spotify_token_expiry")),
  };
}

export function clearTokens() {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_token_expiry");
}

export async function spotifyFetch(endpoint: string, accessToken: string) {
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

export async function getCurrentlyPlaying(accessToken: string) {
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

export async function pausePlayback(accessToken: string) {
  await fetch("https://api.spotify.com/v1/me/player/pause", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function resumePlayback(accessToken: string) {
  await fetch("https://api.spotify.com/v1/me/player/play", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function skipNext(accessToken: string) {
  await fetch("https://api.spotify.com/v1/me/player/next", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function skipBack(accessToken: string) {
  await fetch("https://api.spotify.com/v1/me/player/previous", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function seekToPosition(accessToken: string, positionMs: number) {
  await fetch(
    `https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
}
