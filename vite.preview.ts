import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [react(), tsConfigPaths(), dts({ tsConfigFilePath: 'tsconfig.preview.json' })]
});
