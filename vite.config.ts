import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
    const isDemo = mode === "demo";

    return {
        base: "./",
        build: isDemo
            ? {
                  outDir: "dist-demo",
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
