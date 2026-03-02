
// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare'; // 1. Importamos el adaptador

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), react()],
    output: 'server', // 2. Cambiamos a modo servidor para usar D1
    adapter: cloudflare({
        platformProxy: {
            enabled: true, // Esto ayuda a que el entorno local reconozca D1
        },
    }),
});