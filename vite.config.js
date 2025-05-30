import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";
import { resolve } from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@components": resolve(__dirname, "src/components"),
      // eslint-disable-next-line no-undef
      "@common": resolve(__dirname, "src/common"),
      // eslint-disable-next-line no-undef
      "@constants": resolve(__dirname, "src/constants"),
      // eslint-disable-next-line no-undef
      "@assets": resolve(__dirname, "src/assets"),
      // eslint-disable-next-line no-undef
      "@pages": resolve(__dirname, "src/pages"),
      // eslint-disable-next-line no-undef
      "@routers": resolve(__dirname, "src/routers"),
      // eslint-disable-next-line no-undef
      "@helpers": resolve(__dirname, "src/helpers"),
      // eslint-disable-next-line no-undef
      "@store": resolve(__dirname, "src/store"),
      // eslint-disable-next-line no-undef
      "@locales": resolve(__dirname, "src/locales"),
    },
  },
});
