import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PiniaClassTransformer',
            formats: ['es', 'umd'],
            fileName: (format) => `pinia-class-transformer.${format}.js`,
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },
});
