import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			src: "/src",
		},
	},
	server: {
		port: 3000,
		strictPort: true,
	},
});
