import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
//   build: {
//     target: "esnext",
//   },
  plugins: [glsl()],
});
