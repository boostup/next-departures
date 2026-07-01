import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [],
    root: '.',
    base: '/next-departures/',
    server: {
        port: 5173,
        open: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
    test: {
        environment: 'happy-dom',
        globals: true
    }
});