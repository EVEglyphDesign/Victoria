import type { Express } from "express";
import type { Server } from 'node:http';

// This site is fully static: the map data and the chat knowledge base are
// baked into the client bundle. No backend LLM/API routes are required, which
// keeps the published site self-contained.
export async function registerRoutes(
  httpServer: Server,
  _app: Express
): Promise<Server> {
  return httpServer;
}
