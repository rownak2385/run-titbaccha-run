import fs from "fs";
import path from "path";

const stagingDir = "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/staging_assets";
const framesJson = JSON.parse(fs.readFileSync(path.join(stagingDir, "frames.json"), "utf8"));

// Let's create an HTML review gallery so we can see all 80+ frames in a visual grid!
let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Ronny & Fox Prototype Frame Inspection Gallery</title>
<style>
  body { background: #1e1e24; color: #f0f0f0; font-family: sans-serif; padding: 20px; }
  h1, h2, h3 { color: #f59e0b; margin-top: 30px; }
  .grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; }
  .card {
    background: #2a2a35;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    width: 210px;
  }
  .card.defect {
    border-color: #ef4444;
    background: #3b1d1d;
  }
  .card.usable {
    border-color: #10b981;
    background: #183326;
  }
  .img-box {
    width: 192px;
    height: 192px;
    background-image: 
      linear-gradient(45deg, #333 25%, transparent 25%), 
      linear-gradient(-45deg, #333 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #333 75%), 
      linear-gradient(-45deg, transparent 75%, #333 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
    background-color: #222;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px auto;
  }
  .img-box img {
    max-width: 192px;
    max-height: 192px;
    image-rendering: pixelated;
  }
  .label { font-size: 12px; font-weight: bold; margin-bottom: 4px; word-break: break-all; }
  .meta { font-size: 11px; color: #aaa; text-align: left; }
</style>
</head>
<body>
<h1>Ronny & Fox Prototype Asset Quality Control Inspection</h1>
<p>Auditing 78 segmented frames across 13 animation states.</p>
`;

for (const [charId, anims] of Object.entries(framesJson.characters)) {
  html += `<h2>Character: ${charId.toUpperCase()}</h2>`;
  for (const [animName, animDef] of Object.entries(anims)) {
    html += `<h3>State: ${charId} / ${animName} (${animDef.frames.length} frames, ${animDef.fps} fps)</h3><div class="grid">`;
    for (const relPath of animDef.frames) {
      const fullPath = path.join(stagingDir, relPath);
      const dataUri = `data:image/png;base64,${fs.readFileSync(fullPath).toString("base64")}`;
      html += `
        <div class="card">
          <div class="label">${path.basename(relPath)}</div>
          <div class="img-box"><img src="${dataUri}" /></div>
          <div class="meta">Path: ${relPath}</div>
        </div>
      `;
    }
    html += `</div>`;
  }
}

html += `</body></html>`;
fs.writeFileSync("C:/Users/nightfury/.gemini/antigravity/brain/876eb528-2510-40f2-aaf2-9dca3a59e674/ronny_fox_gallery.html", html);
console.log("Gallery generated at ronny_fox_gallery.html");
