import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: '/spotifyQueue/',  // required for GitHub Pages (repo name)
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                queue: resolve(__dirname, 'queue.html')
            }
        }
    },
    server: {
        open: true,
        port: 5173,
    }
});
