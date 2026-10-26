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
      else if (filter === 3) reconRow[x] = (val + Math.floor((left + up) / 2)) & 0xff;
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

const targetFrames = [
  "ronny/idle/idle_00.png",
  "ronny/idle/idle_01.png",
  "ronny/idle/idle_02.png",
  "ronny/idle/idle_03.png",
  "ronny/idle/idle_04.png",
  "ronny/idle/idle_05.png",
  "ronny/idle/idle_06.png",
  "ronny/idle/idle_07.png",
  "ronny/waiting_food/waiting_food_00.png",
  "ronny/waiting_food/waiting_food_01.png",
  "ronny/waiting_food/waiting_food_02.png",
  "ronny/waiting_food/waiting_food_03.png",
  "ronny/surprised/surprised_00.png",
  "ronny/surprised/surprised_01.png",
  "ronny/surprised/surprised_02.png",
  "ronny/surprised/surprised_03.png",
  "ronny/surprised/surprised_04.png",
  "fox/idle/idle_05.png",
  "fox/walking/walking_06.png",
  "fox/eating/eating_02.png"
];

console.log("=== DETAILED USABLE FRAME INSPECTION ===");

targetFrames.forEach(rel => {
  const p = path.join(stagingDir, rel);
  const { width, height, pixels } = decodePng(fs.readFileSync(p));
  let bottomPixels = [];
  let isolatedClusters = 0;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = pixels[idx + 3];
      if (a > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (y > 165) {
          bottomPixels.push({ x, y, r: pixels[idx], g: pixels[idx+1], b: pixels[idx+2], a });
        }
      }
    }
  }

  console.log(`\nFrame: ${rel}`);
  console.log(`  Bbox: [${minX}, ${minY} .. ${maxX}, ${maxY}] Size: ${maxX - minX + 1}x${maxY - minY + 1}`);
  console.log(`  Bottom pixels count (y > 165): ${bottomPixels.length}`);
  if (bottomPixels.length > 0) {
    const avgR = (bottomPixels.reduce((s, p) => s + p.r, 0) / bottomPixels.length).toFixed(1);
    const avgG = (bottomPixels.reduce((s, p) => s + p.g, 0) / bottomPixels.length).toFixed(1);
    const avgB = (bottomPixels.reduce((s, p) => s + p.b, 0) / bottomPixels.length).toFixed(1);
    console.log(`  Bottom avg color (y > 165): rgb(${avgR}, ${avgG}, ${avgB})`);
  }
});
