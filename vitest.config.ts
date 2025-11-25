import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        env: {
            // Ignore getActivePinia() warning
            NODE_ENV: 'production'
        }
    }
})
