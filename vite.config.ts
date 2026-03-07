import { Alias, defineConfig, PluginOption, UserConfig } from "vite";
import preact from '@preact/preset-vite';
import react from '@vitejs/plugin-react'
import path from "path";

type VitePreset = {
  name: string;
  tsConfig: any;
  aliases?: Alias[];
  plugins?: PluginOption[];
  excludeOptimizeDeps?: string[];
};
function getVitePreset(mode: string): VitePreset {
  switch (mode) {
  case "react": {
    return {
      name: "react",
      tsConfig: require("./tsconfig.react.json"),
      plugins: [react()],
    };
  } break;
  case "preact": {
    return {
      name: "preact",
      tsConfig: require("./tsconfig.preact.json"),
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
    };
  } break;
  default: {
    return {
      name: "jsreact",
      tsConfig: require("./tsconfig.json"),
      aliases: [
        { find: "react", replacement: path.resolve(__dirname, "src/jsreact") },
        { find: "react-dom", replacement: path.resolve(__dirname, "src/jsreact/react-dom") },
        { find: "preact", replacement: path.resolve(__dirname, "src/jsreact/preact") },
        { find: "preact-iso", replacement: path.resolve(__dirname, "src/jsreact/preact-iso") },
      ],
      excludeOptimizeDeps: ["react", "react-dom", "preact", "preact-iso"],
    };
  } break;
  }
}

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const {name, plugins, aliases=[], tsConfig, excludeOptimizeDeps=[]} = getVitePreset(mode);
  const config: UserConfig = {
    envPrefix: ["VITE_", "JSREACT_"],
    plugins,
    resolve: { alias: [
      ...aliases,
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@mui/material", replacement: path.resolve(__dirname, "src/docs/mock/mui-material") },
      { find: "@mui/utils", replacement: path.resolve(__dirname, "src/docs/mock/mui-utils") },
      { find: "@mui/system", replacement: path.resolve(__dirname, "src/docs/mock/mui-system") },
      { find: "react-transition-group", replacement: path.resolve(__dirname, "src/docs/mock/react-transition-group") },
    ] },
    esbuild: { tsconfigRaw: tsConfig },
    optimizeDeps: { exclude: [...excludeOptimizeDeps, "@mui/material", "@mui/utils", "@mui/system"] },
    server: { port: 3000, strictPort: true },
    define: {
      'import.meta.env.PRESET_NAME': JSON.stringify(name),
      // support for mock/mui-material
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }
  };
  return config;
});
