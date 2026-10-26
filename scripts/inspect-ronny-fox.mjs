import fs from "fs";
import path from "path";
import zlib from "zlib";

function decodePng(buffer) {
  let offset = 8;
  const idatChunks = [];
  let width = 0, height = 0, colorType = 0;
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "IHDR") {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
      colorType = buffer.readUInt8(offset + 17);
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
  return { width, height, pixels, colorType };
}

const stagingDir = "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/staging_assets";
const framesJson = JSON.parse(fs.readFileSync(path.join(stagingDir, "frames.json"), "utf8"));

const analysis = {};

for (const [charId, anims] of Object.entries(framesJson.characters)) {
  analysis[charId] = {};
  for (const [animName, animDef] of Object.entries(anims)) {
    analysis[charId][animName] = [];
    for (const relPath of animDef.frames) {
      const fullPath = path.join(stagingDir, relPath);
      if (!fs.existsSync(fullPath)) {
        analysis[charId][animName].push({ file: relPath, exists: false });
        continue;
      }
      const buf = fs.readFileSync(fullPath);
      const { width, height, pixels } = decodePng(buf);

      let minX = width, maxX = 0, minY = height, maxY = 0;
      let opaqueCount = 0, transCount = 0, semiCount = 0;
      let sumX = 0, sumY = 0;
      let touchBorder = { top: 0, bottom: 0, left: 0, right: 0 };

      // Sample color distribution
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const a = pixels[idx + 3];
          if (a === 0) {
            transCount++;
          } else {
            if (a < 250) semiCount++;
            else opaqueCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            sumX += x;
            sumY += y;

            if (y === 0) touchBorder.top++;
            if (y === height - 1) touchBorder.bottom++;
            if (x === 0) touchBorder.left++;
            if (x === width - 1) touchBorder.right++;
          }
        }
      }

      const activePixels = opaqueCount + semiCount;
      const centerX = activePixels > 0 ? (sumX / activePixels).toFixed(1) : 0;
      const centerY = activePixels > 0 ? (sumY / activePixels).toFixed(1) : 0;
      const bboxW = maxX >= minX ? maxX - minX + 1 : 0;
      const bboxH = maxY >= minY ? maxY - minY + 1 : 0;

      analysis[charId][animName].push({
        file: relPath,
        exists: true,
        width,
        height,
        activePixels,
        bbox: { minX, minY, maxX, maxY, width: bboxW, height: bboxH },
        center: { x: Number(centerX), y: Number(centerY) },
        touchBorder,
        fileSize: buf.length
      });
    }
  }
}

console.log(JSON.stringify(analysis, null, 2));
