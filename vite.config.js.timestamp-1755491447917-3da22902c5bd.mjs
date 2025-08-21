// vite.config.js
import { defineConfig } from "file:///C:/laragon/www/qnhg-app/Frontend-QNHG/node_modules/vite/dist/node/index.js";
import tailwindcss from "file:///C:/laragon/www/qnhg-app/Frontend-QNHG/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///C:/laragon/www/qnhg-app/Frontend-QNHG/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\laragon\\www\\qnhg-app\\Frontend-QNHG";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@components": resolve(__vite_injected_original_dirname, "src/components"),
      // eslint-disable-next-line no-undef
      "@common": resolve(__vite_injected_original_dirname, "src/common"),
      // eslint-disable-next-line no-undef
      "@constants": resolve(__vite_injected_original_dirname, "src/constants"),
      // eslint-disable-next-line no-undef
      "@assets": resolve(__vite_injected_original_dirname, "src/assets"),
      // eslint-disable-next-line no-undef
      "@pages": resolve(__vite_injected_original_dirname, "src/pages"),
      // eslint-disable-next-line no-undef
      "@routes": resolve(__vite_injected_original_dirname, "src/routes"),
      // eslint-disable-next-line no-undef
      "@helpers": resolve(__vite_injected_original_dirname, "src/helpers"),
      // eslint-disable-next-line no-undef
      "@store": resolve(__vite_injected_original_dirname, "src/store"),
      // eslint-disable-next-line no-undef
      "@locales": resolve(__vite_injected_original_dirname, "src/locales"),
      "@layouts": resolve(__vite_injected_original_dirname, "src/layouts"),
      "@services": resolve(__vite_injected_original_dirname, "src/services"),
      "@hooks": resolve(__vite_injected_original_dirname, "src/hooks"),
      "@config": resolve(__vite_injected_original_dirname, "src/config")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxxbmhnLWFwcFxcXFxGcm9udGVuZC1RTkhHXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxxbmhnLWFwcFxcXFxGcm9udGVuZC1RTkhHXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9sYXJhZ29uL3d3dy9xbmhnLWFwcC9Gcm9udGVuZC1RTkhHL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xyXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFwiQGNvbXBvbmVudHNcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2NvbXBvbmVudHNcIiksXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBcIkBjb21tb25cIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2NvbW1vblwiKSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFwiQGNvbnN0YW50c1wiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvY29uc3RhbnRzXCIpLFxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgICAgXCJAYXNzZXRzXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9hc3NldHNcIiksXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBcIkBwYWdlc1wiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvcGFnZXNcIiksXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBcIkByb3V0ZXNcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL3JvdXRlc1wiKSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFwiQGhlbHBlcnNcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2hlbHBlcnNcIiksXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBcIkBzdG9yZVwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvc3RvcmVcIiksXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBcIkBsb2NhbGVzXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9sb2NhbGVzXCIpLFxyXG4gICAgICBcIkBsYXlvdXRzXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9sYXlvdXRzXCIpLFxyXG4gICAgICBcIkBzZXJ2aWNlc1wiOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvc2VydmljZXNcIiksXHJcbiAgICAgIFwiQGhvb2tzXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9ob29rc1wiKSxcclxuICAgICAgXCJAY29uZmlnXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy9jb25maWdcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJTLFNBQVMsb0JBQW9CO0FBQ3hVLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFIeEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxFQUNoQyxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUE7QUFBQSxNQUVMLGVBQWUsUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQTtBQUFBLE1BRWxELFdBQVcsUUFBUSxrQ0FBVyxZQUFZO0FBQUE7QUFBQSxNQUUxQyxjQUFjLFFBQVEsa0NBQVcsZUFBZTtBQUFBO0FBQUEsTUFFaEQsV0FBVyxRQUFRLGtDQUFXLFlBQVk7QUFBQTtBQUFBLE1BRTFDLFVBQVUsUUFBUSxrQ0FBVyxXQUFXO0FBQUE7QUFBQSxNQUV4QyxXQUFXLFFBQVEsa0NBQVcsWUFBWTtBQUFBO0FBQUEsTUFFMUMsWUFBWSxRQUFRLGtDQUFXLGFBQWE7QUFBQTtBQUFBLE1BRTVDLFVBQVUsUUFBUSxrQ0FBVyxXQUFXO0FBQUE7QUFBQSxNQUV4QyxZQUFZLFFBQVEsa0NBQVcsYUFBYTtBQUFBLE1BQzVDLFlBQVksUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDNUMsYUFBYSxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUM5QyxVQUFVLFFBQVEsa0NBQVcsV0FBVztBQUFBLE1BQ3hDLFdBQVcsUUFBUSxrQ0FBVyxZQUFZO0FBQUEsSUFDNUM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
