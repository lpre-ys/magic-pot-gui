import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {},
    commonjsOptions: {
      include: [
        /submodules\/magic-pot\/src\/palette-sorter\.js/,
        /node_modules/,
      ],
    },
  },
  ssr: {
    noExternal: [/submodules\/magic-pot\/src\/palette-sorter\.js/],
  },
});
