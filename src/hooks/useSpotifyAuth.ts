import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-shell";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import {
  authorizePKCE,
  buildAuthUrl,
  getTokens,
  refreshToken,
  saveTokens,
  getStoredTokens,
  clearTokens,
} from "../lib/spotify";

export function useSpotifyAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { accessToken, refreshToken, expiry } = getStoredTokens();

      if (accessToken && Date.now() < expiry) {
        setAccessToken(accessToken);
        scheduleRefresh(expiry);
        setLoading(false);
      } else if (refreshToken) {
        try {
          await refresh(refreshToken);
        } catch {
          clearTokens();
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    }

    const promise = onOpenUrl(async (urls) => {
      const url = urls[0];
      if (!url.startsWith("aria://callback")) return;

      const code = new URL(url).searchParams.get("code");
      const verifier = sessionStorage.getItem("spotify_verifier");

      if (!code || !verifier) return;

      try {
        const tokens = await getTokens(code, verifier);

        saveTokens(
          tokens.access_token,
          tokens.refresh_token,
          tokens.expires_in,
        );
        setAccessToken(tokens.access_token);
        scheduleRefresh(Date.now() + tokens.expires_in * 1000);

        sessionStorage.removeItem("spotify_verifier");
      } catch (e) {
        console.error("Failed to get tokens", e);
      }
    });

    init();

    return () => {
      promise.then((unlisten) => unlisten());
    };
  }, []);

  async function login() {
    const { verifier, challenge } = await authorizePKCE();

    sessionStorage.setItem("spotify_verifier", verifier);

    const url = buildAuthUrl(challenge);
    await open(url);
  }

  async function refresh(rt: string) {
    const tokens = await refreshToken(rt);
    const newExpiry = Date.now() + tokens.expires_in * 1000;

    saveTokens(tokens.access_token, rt, tokens.expires_in);
    setAccessToken(tokens.access_token);
    scheduleRefresh(newExpiry);
  }

  function scheduleRefresh(expiry: number) {
    const delay = expiry - Date.now() - 5 * 60 * 1000;

    if (delay <= 0) return;

    setTimeout(async () => {
      const { refreshToken } = getStoredTokens();
      if (refreshToken) await refresh(refreshToken);
    }, delay);
  }

  return { accessToken, loading, login };
}
