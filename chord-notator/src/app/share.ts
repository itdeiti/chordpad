import type { Song } from "app/types";

const HASH_PREFIX = "#s=";

function b64UrlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeSongToUrl(song: Song): string {
  const slim: Song = { ...song, staging: null };
  const payload = b64UrlEncode(JSON.stringify(slim));
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${HASH_PREFIX}${payload}`;
}

export function decodeSongFromHash(hash: string): Song | null {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    const json = b64UrlDecode(hash.slice(HASH_PREFIX.length));
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.sections)
    ) {
      return null;
    }
    return parsed as Song;
  } catch {
    return null;
  }
}

export function clearHash(): void {
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }
}
