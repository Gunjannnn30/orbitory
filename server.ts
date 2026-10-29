import "dotenv/config";
import { createServer } from "node:http";
import next from "next";
import { env } from "./src/lib/env";
import { prisma } from "./src/lib/prisma";

const dev = env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

async function main() {
  await app.prepare();
  const httpServer = createServer((req, res) => handler(req, res));

  httpServer.listen(port, hostname, () => {
    console.log(
      `> Orbitory ready on http://localhost:${port} (${dev ? "development" : "production"})`,
    );
  });

  const shutdown = async () => {
    console.log("Shutting down Orbitory...");
    httpServer.close();
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error("Failed to start Orbitory", error);
  process.exit(1);
});
