import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const output = resolve(project, ".worker-assets");

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(resolve(project, "../web/public/admin"), output, { recursive: true });
cpSync(resolve(project, "assets/_headers"), resolve(output, "_headers"));
