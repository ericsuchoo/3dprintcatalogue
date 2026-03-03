/// <reference types="astro/client" />

interface CloudflareRuntimeEnv {
  DB?: D1Database;
  [key: string]: any;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: CloudflareRuntimeEnv;
    };
  }
}