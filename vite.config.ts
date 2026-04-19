import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@escenas": resolve(__dirname, "src/escenas"),
      "@entidades": resolve(__dirname, "src/entidades"),
      "@sistemas": resolve(__dirname, "src/sistemas"),
      "@niveles": resolve(__dirname, "src/niveles"),
      "@ui": resolve(__dirname, "src/ui"),
      "@animaciones": resolve(__dirname, "src/animaciones"),
      "@constantes": resolve(__dirname, "src/constantes"),
      "@tipos": resolve(__dirname, "src/tipos"),
      "@utilidades": resolve(__dirname, "src/utilidades"),
      "@componentes": resolve(__dirname, "src/componentes"),
      "@cinematicas": resolve(__dirname, "src/cinematicas"),
      "@assets": resolve(__dirname, "public/assets"),
    },
  },

  server: {
    port: 3000,
    open: true,
    host: true,
  },

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },

  assetsInclude: [
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.svg",
    "**/*.webp",
    "**/*.ogg",
    "**/*.mp3",
    "**/*.wav",
    "**/*.json",
    "**/*.atlas",
  ],
});
