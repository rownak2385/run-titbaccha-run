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

const stagingDir = "C:/Users/nightfury/.gemini/antigravity/scratch/run-titibaccha-run/staging_assets";
const outDir = "C:/Users/nightfury/.gemini/antigravity/brain/876eb528-2510-40f2-aaf2-9dca3a59e674";
const framesJson = JSON.parse(fs.readFileSync(path.join(stagingDir, "frames.json"), "utf8"));

for (const [charId, anims] of Object.entries(framesJson.characters)) {
  for (const [animName, animDef] of Object.entries(anims)) {
    const frameCount = animDef.frames.length;
    const stripW = frameCount * 192;
    const stripH = 192;
    const stripPixels = Buffer.alloc(stripW * stripH * 4);

    // Draw checkerboard background for transparency visibility
    for (let y = 0; y < stripH; y++) {
      for (let x = 0; x < stripW; x++) {
        const idx = (y * stripW + x) * 4;
        const isDark = ((Math.floor(x / 16) + Math.floor(y / 16)) % 2) === 0;
        const c = isDark ? 40 : 60;
        stripPixels[idx] = c;
        stripPixels[idx + 1] = c;
        stripPixels[idx + 2] = c;
        stripPixels[idx + 3] = 255;
      }
    }

    animDef.frames.forEach((fPath, fIdx) => {
      const fullPath = path.join(stagingDir, fPath);
      const { pixels } = decodePng(fs.readFileSync(fullPath));
      const offsetX = fIdx * 192;

      for (let y = 0; y < 192; y++) {
        for (let x = 0; x < 192; x++) {
          const srcIdx = (y * 192 + x) * 4;
          const a = pixels[srcIdx + 3] / 255;
          if (a > 0) {
            const dstIdx = (y * stripW + (offsetX + x)) * 4;
            stripPixels[dstIdx] = Math.round(pixels[srcIdx] * a + stripPixels[dstIdx] * (1 - a));
            stripPixels[dstIdx + 1] = Math.round(pixels[srcIdx + 1] * a + stripPixels[dstIdx + 1] * (1 - a));
            stripPixels[dstIdx + 2] = Math.round(pixels[srcIdx + 2] * a + stripPixels[dstIdx + 2] * (1 - a));
            stripPixels[dstIdx + 3] = 255;
          }
        }
      }
    });

    const png = encodePng(stripW, stripH, stripPixels);
    const outFile = path.join(outDir, `strip_${charId}_${animName}.png`);
    fs.writeFileSync(outFile, png);
    console.log(`Created strip: strip_${charId}_${animName}.png (${stripW}x${stripH})`);
  }
}
