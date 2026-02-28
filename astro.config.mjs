// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare'; // 1. Importa el adaptador

// https://astro.build/config
export default defineConfig({
    output: 'server', // 2. Activa el modo Servidor para consultas en tiempo real
    integrations: [tailwind(), react()],
    adapter: cloudflare({ // 3. Configura el adaptador de Cloudflare
        platformProxy: {
            enabled: true,
        },
    }),
});