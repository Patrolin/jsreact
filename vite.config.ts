import { Alias, defineConfig, PluginOption, UserConfig } from "vite";
import preact from '@preact/preset-vite';
import react from '@vitejs/plugin-react'
import path from "path";

type VitePreset = {
  tsConfig: any;
  aliases?: Alias[];
  plugins?: PluginOption[];
  excludeOptimizeDeps?: string[];
};
function getVitePreset(mode: string): VitePreset {
  switch (mode) {
  case "react": {
    return {
      tsConfig: require("./tsconfig.react.json"),
      plugins: [react()],
    };
  } break;
  case "preact": {
    return {
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
  const {plugins, aliases=[], tsConfig, excludeOptimizeDeps=[]} = getVitePreset(mode);
  const config: UserConfig = {
    envPrefix: ["VITE_", "JSREACT_"],
    plugins,
    resolve: { alias: [
      ...aliases,
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@mui/material", replacement: path.resolve(__dirname, "src/docs/mock/mui-material") },
      { find: "@mui/utils", replacement: path.resolve(__dirname, "src/docs/mock/mui-utils") },
      { find: "react-transition-group", replacement: path.resolve(__dirname, "src/docs/mock/react-transition-group") },
    ] },
    esbuild: { tsconfigRaw: tsConfig },
    optimizeDeps: { exclude: [...excludeOptimizeDeps, "@mui/material", "@mui/utils"] },
    server: { port: 3000, strictPort: true },
    define: {
      // support for mock/mui-material
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }
  };
  return config;
});
