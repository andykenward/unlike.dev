import { serveDir, serveFile } from "@std/http/file-server";
import { route, type Route } from "@std/http/unstable-route";

const routes: Route[] = [
  {
    pattern: new URLPattern({ pathname: "/" }),
    handler: (req: Request) => serveFile(req, "../www/dist/index.html"),
  },
  {
    pattern: new URLPattern({ pathname: "/_astro/*" }),
    handler: (req: Request) =>
      serveDir(req, {
        fsRoot: "../www/dist",
        headers: ["Cache-Control: public, max-age=31536000, immutable"],
      }),
  },
];

async function defaultHandler(_req: Request) {
  const response = await serveFile(_req, "../www/dist/404.html");
  return new Response(response.body, { status: 404 });
}

Deno.serve(
  {
    port: 4321,
    cert: Deno.readTextFileSync("../localhost+6.pem"),
    key: Deno.readTextFileSync("../localhost+6-key.pem"),
  },
  route(routes, defaultHandler),
);
