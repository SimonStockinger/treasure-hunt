import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
    const isDemo = mode === "demo";

    return {
        base: isDemo ? "/treasure-hunt/" : "./",
        build: isDemo
            ? {
                  outDir: "dist-demo", // Builds index.html fot gh-pages
              }
            : {
                  outDir: "dist",
                  lib: {
                      entry: "./src/main.ts",
                      name: "TreasureHunt",
                      fileName: (format) => `treasure-hunt.${format}.js`,
                      formats: ["es", "umd"],
                  },
              },
    };
});
