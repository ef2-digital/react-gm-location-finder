import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsConfigPaths from 'vite-tsconfig-paths';
import * as packageJson from './package.json';
import { PluginPure } from 'rollup-plugin-pure';

// https://vitejs.dev/config/
export default defineConfig((configEnv) => ({
    plugins: [
        react(),
        tsConfigPaths(),
        dts({
            rollupTypes: true
        }),
        PluginPure({
            functions: ['defineComponent'],
            include: [/(?<!im)pure\.js$/]
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
