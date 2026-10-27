import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
export function mobileAssociations(env) {
  const appIds = (env.IOS_APP_LINK_APPLICATION_IDS ?? '').split(',').map(value => value.trim()).filter(Boolean);
  if (appIds.some(value => !/^[A-Z0-9]{10}\.[A-Za-z0-9.-]+$/.test(value))) throw new Error('IOS_APP_LINK_APPLICATION_IDS must contain TeamID.BundleID identifiers.');
  const fingerprints = (env.ANDROID_APP_LINK_SHA256 ?? '').split(',').map(value => value.trim().toUpperCase()).filter(Boolean);
  if (fingerprints.some(value => !/^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value))) throw new Error('ANDROID_APP_LINK_SHA256 must contain SHA-256 signing-certificate fingerprints.');
  const packageName = env.ANDROID_APP_LINK_PACKAGE ?? 'com.readinessmobile';
  if (!/^[A-Za-z][\w]*(?:\.[A-Za-z][\w]*)+$/.test(packageName)) throw new Error('Invalid Android application ID.');
  const paths = ['/invite/*', '/reset-password', '/documents', '/documents/*', '/packages', '/packages/*', '/health', '/wealth', '/family', '/trust', '/legacy', '/settings', '/home'];
  return {
    apple: { applinks: { apps: [], details: appIds.map(appID => ({ appID, paths })) } },
    android: fingerprints.length ? [{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: packageName, sha256_cert_fingerprints: fingerprints } }] : [],
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = mobileAssociations(process.env);
  const output = resolve(root, 'public/.well-known');
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'apple-app-site-association'), JSON.stringify(files.apple));
  await writeFile(resolve(output, 'assetlinks.json'), JSON.stringify(files.android));
  console.log(`Mobile associations: ${files.apple.applinks.details.length} iOS identities, ${files.android.length} Android statements. Unconfigured platforms remain unassociated.`);
}
