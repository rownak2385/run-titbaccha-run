import fs from "fs";
import path from "path";
import zlib from "zlib";

function decodePng(buffer) {
  let offset = 8;
  const idatChunks = [];
  let width = 0, height = 0;
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "IHDR") {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
    } else if (type === "IDAT") {
      idatChunks.push(buffer.slice(offset + 8, offset + 8 + len));
    }
    offset += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const scanlineLen = 1 + width * 4;
  const pixels = Buffer.alloc(width * height * 4);
  let prevRow = Buffer.alloc(width * 4);
  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * scanlineLen];
    const row = decompressed.slice(y * scanlineLen + 1, (y + 1) * scanlineLen);
    const reconRow = Buffer.alloc(width * 4);
    for (let x = 0; x < width * 4; x++) {
      const left = x >= 4 ? reconRow[x - 4] : 0;
      const up = prevRow[x];
      const upLeft = x >= 4 ? prevRow[x - 4] : 0;
      let val = row[x];
      if (filter === 0) reconRow[x] = val;
      else if (filter === 1) reconRow[x] = (val + left) & 0xff;
      else if (filter === 2) reconRow[x] = (val + up) & 0xff;
      else if (filter === 3)
        reconRow[x] = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
        reconRow[x] = (val + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 0xff;
      }
    }
    reconRow.copy(pixels, y * width * 4);
    prevRow = reconRow;
  }
  return { width, height, pixels };
}

const stagingDir = "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/staging_assets";
const framesJson = JSON.parse(fs.readFileSync(path.join(stagingDir, "frames.json"), "utf8"));

console.log("=== COMPREHENSIVE FRAME-BY-FRAME AUDIT ===");

for (const [charId, anims] of Object.entries(framesJson.characters)) {
  console.log(`\n========================================\nCHARACTER: ${charId.toUpperCase()}\n========================================`);
  for (const [animName, animDef] of Object.entries(anims)) {
    console.log(`\n--- State: ${animName} (${animDef.frames.length} frames) ---`);
    for (const relPath of animDef.frames) {
      const fullPath = path.join(stagingDir, relPath);
      const buf = fs.readFileSync(fullPath);
      const { width, height, pixels } = decodePng(buf);

      let minX = width, maxX = 0, minY = height, maxY = 0;
      let nonTrans = 0;
      let hasGreen = 0, hasBlue = 0, hasOrange = 0, hasCream = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const a = pixels[idx + 3];
          if (a > 20) {
            nonTrans++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;

            const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
            // Green pendant: g > 80, g > r * 1.1, g > b * 1.1
            if (g > 70 && g > r * 1.1 && g > b * 1.1) hasGreen++;
            // Blue shorts: b > 80, b > r * 1.2
            if (b > 70 && b > r * 1.1 && g < 150) hasBlue++;
            // Orange fur: r > 160, g > 70, g < 160, b < 70
            if (r > 160 && g > 70 && g < 160 && b < 70) hasOrange++;
            // Cream shirt / muzzle: r > 200, g > 190, b > 160
            if (r > 200 && g > 180 && b > 150) hasCream++;
          }
        }
      }

      const w = maxX >= minX ? maxX - minX + 1 : 0;
      const h = maxY >= minY ? maxY - minY + 1 : 0;
      console.log(`  ${path.basename(relPath)}: bbox=[${minX},${minY}..${maxX},${maxY}] (${w}x${h}), pixels=${nonTrans}, green=${hasGreen}, blue=${hasBlue}, orange=${hasOrange}, cream=${hasCream}`);
    }
  }
}
