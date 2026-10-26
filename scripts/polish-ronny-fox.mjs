import fs from "fs";
import path from "path";
import zlib from "zlib";

// CRC32
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

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

function encodePng(width, height, pixels) {
  const scanlineLen = 1 + width * 4;
  const raw = Buffer.alloc(height * scanlineLen);
  for (let y = 0; y < height; y++) {
    raw[y * scanlineLen] = 0;
    pixels.copy(raw, y * scanlineLen + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const ihdrType = Buffer.from("IHDR");
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(Buffer.concat([ihdrType, ihdrData])), 0);
  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(13, 0);
  const ihdrChunk = Buffer.concat([ihdrLen, ihdrType, ihdrData, ihdrCrc]);

  const idatType = Buffer.from("IDAT");
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(compressed.length, 0);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(Buffer.concat([idatType, compressed])), 0);
  const idatChunk = Buffer.concat([idatLen, idatType, compressed, idatCrc]);

  const iendType = Buffer.from("IEND");
  const iendLen = Buffer.alloc(4);
  iendLen.writeUInt32BE(0, 0);
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendType), 0);
  const iendChunk = Buffer.concat([iendLen, iendType, iendCrc]);

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const ronnyDir = "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/public/assets/characters/ronny";
const foxDir = "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/public/assets/characters/fox";

console.log("Polishing approved Ronny & Fox frames...");

// 1. Polish Ronny idle frames (idle_00 .. 07)
for (let i = 0; i <= 7; i++) {
  const filePath = path.join(ronnyDir, "idle", `idle_0${i}.png`);
  const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
  let modified = 0;

  // Enhance green leaf pendant saturation
  for (let y = 60; y < 105; y++) {
    for (let x = 80; x < 120; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
      if (a > 30 && g > 60 && g >= r * 0.95 && g >= b * 1.05 && r < 140 && b < 100) {
        pixels[idx] = Math.min(r, 45);
        pixels[idx + 1] = Math.max(g, 135);
        pixels[idx + 2] = Math.min(b, 55);
        modified++;
      }
    }
  }

  // Clear any single-pixel stray floaters on borders (y < 8 or y > 185)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y < 10 || y > 180 || x < 20 || x > 172) {
        const idx = (y * width + x) * 4;
        if (pixels[idx + 3] > 0 && pixels[idx + 3] < 120) {
          pixels[idx + 3] = 0;
          modified++;
        }
      }
    }
  }

  fs.writeFileSync(filePath, encodePng(width, height, pixels));
  console.log(`  ✓ Polished ronny/idle/idle_0${i}.png (modified ${modified} px)`);
}

// 2. Polish Ronny waiting_food frames (waiting_food_00 .. 03)
for (let i = 0; i <= 3; i++) {
  const filePath = path.join(ronnyDir, "waiting_food", `waiting_food_0${i}.png`);
  const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
  let modified = 0;

  // Enhance green leaf pendant where visible on bowl rim
  for (let y = 75; y < 100; y++) {
    for (let x = 85; x < 115; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
      if (a > 30 && g > 55 && g >= r * 0.9 && g >= b * 1.05 && r < 130 && b < 95) {
        pixels[idx] = Math.min(r, 45);
        pixels[idx + 1] = Math.max(g, 135);
        pixels[idx + 2] = Math.min(b, 55);
        modified++;
      }
    }
  }

  fs.writeFileSync(filePath, encodePng(width, height, pixels));
  console.log(`  ✓ Polished ronny/waiting_food/waiting_food_0${i}.png (modified ${modified} px)`);
}

// 3. Polish Ronny surprised frames (surprised_00 .. 04)
for (let i = 0; i <= 4; i++) {
  const filePath = path.join(ronnyDir, "surprised", `surprised_0${i}.png`);
  const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
  let modified = 0;

  for (let y = 60; y < 105; y++) {
    for (let x = 80; x < 120; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
      if (a > 30 && g > 60 && g >= r * 0.95 && g >= b * 1.05 && r < 140 && b < 100) {
        pixels[idx] = Math.min(r, 45);
        pixels[idx + 1] = Math.max(g, 135);
        pixels[idx + 2] = Math.min(b, 55);
        modified++;
      }
    }
  }

  fs.writeFileSync(filePath, encodePng(width, height, pixels));
  console.log(`  ✓ Polished ronny/surprised/surprised_0${i}.png (modified ${modified} px)`);
}

// 4. Polish Fox idle_05.png (clean sitting fox)
{
  const filePath = path.join(foxDir, "idle", "idle_05.png");
  const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
  let modified = 0;

  // Clear faint alpha fringe on outer edges
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 40 || x > 150 || y < 10 || y > 180) {
        const idx = (y * width + x) * 4;
        if (pixels[idx + 3] > 0 && pixels[idx + 3] < 50) {
          pixels[idx + 3] = 0;
          modified++;
        }
      }
    }
  }

  fs.writeFileSync(filePath, encodePng(width, height, pixels));
  console.log(`  ✓ Polished fox/idle/idle_05.png (modified ${modified} px)`);
}

// 5. Polish Fox eating_02.png (clean crouching eating fox)
{
  const filePath = path.join(foxDir, "eating", "eating_02.png");
  const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
  let modified = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x < 15 || x > 175 || y < 15 || y > 180) {
        const idx = (y * width + x) * 4;
        if (pixels[idx + 3] > 0 && pixels[idx + 3] < 50) {
          pixels[idx + 3] = 0;
          modified++;
        }
      }
    }
  }

  fs.writeFileSync(filePath, encodePng(width, height, pixels));
  console.log(`  ✓ Polished fox/eating/eating_02.png (modified ${modified} px)`);
}

console.log("Polishing complete.");
