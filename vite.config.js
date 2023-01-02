import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
    root: resolve("sources"),
    server: {
        port: 8000,
        host: "0.0.0.0"
    },
    build: {
        outDir: '../public', // this line place index.html in the public folder
        assetsDir: './', // this line place your assets in the public folder
        emptyOutDir: true,
    },
})