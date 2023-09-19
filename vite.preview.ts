import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [react(), dts({ tsConfigFilePath: 'tsconfig.preview.json' })]
});
