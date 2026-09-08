import { copyFile, cp, readFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const certsRoot = resolve(projectRoot, "certs");

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

const CONTENT_TYPES_BY_EXTENSION: Record<string, string> = {
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function contentTypeFor(path: string): string {
  const extension = path.slice(path.lastIndexOf(".")).toLowerCase();
  return CONTENT_TYPES_BY_EXTENSION[extension] ?? "application/octet-stream";
}

function certContentPlugin(): Plugin {
  return {
    name: "cert-content",
    configureServer(server) {
      server.middlewares.use("/certs", async (request, response, next) => {
        const requestPath = request.url?.split("?", 1)[0] ?? "/";
        let decodedPath: string;

        try {
          decodedPath = decodeURIComponent(requestPath);
        } catch {
          next();
          return;
        }

        const candidate = resolve(certsRoot, `.${decodedPath}`);
        const relativePath = relative(certsRoot, candidate);
        const isOutsideRoot =
          isAbsolute(relativePath) ||
          relativePath === ".." ||
          relativePath.startsWith(
            `..${process.platform === "win32" ? "\\" : "/"}`,
          );

        if (isOutsideRoot) {
          next();
          return;
        }

        try {
          const content = await readFile(candidate);
          response.statusCode = 200;
          response.setHeader("Content-Type", contentTypeFor(candidate));
          response.end(content);
        } catch (error) {
          if (isMissingFile(error)) {
            next();
            return;
          }
          next(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },
    async writeBundle(outputOptions) {
      if (!outputOptions.dir) {
        throw new Error(
          "The cert content plugin requires a directory build output.",
        );
      }

      await cp(certsRoot, resolve(outputOptions.dir, "certs"), {
        recursive: true,
      });
    },
  };
}

// GitHub Pages serves static files with no SPA rewrite, so a direct request for
// a client-side route (a reload, bookmark, or shared link on /quiz/:certSlug)
// never reaches index.html. Pages falls back to 404.html for unmatched paths, so
// shipping a copy of the entry point under that name lets the router boot and
// resolve the route itself.
function spaFallbackPlugin(): Plugin {
  return {
    name: "spa-fallback",
    async writeBundle(outputOptions) {
      if (!outputOptions.dir) {
        throw new Error(
          "The SPA fallback plugin requires a directory build output.",
        );
      }

      await copyFile(
        resolve(outputOptions.dir, "index.html"),
        resolve(outputOptions.dir, "404.html"),
      );
    },
  };
}

export default defineConfig({
  root: projectRoot,
  base: "/cert-club/",
  publicDir: false,
  plugins: [react(), certContentPlugin(), spaFallbackPlugin()],
});
