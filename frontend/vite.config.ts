import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	//this is to avoid new dependencies detect for optimization and forcing reload
	optimizeDeps:{
		include:['sveltekit-i18n', 'flowbite-svelte', 'qrcode', 'classnames', '@popperjs/core'],
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
