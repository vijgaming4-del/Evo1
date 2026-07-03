import {defineConfig} from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          apps: path.resolve(__dirname, 'apps.html'),
          games: path.resolve(__dirname, 'games.html'),
          search: path.resolve(__dirname, 'search.html'),
          about: path.resolve(__dirname, 'about.html'),
          privacy: path.resolve(__dirname, 'privacy-policy.html'),
          dmca: path.resolve(__dirname, 'dmca.html'),
          categories: path.resolve(__dirname, 'categories.html'),
          disclaimer: path.resolve(__dirname, 'disclaimer.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          terms: path.resolve(__dirname, 'terms.html'),
          error: path.resolve(__dirname, '404.html'),
          features: path.resolve(__dirname, 'features.html'),
          faq: path.resolve(__dirname, 'faq.html'),
          detail: path.resolve(__dirname, 'app-detail.html'),
          ...Object.fromEntries(
            fs.readdirSync(path.resolve(__dirname, 'apps'))
              .filter(file => file.endsWith('.html'))
              .map(file => [
                `apps/${file.replace('.html', '')}`,
                path.resolve(__dirname, 'apps', file)
              ])
          )
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
