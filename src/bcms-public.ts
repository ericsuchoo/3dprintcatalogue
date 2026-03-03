import { Client } from "@thebcms/client";

type RuntimeEnv = Record<string, string | undefined>;

function assert(v: string | undefined, name: string) {
  if (!v) throw new Error(`BCMS env faltante: ${name}`);
  return v;
}

// ✅ Runtime (Cloudflare Pages SSR)
export function getBcmsPublic(env: RuntimeEnv) {
  return new Client(
    assert(env.PUBLIC_BCMS_ORG_ID, "PUBLIC_BCMS_ORG_ID"),
    assert(env.PUBLIC_BCMS_INSTANCE_ID, "PUBLIC_BCMS_INSTANCE_ID"),
    {
      id: assert(env.PUBLIC_BCMS_API_KEY_ID, "PUBLIC_BCMS_API_KEY_ID"),
      secret: assert(env.PUBLIC_BCMS_API_KEY_SECRET, "PUBLIC_BCMS_API_KEY_SECRET"),
    },
    { injectSvg: true },
  );
}

// ✅ Build-time (Astro build / getStaticPaths)
export function getBcmsPublicBuild() {
  return new Client(
    assert(import.meta.env.PUBLIC_BCMS_ORG_ID, "PUBLIC_BCMS_ORG_ID"),
    assert(import.meta.env.PUBLIC_BCMS_INSTANCE_ID, "PUBLIC_BCMS_INSTANCE_ID"),
    {
      id: assert(import.meta.env.PUBLIC_BCMS_API_KEY_ID, "PUBLIC_BCMS_API_KEY_ID"),
      secret: assert(import.meta.env.PUBLIC_BCMS_API_KEY_SECRET, "PUBLIC_BCMS_API_KEY_SECRET"),
    },
    { injectSvg: true },
  );
}