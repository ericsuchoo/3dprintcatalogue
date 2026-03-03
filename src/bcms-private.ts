import { Client } from "@thebcms/client";

type RuntimeEnv = Record<string, string | undefined>;

function assert(v: string | undefined, name: string) {
  if (!v) throw new Error(`BCMS env faltante: ${name}`);
  return v;
}

// ✅ Runtime (Cloudflare Pages SSR)
export function getBcmsPrivate(env: RuntimeEnv) {
  const orgId = assert(env.BCMS_ORG_ID, "BCMS_ORG_ID");
  const instanceId = assert(env.BCMS_INSTANCE_ID, "BCMS_INSTANCE_ID");
  const keyId = assert(env.BCMS_API_KEY_ID, "BCMS_API_KEY_ID");
  const keySecret = assert(env.BCMS_API_KEY_SECRET, "BCMS_API_KEY_SECRET");

  return new Client(
    orgId,
    instanceId,
    { id: keyId, secret: keySecret },
    { injectSvg: true },
  );
}

// ✅ Build-time (Astro build / getStaticPaths)
export function getBcmsPrivateBuild() {
  const orgId = assert(import.meta.env.BCMS_ORG_ID, "BCMS_ORG_ID");
  const instanceId = assert(import.meta.env.BCMS_INSTANCE_ID, "BCMS_INSTANCE_ID");
  const keyId = assert(import.meta.env.BCMS_API_KEY_ID, "BCMS_API_KEY_ID");
  const keySecret = assert(import.meta.env.BCMS_API_KEY_SECRET, "BCMS_API_KEY_SECRET");

  return new Client(
    orgId,
    instanceId,
    { id: keyId, secret: keySecret },
    { injectSvg: true },
  );
}