import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const zipPath = "C:/Users/nightfury/.gemini/antigravity/brain/876eb528-2510-40f2-aaf2-9dca3a59e674/.user_uploaded/media_1792959623714_aa947edc.zip";
const outDir = "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/staging_assets";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log("Extracting zip to:", outDir);
execSync(`tar -xf "${zipPath}" -C "${outDir}"`, { stdio: "inherit" });
console.log("Extraction finished successfully!");
