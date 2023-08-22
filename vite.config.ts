import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsConfigPaths from 'vite-tsconfig-paths';
import * as packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig((configEnv) => ({
    plugins: [
        react(),
        tsConfigPaths(),
        dts({
            rollupTypes: true
        })
    ],
    build: {
        lib: {
            entry: resolve('src', 'index.ts'),
            name: 'ReactGMLocationFinder',
            formats: ['es', 'umd'],
            fileName: (format) => `react-gm-location-finder.${format}.js`
        },
        rollupOptions: {
            external: [...Object.keys(packageJson.peerDependencies)]
        }
    }
}));
