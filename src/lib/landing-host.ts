/** Registration domains and the AWS test copy; all other hosts retain the regular app. */
export function usesEarlyAccessLanding(hostname: string) {
  return ["readines.com", "www.readines.com", "main.d21rr29vpd3rfl.amplifyapp.com"].includes(hostname.toLowerCase());
}
