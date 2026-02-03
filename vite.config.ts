import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			src: "/src",
			docs: "/docs",
		},
	},
	server: {
		port: 3000,
		strictPort: true,
	},
});
