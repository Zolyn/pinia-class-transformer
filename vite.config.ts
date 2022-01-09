import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PiniaStoreDecorators',
            formats: ['es', 'umd'],
            fileName: (format) => `pinia-store-decorators.${format}.js`,
        },
        rollupOptions: {
            external: ['reflect-metadata', 'pinia'],
        },
    },
});
