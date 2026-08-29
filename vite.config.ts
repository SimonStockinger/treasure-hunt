import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "./src/main.ts",
            name: "TreasureMap",
            fileName: (format) => `treasure-map.${format}.js`,
            formats: ["es", "umd"],
        },
        rollupOptions: {
            output: {
                assetFileNames: "treasure-map.[ext]",
            },
        },
    },
});
