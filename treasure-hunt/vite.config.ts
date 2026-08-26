import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/main.ts"),
            name: "PirateMap",
            fileName: (format) => `pirate-map.${format}.js`,
            formats: ["es", "umd"],
        },
        rollupOptions: {
            output: {
                assetFileNames: "pirate-map.[ext]",
            },
        },
    },
});
