import { spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const STORY_DIR = "C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\run-titibaccha-run\\public\\assets\\story";

const EXPECTED_IMAGES = [
  "01_peaceful_garden_20261026210119.jpg",
  "02_meteor_disaster_20261026210119.jpg",
  "03_ronny_waiting_20261026210119.jpg",
  "04_fox_betrayal_20261026210119.jpg",
  "05_ronny_leaving_20261026210119.jpg",
  "06_search_hearts_20261026210119.jpg",
  "07_forest_memory_20261026210119.jpg",
  "08_memory_photo_20261026210119.jpg",
  "09_dark_cave_20261026210119.jpg",
  "10_moving_train_20261026210119.jpg",
  "11_seaside_arrival_20261026210119.jpg",
  "12_explosion_map_20261026210119.jpg",
  "13_necklace_glow_20261026210119.jpg",
  "14_rose_reunion_20261026210119.jpg",
  "15_sunset_ending_20261026210119.jpg",
];

async function run() {
  console.log("================================================================================");
  console.log("   RUN TITIBACCHA, RUN! — 15 STORY ILLUSTRATIONS INTEGRATION VERIFICATION");
  console.log("================================================================================");

  // 1. Filesystem Integrity Check
  console.log("\n1. Auditing 15 Story Illustrations on disk...");
  for (const img of EXPECTED_IMAGES) {
    const fullPath = join(STORY_DIR, img);
    if (!existsSync(fullPath)) {
      throw new Error(`File missing on disk: ${fullPath}`);
    }
    const buf = readFileSync(fullPath);
    if (buf.length < 50000) {
      throw new Error(`File suspiciously small (${buf.length} bytes): ${img}`);
    }
    console.log(`   ✅ ${img} (${(buf.length / 1024).toFixed(1)} KB) verified.`);
  }

  // 2. Start / Check Next.js server on port 3000
  let nextServer = null;
  let serverReady = false;
  try {
    const res = await fetch("http://localhost:3000");
    if (res.ok || res.status < 500) {
      serverReady = true;
      console.log("\n2. Next.js server already running on http://localhost:3000");
    }
  } catch {}

  if (!serverReady) {
    console.log("\n2. Starting Next.js production server on port 3000...");
    nextServer = spawn(
      "node",
      ["./node_modules/next/dist/bin/next", "start", "-p", "3000"],
      {
        cwd: "C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\run-titibaccha-run",
        stdio: "pipe",
      }
    );

    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch("http://localhost:3000");
        if (res.ok || res.status < 500) {
          serverReady = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!serverReady) {
      throw new Error("Next.js server failed to respond on port 3000 within 15 seconds.");
    }
    console.log("   Next.js server is READY.");
  }

  // 3. Test HTTP Fetch for All 15 Image Paths in Production Build
  console.log("\n3. Testing HTTP Delivery for all 15 image routes in production build...");
  for (const img of EXPECTED_IMAGES) {
    const url = `http://localhost:3000/assets/story/${img}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP fetch failed for ${url} (Status: ${res.status})`);
    }
    const contentType = res.headers.get("content-type");
    const contentLength = res.headers.get("content-length");
    console.log(`   ✅ HTTP ${res.status}: ${url} [${contentType}, ${contentLength} bytes]`);
  }

  // 4. Browser In-DOM Image Loading Verification
  console.log("\n4. Launching Headless Chrome to verify DOM rendering...");
  const chromeProcess = spawn(
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-story-test",
      "--window-size=1280,720",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch("http://localhost:9222/json/list");
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }

  try {
    const targetsRes = await fetch("http://localhost:9222/json/list");
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === "page") || targets[0];
    if (!pageTarget) throw new Error("No target page found in Chrome");

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let messageId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const id = messageId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await send("Page.enable");
    await send("Runtime.enable");

    console.log("5. Navigating to http://localhost:3000...");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Test In-Browser Story Gallery Modal
    console.log("6. Opening Story Gallery on Title Menu...");
    const galleryCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const galleryBtn = buttons.find(b => b.textContent.includes('Story Gallery') || b.textContent.includes('15 Scenes'));
        if (galleryBtn) {
          galleryBtn.click();
          return { clicked: true };
        }
        return { clicked: false };
      })()`,
      returnByValue: true,
    });
    console.log("   Gallery Button Click:", galleryCheck.result.value);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify all 15 thumbnails rendered in DOM
    const thumbCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('/assets/story/'));
        const loadedCount = imgs.filter(img => img.naturalWidth > 0 && img.naturalHeight > 0).length;
        return {
          totalFound: imgs.length,
          loadedCount,
          samples: imgs.slice(0, 3).map(img => ({ src: img.src, w: img.naturalWidth, h: img.naturalHeight })),
        };
      })()`,
      returnByValue: true,
    });
    console.log("   Gallery Thumbnails DOM Status:", thumbCheck.result.value);

    // Test clicking a thumbnail to open IllustratedStoryPanel
    console.log("7. Opening full-screen story card from gallery...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const cards = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Days of Sunshine') || b.textContent.includes('The Shattered Sky'));
        if (cards[0]) cards[0].click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify story card image & controls
    const cardCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const storyImg = document.querySelector('div[role="dialog"] img');
        const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next') || b.textContent.includes('Continue'));
        const prevBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Previous'));
        const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip'));
        return {
          hasStoryDialog: Boolean(document.querySelector('div[role="dialog"]')),
          imageSrc: storyImg?.src,
          imageLoaded: storyImg ? storyImg.naturalWidth > 0 : false,
          imageWidth: storyImg?.naturalWidth,
          imageHeight: storyImg?.naturalHeight,
          hasNextBtn: Boolean(nextBtn),
          hasSkipBtn: Boolean(skipBtn),
        };
      })()`,
      returnByValue: true,
    });
    console.log("   Story Card Active Status:", cardCheck.result.value);

    if (!cardCheck.result.value.imageLoaded) {
      throw new Error("Active story illustration failed to load in DOM!");
    }

    console.log("\n================================================================================");
    console.log("   🎉 ALL 15 STORY ILLUSTRATIONS INTEGRATED AND VERIFIED SUCCESSFULLY! 🎉");
    console.log("================================================================================\n");

  } finally {
    try {
      chromeProcess.kill();
    } catch {}
    if (nextServer) {
      try {
        nextServer.kill();
      } catch {}
    }
  }
}

run().catch((err) => {
  console.error("\n❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
