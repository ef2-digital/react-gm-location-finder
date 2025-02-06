import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsConfigPaths from 'vite-tsconfig-paths';
import { peerDependencies } from './package.json';
import { PluginPure } from 'rollup-plugin-pure';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
    css: {
        postcss: {
            plugins: [tailwind, autoprefixer]
        }
    },
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
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ReactGMLocationFinder',
            formats: ['es', 'umd'],
            fileName: (format) => `react-gm-location-finder.${format}.js`
        },
        rollupOptions: {
            external: [...Object.keys(peerDependencies)]
        }
    }
});
