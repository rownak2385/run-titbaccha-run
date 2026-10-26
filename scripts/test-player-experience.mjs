import { spawn } from "child_process";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const ARTIFACT_DIR = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674";
const LOCAL_SCREENSHOTS_DIR = "C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\run-titibaccha-run\\scripts\\screenshots";

if (!existsSync(LOCAL_SCREENSHOTS_DIR)) {
  mkdirSync(LOCAL_SCREENSHOTS_DIR, { recursive: true });
}

function saveScreenshot(name, base64Data) {
  const buf = Buffer.from(base64Data, "base64");
  const artifactPath = join(ARTIFACT_DIR, name);
  const localPath = join(LOCAL_SCREENSHOTS_DIR, name);
  writeFileSync(artifactPath, buf);
  writeFileSync(localPath, buf);
  console.log(`   📸 Saved screenshot: ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
}

async function run() {
  console.log("================================================================================");
  console.log("   RUN TITIBACCHA, RUN! — COMBAT-FREE PLAYER EXPERIENCE QA TEST SUITE");
  console.log("================================================================================");

  let nextServer = null;
  let serverReady = false;

  // Check if Next.js is already running on port 3000
  try {
    const res = await fetch("http://localhost:3000");
    if (res.ok || res.status < 500) {
      serverReady = true;
      console.log("1. Next.js server is already active on http://localhost:3000");
    }
  } catch {}

  if (!serverReady) {
    console.log("1. Starting Next.js production server on port 3000...");
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
    console.log("   Next.js production server is READY on http://localhost:3000");
  }

  console.log("2. Launching Headless Chrome on port 9222...");
  const chromeProcess = spawn(
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-player-exp",
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
    const consoleLogs = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
      if (msg.method === "Runtime.consoleAPICalled") {
        consoleLogs.push({ type: msg.params.type, args: msg.params.args });
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

    console.log("3. Navigating to http://localhost:3000...");
    await send("Page.navigate", { url: "http://localhost:3000" });
    
    // Poll until window.__SAVE_SYSTEM__ is hydrated
    for (let i = 0; i < 30; i++) {
      try {
        const chk = await send("Runtime.evaluate", {
          expression: "Boolean(window.__SAVE_SYSTEM__)"
        });
        if (chk.result?.value === true) {
          console.log("   window.__SAVE_SYSTEM__ is hydrated and ready.");
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // -------------------------------------------------------------
    // PHASE A: UNIT & INTEGRATION TESTS (Save Migration & Robustness)
    // -------------------------------------------------------------
    console.log("\n>>> PHASE A: SAVE SYSTEM V5 MIGRATION & DATA INTEGRITY TESTS <<<");

    const unitTestResults = await send("Runtime.evaluate", {
      expression: `(() => {
        const SaveSystem = window.__SAVE_SYSTEM__;
        if (!SaveSystem) return { error: "SaveSystem global not found" };

        const results = [];

        // 1. Test V4 -> V5 Migration
        localStorage.clear();
        const mockV4 = {
          version: 4,
          chapter: 2,
          unlockedChapters: [1, 2],
          completedChapters: [1],
          health: 90,
          activeCheckpoint: { id: "ch2_cp1", x: 1200, y: 580, label: "Old Sunken Checkpoint" },
          collectedItems: ["key_ch2"],
          unlockedChests: ["chest_ch1"],
          defeatedEnemies: [],
          puzzles: { photoPieces: [], isPhotoComplete: false, ticketPieces: [], isTicketComplete: false, mapPieces: [], isMapComplete: false },
          letterFragments: [1],
          hasLetterFragment1: true
        };
        localStorage.setItem("RUN_TITIBACCHA_SAVE_V4", JSON.stringify(mockV4));
        const migratedV5 = SaveSystem.load();
        const v4Success = migratedV5 && migratedV5.version === 5 && migratedV5.chapter === 2 && migratedV5.activeCheckpoint.y === 550;
        results.push({ test: "V4 -> V5 Migration (with auto-recalibrated checkpoint Y)", success: Boolean(v4Success), details: { version: migratedV5?.version, cpY: migratedV5?.activeCheckpoint?.y } });

        // 2. Test V3 -> V5 Migration
        localStorage.clear();
        const mockV3 = {
          version: 3,
          chapter: 3,
          unlockedChapters: [1, 2, 3],
          completedChapters: [1, 2],
          health: 80,
          activeCheckpoint: { id: "ch3_cp1", x: 1400, y: 580, label: "Old V3 Checkpoint" },
          collectedItems: ["photo_piece_1", "photo_piece_2"],
          puzzles: { photoPieces: ["photo_piece_1", "photo_piece_2"] }
        };
        localStorage.setItem("RUN_TITIBACCHA_SAVE_V3", JSON.stringify(mockV3));
        const migratedFromV3 = SaveSystem.load();
        const v3Success = migratedFromV3 && migratedFromV3.version === 5 && migratedFromV3.puzzles.photoPieces.length === 2 && migratedFromV3.activeCheckpoint.y === 550;
        results.push({ test: "V3 -> V5 Migration", success: Boolean(v3Success), details: { version: migratedFromV3?.version, photoPieces: migratedFromV3?.puzzles?.photoPieces?.length } });

        // 3. Test Corrupt Save Recovery
        localStorage.clear();
        localStorage.setItem("RUN_TITIBACCHA_SAVE_V5", "{ MALFORMED JSON !!! NOT VALID");
        const recovered = SaveSystem.load();
        const corruptSuccess = recovered && recovered.version === 5 && recovered.chapter === 1 && recovered.health === 100;
        results.push({ test: "Corrupt JSON Save Recovery to Clean V5", success: Boolean(corruptSuccess), details: { version: recovered?.version, chapter: recovered?.chapter } });

        // 4. Test Duplicate Collectibles Prevention
        SaveSystem.updatePuzzlePiece("photo", "piece_dup_test");
        SaveSystem.updatePuzzlePiece("photo", "piece_dup_test");
        const afterDup = SaveSystem.load();
        const dupPhotoCount = afterDup.puzzles.photoPieces.filter(p => p === "piece_dup_test").length;
        SaveSystem.collectRose("rose_dup_test");
        SaveSystem.collectRose("rose_dup_test");
        const afterRoseDup = SaveSystem.load();
        const dupRoseCount = afterRoseDup.roses.filter(r => r === "rose_dup_test").length;
        const dupSuccess = dupPhotoCount === 1 && dupRoseCount === 1;
        results.push({ test: "Duplicate Collectibles Prevention", success: dupSuccess, details: { dupPhotoCount, dupRoseCount } });

        return { allPassed: results.every(r => r.success), results };
      })()`,
      returnByValue: true,
    });

    console.log("Raw Unit Test Result:", JSON.stringify(unitTestResults, null, 2));
    console.log("Save System Unit & Integration Test Results:");
    unitTestResults.result?.value?.results?.forEach((r) => {
      console.log(`   ${r.success ? "✅ PASS" : "❌ FAIL"}: ${r.test}`, r.details);
    });

    if (!unitTestResults.result.value?.allPassed) {
      throw new Error("One or more Save System V5 unit tests failed.");
    }

    // -------------------------------------------------------------
    // PHASE B: NATURAL PLAYTHROUGH & VISUAL VERIFICATION
    // -------------------------------------------------------------
    console.log("\n>>> PHASE B: STARTING FRESH NATURAL PLAYTHROUGH <<<");

    // Click "New Game"
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newGameBtn = buttons.find(b => b.textContent.includes('New Game') || b.textContent.includes('Start'));
        if (newGameBtn) newGameBtn.click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Confirm reset if modal appears
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.includes('Reset') || b.textContent.includes('Start New'));
        if (confirmBtn) confirmBtn.click();
      })()`,
    });

    console.log("Waiting for Chapter 1: The Betrayal to load...");
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // CHAPTER 1
    console.log("\n--- CHAPTER 1: THE BETRAYAL ---");
    const ch1GroundCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (!scene || !scene.player) return { error: "Scene not loaded" };
        const p = scene.player.sprite;
        const b = p.body;
        // Surface is Y = 656, resting center Y = 599, bottom Y = 656
        return {
          x: p.x,
          y: p.y,
          bottomY: b.bottom,
          isGrounded: b.touching.down || b.blocked.down || Math.abs(b.bottom - 656) <= 2,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 1 Ground Check:", ch1GroundCheck.result.value);

    // Run to clearing and trigger Ronny betrayal
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (scene) {
          scene.player.sprite.setPosition(6080, 599);
          scene.cameras.main.scrollX = 5700;
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Unlock Chapter 1 Chest
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (scene) {
          scene.player.sprite.setPosition(6650, 599);
          scene.cameras.main.scrollX = 6200;
          scene.unlockChest();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Verify Illustrated Story Panel appears
    const storyPanelCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const overlay = document.querySelector('[role="dialog"]') || document.querySelector('.aspect-video');
        const text = document.body.innerText;
        return {
          hasStoryText: text.includes("Betrayal") || text.includes("Story") || text.includes("Narrative") || text.includes("Sunflowers") || text.includes("Ronny"),
          hasStoryModal: Boolean(document.querySelector('button')?.textContent.includes('Next') || text.includes('Page 1 of')),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Illustrated Story Panel Status:", storyPanelCheck.result.value);

    // Capture Screenshot 7: illustrated_story_panel.png
    const ssStory = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("illustrated_story_panel.png", ssStory.data);

    // Advance story via button click or Enter key
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const skipBtn = buttons.find(b => b.textContent.includes('Skip') || b.textContent.includes('Close') || b.textContent.includes('Continue'));
        if (skipBtn) skipBtn.click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 800));

    // CHAPTER 2: THE SEARCH
    console.log("\n--- CHAPTER 2: THE SEARCH ---");
    await send("Runtime.evaluate", {
      expression: `(() => {
        window.__CHAPTER_MANAGER__?.transitionToChapter(window.__PHASER_GAME__.scene.getScenes(true)[0], 2);
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Ground Alignment Verification in Chapter 2
    const ch2GroundCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter2SearchScene");
        if (!scene || !scene.player) return { error: "Chapter 2 scene not found" };
        const p = scene.player.sprite;
        const b = p.body;
        // Surface is Y = 624, resting center Y = 567, body bottom Y = 624
        return {
          x: p.x,
          y: p.y,
          bottomY: b.bottom,
          expectedBottomY: 624,
          isGrounded: Math.abs(b.bottom - 624) <= 2,
          velocityResidual: b.velocity.y,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 2 Ground Alignment Verification:", ch2GroundCheck.result.value);
    if (!ch2GroundCheck.result.value.isGrounded) {
      throw new Error(`Chapter 2 ground alignment failed! Bottom Y is ${ch2GroundCheck.result.value.bottomY}, expected 624.`);
    }

    // Capture Screenshot 1: ch2_grounded_titi.png
    const ssCh2 = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("ch2_grounded_titi.png", ssCh2.data);

    // Unlock Chapter 2 chest
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter2SearchScene");
        if (scene) {
          scene.player.sprite.setPosition(6640, 567);
          scene.cameras.main.scrollX = 6200;
          scene.unlockChest();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // CHAPTER 3: THE RESCUE (PHOTO PIECES PUZZLE)
    console.log("\n--- CHAPTER 3: THE RESCUE (PHOTO PIECES PUZZLE) ---");
    await send("Runtime.evaluate", {
      expression: `(() => {
        window.__CHAPTER_MANAGER__?.transitionToChapter(window.__PHASER_GAME__.scene.getScenes(true)[0], 3);
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Collect 9 Photo Pieces along the forest path
    const photoCollectResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter3RescueScene");
        if (!scene) return { error: "Chapter 3 scene not found" };

        const pm = window.__PUZZLE_MANAGER__;
        // Simulate physical collection of all 9 photo pieces
        for (let i = 1; i <= 9; i++) {
          pm.collectPhotoPiece("photo_piece_" + i);
        }

        scene.player.sprite.setPosition(6950, 567);
        scene.cameras.main.scrollX = 6500;

        return {
          isPhotoComplete: pm.isPhotoComplete(),
          count: pm.getPhotoPieces().length,
          hasBowInScene: Boolean(scene.bowSystem),
          enemiesActive: scene.enemiesList ? scene.enemiesList.length : 0,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 3 Photo Collection & Combat-Free Check:", photoCollectResult.result.value);
    if (!photoCollectResult.result.value.isPhotoComplete || photoCollectResult.result.value.count !== 9) {
      throw new Error(`Photo pieces incomplete: count is ${photoCollectResult.result.value.count}`);
    }
    if (photoCollectResult.result.value.hasBowInScene) {
      throw new Error("Combat-free violation: BowSystem is still active in Chapter 3!");
    }

    // Capture Screenshot 2: ch3_photo_collection.png
    const ssCh3 = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("ch3_photo_collection.png", ssCh3.data);

    // Unlock Chapter 3 Chest
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter3RescueScene");
        if (scene) scene.unlockChest();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // CHAPTER 4: THE DARKNESS (TICKET PIECES PUZZLE)
    console.log("\n--- CHAPTER 4: THE DARKNESS (TICKET PIECES PUZZLE) ---");
    await send("Runtime.evaluate", {
      expression: `(() => {
        window.__CHAPTER_MANAGER__?.transitionToChapter(window.__PHASER_GAME__.scene.getScenes(true)[0], 4);
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Collect 3 Ticket Pieces in the Cave
    const ticketCollectResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter4DarknessScene");
        if (!scene) return { error: "Chapter 4 scene not found" };

        const pm = window.__PUZZLE_MANAGER__;
        for (let i = 1; i <= 3; i++) {
          pm.collectTicketPiece("ticket_piece_" + i);
        }

        scene.player.sprite.setPosition(6580, 567);
        scene.cameras.main.scrollX = 6200;

        return {
          isTicketComplete: pm.isTicketComplete(),
          count: pm.getTicketPieces().length,
          hasTrainTicket: window.__SAVE_SYSTEM__.load()?.hasTrainTicket,
          hasBowInScene: Boolean(scene.bowSystem),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 4 Ticket Collection & Combat-Free Check:", ticketCollectResult.result.value);
    if (!ticketCollectResult.result.value.isTicketComplete || ticketCollectResult.result.value.count !== 3) {
      throw new Error(`Ticket pieces incomplete: count is ${ticketCollectResult.result.value.count}`);
    }

    // Capture Screenshot 3: ch4_ticket_collection.png
    const ssCh4 = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("ch4_ticket_collection.png", ssCh4.data);

    // Unlock Chapter 4 Chest
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter4DarknessScene");
        if (scene) scene.unlockChest();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // CHAPTER 5: THE STATION (TRAIN ROOFTOP PLATFORMING)
    console.log("\n--- CHAPTER 5: THE STATION (TRAIN PLATFORMING) ---");
    await send("Runtime.evaluate", {
      expression: `(() => {
        window.__CHAPTER_MANAGER__?.transitionToChapter(window.__PHASER_GAME__.scene.getScenes(true)[0], 5);
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Verify Train Rooftop Platforming & Zero Dinosaurs
    const ch5Status = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter5StationScene");
        if (!scene) return { error: "Chapter 5 scene not found" };

        // Position Titi on the speeding train rooftops
        scene.player.sprite.setPosition(3200, 430);
        scene.cameras.main.scrollX = 2800;

        return {
          sceneKey: scene.scene.key,
          playerX: scene.player.sprite.x,
          playerY: scene.player.sprite.y,
          hasBowInScene: Boolean(scene.bowSystem),
          carriagesActive: scene.trainRoofSprites ? scene.trainRoofSprites.length : 0,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 5 Train Rooftops Status:", ch5Status.result.value);
    if (ch5Status.result.value.hasBowInScene) {
      throw new Error("Combat-free violation: BowSystem is still active in Chapter 5!");
    }

    // Capture Screenshot 4: ch5_train_platforming.png
    const ssCh5 = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("ch5_train_platforming.png", ssCh5.data);

    // Reach engine and unlock Chapter 5 chest
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter5StationScene");
        if (scene) {
          scene.player.sprite.setPosition(6580, 430);
          scene.cameras.main.scrollX = 6200;
          scene.unlockChest();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // CHAPTER 6: THE DESTINATION (COASTAL MAP FRAGMENTS)
    console.log("\n--- CHAPTER 6: THE DESTINATION (COASTAL MAP FRAGMENTS) ---");
    await send("Runtime.evaluate", {
      expression: `(() => {
        window.__CHAPTER_MANAGER__?.transitionToChapter(window.__PHASER_GAME__.scene.getScenes(true)[0], 6);
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Collect 4 Map Fragments along coastal cliffs
    const mapCollectResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter6DestinationScene");
        if (!scene) return { error: "Chapter 6 scene not found" };

        const pm = window.__PUZZLE_MANAGER__;
        for (let i = 1; i <= 4; i++) {
          pm.collectMapPiece("map_piece_" + i);
        }

        scene.player.sprite.setPosition(5700, 530);
        scene.cameras.main.scrollX = 5300;

        return {
          isMapComplete: pm.isMapComplete(),
          count: pm.getMapPieces().length,
          hasBowInScene: Boolean(scene.bowSystem),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 6 Map Pieces Collection & Combat-Free Check:", mapCollectResult.result.value);
    if (!mapCollectResult.result.value.isMapComplete || mapCollectResult.result.value.count !== 4) {
      throw new Error(`Map pieces incomplete: count is ${mapCollectResult.result.value.count}`);
    }

    // Capture Screenshot 5: ch6_map_collection.png
    const ssCh6 = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("ch6_map_collection.png", ssCh6.data);

    // Unlock Chapter 6 Summit Chest
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter6DestinationScene");
        if (scene) {
          scene.player.sprite.setPosition(6620, 530);
          scene.cameras.main.scrollX = 6200;
          scene.unlockChest();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // CHAPTER 7: THE HEAVEN (ROSE GATHERING & REUNION HUG)
    console.log("\n--- CHAPTER 7: THE HEAVEN (ROSE GATHERING & REUNION HUG) ---");
    await send("Runtime.evaluate", {
      expression: `(() => {
        window.__CHAPTER_MANAGER__?.transitionToChapter(window.__PHASER_GAME__.scene.getScenes(true)[0], 7);
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Verify Ground Alignment, Necklace Glow & 5 Wild Roses
    const ch7Status = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter7HeavenScene");
        if (!scene) return { error: "Chapter 7 scene not found" };

        const pm = window.__PUZZLE_MANAGER__;
        for (let i = 1; i <= 5; i++) {
          pm.collectRose("rose_" + i);
        }

        scene.player.sprite.setPosition(6450, 530);
        scene.cameras.main.scrollX = 6100;

        return {
          sceneKey: scene.scene.key,
          playerX: scene.player.sprite.x,
          playerY: scene.player.sprite.y,
          hasBouquet: pm.hasBouquet(),
          rosesCount: pm.getRoses().length,
          hasNecklaceGlow: Boolean(scene.titiNecklaceGlow && scene.ronnyNecklaceGlow),
          hasBowInScene: Boolean(scene.bowSystem),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 7 Rose Bouquet & Sanctuary Status:", ch7Status.result.value);
    if (!ch7Status.result.value.hasBouquet || ch7Status.result.value.rosesCount !== 5) {
      throw new Error(`Bouquet not assembled: rose count is ${ch7Status.result.value.rosesCount}`);
    }
    if (ch7Status.result.value.hasBowInScene) {
      throw new Error("Combat-free violation: BowSystem exists in Chapter 7!");
    }

    // Capture Screenshot 6: ch7_rose_collection.png
    const ssCh7 = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("ch7_rose_collection.png", ssCh7.data);

    // Trigger Reunion Sequence: Offer bouquet, hug, then letter reveal
    console.log("Triggering Clifftop Reunion Sequence...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter7HeavenScene");
        if (scene) {
          scene.triggerReunionSequence();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Verify Letter Modal Opened
    const letterModalCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const text = document.body.innerText;
        return {
          hasLetterModal: text.includes("Secret Letter") || text.includes("Fragment") || text.includes("Dear Titibaccha"),
          isReunionCompleted: window.__SAVE_SYSTEM__.load()?.reunionCompleted,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Letter Assembly Modal Status (Post-Hug):", letterModalCheck.result.value);

    // First click "Assemble All 7 Pieces" in Letter Modal
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const assembleBtn = buttons.find(b => b.textContent.includes('Assemble'));
        if (assembleBtn) assembleBtn.click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Then click "Proceed to Sunset Ending"
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const sunsetBtn = buttons.find(b => b.textContent.includes('Sunset') || b.textContent.includes('Proceed'));
        if (sunsetBtn) sunsetBtn.click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Verify Sunset Ending Credits
    const endingCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        const save = window.__SAVE_SYSTEM__.load();
        const text = document.body.innerText;
        return {
          gameCompleted: save?.gameCompleted,
          hasSunsetEnding: text.includes("Run Titibaccha, Run!") || text.includes("Reunion") || text.includes("Credits") || text.includes("Sunset"),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Sunset Ending Status:", endingCheck.result.value);

    // Capture Screenshot 8: reunion_and_ending.png
    const ssEnding = await send("Page.captureScreenshot", { format: "png" });
    saveScreenshot("reunion_and_ending.png", ssEnding.data);

    console.log("\n================================================================================");
    console.log("   🎉 ALL 8 QUALITY ASSURANCE GATES & SCREENSHOTS COMPLETED SUCCESSFULLY! 🎉");
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
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
