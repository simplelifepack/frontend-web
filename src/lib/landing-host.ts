/** Custom registration domains; all other production hosts retain the regular app. */
export function usesEarlyAccessLanding(hostname: string) {
  return ["readines.com", "www.readines.com", "localhost", "127.0.0.1", "[::1]"].includes(hostname.toLowerCase());
}
