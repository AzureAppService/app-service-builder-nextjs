import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { stripVTControlCharacters } from "node:util";
import { submitGreeting } from "./src/app/actions.js";

test("manifest binds the standalone server to all interfaces on component port 3000", async () => {
  const manifest = await readFile(new URL("./builder.yaml", import.meta.url), "utf8");
  assert.equal(manifest.replaceAll("\r\n", "\n").trimEnd(), `components:
  - name: web
    role: web
    path: /
    run:
      port: 3000
      start: HOSTNAME=0.0.0.0 node server.js
      healthCheckPath: /api/health`);
});

test("standalone output contains the generated server and public image", async () => {
  await access(new URL("./.next/standalone/server.js", import.meta.url));
  assert.deepEqual(
    await readFile(new URL("./.next/standalone/public/shape.png", import.meta.url)),
    await readFile(new URL("./public/shape.png", import.meta.url)),
  );
});

test("server action trims valid names and accepts the 40-character limit", async () => {
  for (const [input, expected] of [["  Builder  ", "Builder"], ["x".repeat(40), "x".repeat(40)]]) {
    const form = new FormData();
    form.set("name", input);
    assert.deepEqual(await submitGreeting({}, form), {
      message: `Server action received: ${expected}`,
      success: true,
    });
  }
});

test("server action rejects missing, blank, and over-limit names", async () => {
  for (const input of [null, "", "   ", "x".repeat(41)]) {
    const form = new FormData();
    if (input !== null) form.set("name", input);
    assert.deepEqual(await submitGreeting({}, form), {
      message: "Enter a name between 1 and 40 characters.",
      success: false,
    });
  }
});

test("standalone server serves framework routes, assets, images, and runtime SSR", { timeout: 60000 }, async (t) => {
  const reservation = createServer();
  await new Promise((resolve, reject) => {
    reservation.once("error", reject);
    reservation.listen(0, "127.0.0.1", resolve);
  });
  const address = reservation.address();
  assert.ok(address && typeof address !== "string");
  await new Promise((resolve, reject) => {
    reservation.close((error) => error ? reject(error) : resolve());
  });
  const server = spawn(process.execPath, ["server.js"], {
    cwd: new URL("./.next/standalone/", import.meta.url),
    env: {
      ...process.env,
      HOSTNAME: "0.0.0.0",
      PORT: String(address.port),
      RUNTIME_MARKER: "standalone-runtime-test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const closed = new Promise((resolve) => server.once("close", resolve));
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) server.kill("SIGTERM");
    await closed;
  });
  await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`Standalone server did not become ready: ${output}`)), 15000);
    const finish = (error) => {
      clearTimeout(timeout);
      if (error) reject(error);
      else resolve();
    };
    const receive = (chunk) => {
      output += chunk.toString();
      if (stripVTControlCharacters(output).includes("Ready in")) finish();
    };
    server.once("error", (error) => finish(error));
    server.once("close", (code) => finish(new Error(`Standalone server exited (${code}): ${output}`)));
    server.stdout.on("data", receive);
    server.stderr.on("data", receive);
  });
  const origin = `http://127.0.0.1:${address.port}`;

  const root = await fetch(origin);
  assert.equal(root.status, 200);
  const html = await root.text();
  assert.ok(html.includes("Next.js App Router is running"));
  assert.ok(html.includes("<title>App Service Builder: Next.js sample</title>"));
  const assets = [...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+\.(?:js|css))"/g)]
    .map((match) => match[1]);
  assert.ok(assets.some((asset) => asset.endsWith(".js")));
  assert.ok(assets.some((asset) => asset.endsWith(".css")));
  for (const asset of new Set(assets)) {
    const response = await fetch(new URL(asset, origin));
    assert.equal(response.status, 200, asset);
    assert.match(response.headers.get("content-type"), asset.endsWith(".css") ? /text\/css/ : /javascript/);
    assert.ok((await response.text()).length > 0);
  }
  for (const [path, status, expected] of [
    ["/products/widget-1", 200, "Widget 1"],
    ["/products/widget-2", 200, "Widget 2"],
    ["/products/unknown", 404, "Next.js page not found"],
    ["/server-action", 200, "Submit data to the server"],
    ["/missing-page", 404, "Next.js page not found"],
  ]) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, status, path);
    assert.ok((await response.text()).includes(expected), path);
  }
  for (const path of ["/api/health", "/health"]) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", app: "app-service-builder-nextjs" });
  }
  const versionResponse = await fetch(new URL("/api/version", origin));
  assert.equal(versionResponse.status, 200);
  const version = await versionResponse.json();
  assert.equal(version.app, "app-service-builder-nextjs");
  assert.equal(version.framework, "Next.js 16 App Router");
  assert.equal(version.runtimeMarker, "standalone-runtime-test");
  assert.match(version.runtime, /^Node\.js v\d+\./);
  assert.equal(version.method, "GET");
  assert.equal(version.path, "/api/version");

  const firstDynamic = await (await fetch(new URL("/dynamic", origin))).text();
  assert.ok(firstDynamic.includes("standalone-runtime-test"));
  const firstTime = firstDynamic.match(/Rendered at<\/dt>\s*<dd>([^<]+)<\/dd>/)?.[1];
  assert.ok(firstTime);
  await delay(20);
  const secondDynamic = await (await fetch(new URL("/dynamic", origin))).text();
  const secondTime = secondDynamic.match(/Rendered at<\/dt>\s*<dd>([^<]+)<\/dd>/)?.[1];
  assert.ok(secondTime);
  assert.notEqual(firstTime, secondTime, "SSR must render again for a new request");

  const proxy = await fetch(new URL("/middleware-check", origin));
  assert.equal(proxy.status, 200);
  assert.equal(proxy.headers.get("x-builder-apps-proxy"), "active");
  assert.ok((await proxy.text()).includes("Proxy check reached the App Router"));
  for (const path of ["/shape.png", "/_next/image?url=%2Fshape.png&w=256&q=75"]) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /^image\//);
    assert.ok((await response.arrayBuffer()).byteLength > 0);
  }
  const redirect = await fetch(new URL("/legacy", origin), { redirect: "manual" });
  assert.equal(redirect.status, 307);
  assert.equal(redirect.headers.get("location"), "/");
});
