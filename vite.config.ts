import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@pages": path.resolve(__dirname, "src/pages"),
			"@shared": path.resolve(__dirname, "src/shared"),
			"@utils": path.resolve(__dirname, "src/utils"),
			"@features": path.resolve(__dirname, "src/features"),
		},
	},
	plugins: [react()],
});
