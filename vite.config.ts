import { AliasOptions, defineConfig, PluginOption } from "vite";
import preact from '@preact/preset-vite';
import react from '@vitejs/plugin-react'
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type VitePreset = {
  plugins: PluginOption[];
  aliases: AliasOptions;
  tsConfig: any;
  excludeOptimizeDeps: string[];
};
function getVitePreset(mode: string): VitePreset {
  switch (mode) {
  case "react": {
    return {
      aliases: [],
      plugins: [react()],
      tsConfig: require("./tsconfig.react.json"),
      excludeOptimizeDeps: [],
    };
  } break;
  case "preact": {
    return {
      aliases: [],
      plugins: [
        preact(),
        {
          name: 'full-reload',
          handleHotUpdate({server}) {
            server.ws.send({type: 'full-reload'}); // NOTE: hot module reload duplicates elements when an error is thrown
            return [];
          }
        },
      ],
      tsConfig: require("./tsconfig.preact.json"),
      excludeOptimizeDeps: [],
    };
  } break;
  default: {
    return {
      aliases: [
        { find: "react", replacement: path.resolve(__dirname, "src/jsreact") },
        { find: "react-dom", replacement: path.resolve(__dirname, "src/jsreact/react-dom") },
      ],
      plugins: [],
      tsConfig: require("./tsconfig.json"),
      excludeOptimizeDeps: ["react", "react-dom"],
    };
  } break;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const {plugins, aliases, tsConfig, excludeOptimizeDeps} = getVitePreset(mode);
  return {
    plugins,
    resolve: { alias: aliases },
    esbuild: { tsconfigRaw: tsConfig },
    optimizeDeps: { exclude: excludeOptimizeDeps },
    server: { port: 3000, strictPort: true },
  }
});
