import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: "react", replacement: path.resolve(__dirname, "src/jsreact") },
      { find: "react-dom", replacement: path.resolve(__dirname, "src/jsreact/index-dom.ts") },
      { find: "react/jsx-runtime", replacement: path.resolve(__dirname, "src/jsreact/jsx-runtime.ts") },
      { find: "react/jsx-dev-runtime", replacement: path.resolve(__dirname, "src/jsreact/jsx-dev-runtime.ts") },
		],
  },
  optimizeDeps: { exclude: ["react", "react-dom"] },
	server: { port: 3000, strictPort: true },
});
