import fs from "fs";
import path from "path";
import zlib from "zlib";

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function decodePng(buffer) {
  let offset = 8;
  const idatChunks = [];
  let width = 0,
    height = 0;
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
        const pa = Math.abs(p - left),
          pb = Math.abs(p - up),
          pc = Math.abs(p - upLeft);
        reconRow[x] =
          (val + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 0xff;
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
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
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

const baseDir =
  "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/public/assets/characters/titibaccha";

const modifiedFiles = [];

// ==========================================
// TASK 1 & 5: JUMPING & FALLING GROUND SHADOWS & AIRBORNE POSES
// ==========================================
console.log("\n--- Task 1 & 5: Polishing Jumping Frames ---");
const jumpFiles = fs
  .readdirSync(path.join(baseDir, "jumping"))
  .filter((f) => f.endsWith(".png"));

jumpFiles.forEach((file) => {
  const filePath = path.join(baseDir, "jumping", file);
  const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
  let removedCount = 0;

  for (let y = 110; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const idx = (y * 128 + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];

      if (a === 0) continue;

      // In jumping_01 through 05, real feet end at y <= 114. Everything at y >= 116 is ground shadow!
      if (file !== "jumping_00.png" && y >= 116) {
        pixels[idx + 3] = 0;
        removedCount++;
      } else if (file === "jumping_00.png" && y >= 118) {
        // In jumping_00, feet reach down to 117. Smudge is at y >= 118
        if (x < 30 || x > 85 || !(r > 160 && g > 60 && g < 170 && b < 70)) {
          pixels[idx + 3] = 0;
          removedCount++;
        }
      }
    }
  }

  if (removedCount > 0) {
    fs.writeFileSync(filePath, encodePng(width, height, pixels));
    modifiedFiles.push(`jumping/${file}`);
    console.log(`  ✓ Cleaned jumping/${file}: ${removedCount} shadow pixels removed`);
  }
});

console.log("\n--- Task 1 & 5: Polishing Falling Frames ---");
const fallFiles = fs
  .readdirSync(path.join(baseDir, "falling"))
  .filter((f) => f.endsWith(".png"));

fallFiles.forEach((file) => {
  const filePath = path.join(baseDir, "falling", file);
  const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
  let removedCount = 0;

  for (let y = 115; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const idx = (y * 128 + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];

      if (a === 0) continue;

      // In falling_00, 01, 03: disconnected ground strip at y >= 120
      if ((file === "falling_00.png" || file === "falling_01.png" || file === "falling_03.png") && y >= 120) {
        pixels[idx + 3] = 0;
        removedCount++;
      } else if (y >= 119) {
        // Outside feet bounds or faint shadow smudge
        if (x < 25 || x > 90 || !(r > 160 && g > 50 && g < 170 && b < 70)) {
          pixels[idx + 3] = 0;
          removedCount++;
        }
      }
    }
  }

  if (removedCount > 0) {
    fs.writeFileSync(filePath, encodePng(width, height, pixels));
    modifiedFiles.push(`falling/${file}`);
    console.log(`  ✓ Cleaned falling/${file}: ${removedCount} shadow pixels removed`);
  }
});

// ==========================================
// TASK 2: REMOVE BLUE ARTIFACT FROM HAPPY_00.PNG
// ==========================================
console.log("\n--- Task 2: Polishing happy_00.png ---");
const happyPath = path.join(baseDir, "happy", "happy_00.png");
const { width: hw, height: hh, pixels: hp } = decodePng(fs.readFileSync(happyPath));
let blueRemoved = 0;

for (let y = 20; y < 75; y++) {
  for (let x = 10; x < 30; x++) {
    const idx = (y * 128 + x) * 4;
    const r = hp[idx];
    const g = hp[idx + 1];
    const b = hp[idx + 2];
    const a = hp[idx + 3];
    // Blueish artifact: b > r + 20 and b > g - 10
    if (a > 10 && b > r + 20 && b > g - 10) {
      hp[idx + 3] = 0; // Clear alpha
      blueRemoved++;
    }
  }
}

if (blueRemoved > 0) {
  fs.writeFileSync(happyPath, encodePng(hw, hh, hp));
  modifiedFiles.push("happy/happy_00.png");
  console.log(`  ✓ Cleaned happy/happy_00.png: ${blueRemoved} blue artifact pixels removed`);
}

// ==========================================
// TASK 4: ENHANCE NECKLACE CONSISTENCY (APPROVED EMERALD GREEN)
// ==========================================
console.log("\n--- Task 4: Enhancing Necklace Consistency ---");
// We enrich the green leaf pendant in frames where it was faded or desaturated
const framesJson = JSON.parse(fs.readFileSync(path.join(baseDir, "frames.json"), "utf8"));
let necklaceEnhancedFiles = 0;

for (const [anim, files] of Object.entries(framesJson.frames)) {
  files.forEach((f) => {
    const filePath = path.join(baseDir, f);
    const { width, height, pixels } = decodePng(fs.readFileSync(filePath));
    let enhanced = 0;

    for (let y = 60; y < 96; y++) {
      for (let x = 45; x < 95; x++) {
        const idx = (y * 128 + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];

        if (a > 30) {
          // If pixel is green leaf pendant (green dominant or olive-green)
          if (g > 65 && g >= r * 0.95 && g >= b * 1.05 && r < 140 && b < 100) {
            // Reinforce approved emerald green hue: #2e7d32 to #43a047
            pixels[idx] = Math.min(r, 45); // Rich forest red component
            pixels[idx + 1] = Math.max(g, 135); // Vivid vibrant leaf green
            pixels[idx + 2] = Math.min(b, 55); // Rich leaf blue component
            enhanced++;
          }
        }
      }
    }

    if (enhanced > 0) {
      fs.writeFileSync(filePath, encodePng(width, height, pixels));
      necklaceEnhancedFiles++;
    }
  });
}
console.log(`  ✓ Enhanced leaf pendant saturation and consistency across ${necklaceEnhancedFiles} frames.`);

console.log("\n=======================================================");
console.log(`Total Modified / Polished Frame Files: ${modifiedFiles.length} files`);
console.log("=======================================================\n");
