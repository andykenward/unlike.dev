import fs from "node:fs";
import http2 from "node:http2";
import Koa from "koa";
import serve from "koa-static";

const app = new Koa();
//
app.use(serve("www/dist", { maxage: 365 * 24 * 60 * 60 * 1000 }));

const onRequestHandler = app.callback();
const serverOptions = {
  key: fs.readFileSync("localhost+6-key.pem"),
  cert: fs.readFileSync("localhost+6.pem"),
};

const server = http2.createSecureServer(serverOptions, onRequestHandler);
server.listen(4321);
