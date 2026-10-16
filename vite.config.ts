import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { mediaQueries } from "./src/design-system/variables/layout";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    {
      name: "design-system-media",
      enforce: "pre",
      transform(source, id) {
        if (!id.endsWith(".css")) return;
        return source.replace(
          /@media \(--([a-z]+)\)/g,
          (_, name: keyof typeof mediaQueries) => {
            if (!(name in mediaQueries))
              throw new Error(`Unknown design-system breakpoint: ${name}`);
            return `@media ${mediaQueries[name]}`;
          },
        );
      },
    },
    react(),
    tailwindcss(),
  ],
});
