import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsConfigPaths from 'vite-tsconfig-paths';
import { peerDependencies } from './package.json';
import { PluginPure } from 'rollup-plugin-pure';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
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
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ReactGMLocationFinder',
            formats: ['es', 'umd'],
            fileName: (format) => `react-gm-location-finder.${format}.js`
        },
        rollupOptions: {
            // Peer dependencies and their subpaths (react/jsx-runtime) stay with the consumer.
            external: (id) => Object.keys(peerDependencies).some((name) => id === name || id.startsWith(`${name}/`))
        }
    }
});
