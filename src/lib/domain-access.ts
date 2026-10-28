// Exact hostnames only. Unknown hosts receive the public experience.
export function hasFullApplicationAccess(hostname: string, configured: string = import.meta.env.VITE_FULL_ACCESS_HOSTNAMES ?? "") {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  return ["readines.com", "www.readines.com", "localhost", "127.0.0.1", "[::1]", "frontend-web-nine-amber.vercel.app", ...configured.split(",").map(value => value.trim().toLowerCase()).filter(Boolean)].includes(host);
}
