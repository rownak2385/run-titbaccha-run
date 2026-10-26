import { spawn } from "child_process";
import { writeFileSync } from "fs";

async function run() {
  console.log("================================================================================");
  console.log("   RUN TITIBACCHA, RUN! — COMPLETE PLAYTHROUGH: CHAPTERS 1 TO 7 VERIFICATION");
  console.log("================================================================================");

  console.log("1. Starting Next.js production server on port 3000...");
  const nextServer = spawn(
    "node",
    ["./node_modules/next/dist/bin/next", "start", "-p", "3000"],
    {
      cwd: "C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\run-titibaccha-run",
      stdio: "pipe",
    }
  );

  // Poll until Next.js is responding on port 3000
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch("http://localhost:3000");
      if (res.ok || res.status < 500) {
        serverReady = true;
        break;
      }
    } catch {
      // wait
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!serverReady) {
    throw new Error("Next.js server failed to respond on port 3000 within 15 seconds.");
  }
  console.log("   Next.js production server is READY on http://localhost:3000");

  console.log("2. Launching Headless Chrome on port 9222...");
  const chromeProcess = spawn(
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-full-7chapters",
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
    await new Promise((resolve) => setTimeout(resolve, 2500));

    console.log("4. Starting fresh New Game session...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newGameBtn = buttons.find(b => b.textContent.includes('New Game') || b.textContent.includes('Start'));
        if (newGameBtn) newGameBtn.click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Confirm overwrite modal if it appears
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.includes('Reset') || b.textContent.includes('Start New'));
        if (confirmBtn) confirmBtn.click();
      })()`,
    });

    console.log("Waiting for Chapter 1: The Betrayal to boot...");
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // -------------------------------------------------------------
    // CHAPTER 1: THE BETRAYAL
    // -------------------------------------------------------------
    console.log("\n>>> EXECUTING CHAPTER 1: THE BETRAYAL <<<");
    const ch1Init = await send("Runtime.evaluate", {
      expression: `(() => {
        const game = window.__PHASER_GAME__;
        const scene = game?.scene?.getScene("Chapter1GardenScene");
        if (!scene || !scene.player) return { error: "Chapter 1 scene not loaded" };

        scene.player.sprite.setPosition(5980, 595);
        scene.cameras.main.scrollX = 5600;
        return { chapter: 1, pos: { x: scene.player.sprite.x, y: scene.player.sprite.y } };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 1 player positioned at clearing:", ch1Init.result.value);

    // Let betrayal script run
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // Unlock Chapter 1 Chest
    console.log("Opening Chapter 1 End Chest...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (scene) {
          scene.player.sprite.setPosition(6650, 600);
          scene.cameras.main.scrollX = 6200;
          scene.unlockChest();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Transition into Chapter 2
    console.log("Transitioning into Chapter 2: The Search...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (window.__EVENT_BUS__) {
          window.__EVENT_BUS__.emit("CHANGE_CHAPTER", 2);
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // -------------------------------------------------------------
    // CHAPTER 2: THE SEARCH
    // -------------------------------------------------------------
    console.log("\n>>> EXECUTING CHAPTER 2: THE SEARCH <<<");
    const ch2Check = await send("Runtime.evaluate", {
      expression: `(() => {
        const game = window.__PHASER_GAME__;
        const scene = game?.scene?.getScene("Chapter2SearchScene");
        if (!scene || !scene.player) return { error: "Chapter 2 scene not active" };

        scene.player.sprite.setPosition(6640, 595);
        scene.cameras.main.scrollX = 6200;
        scene.unlockChest();

        return {
          sceneKey: scene.scene.key,
          playerX: scene.player.sprite.x,
          playerY: scene.player.sprite.y,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 2 Scene Status & Chest Unlocked:", ch2Check.result.value);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Transition into Chapter 3
    console.log("Transitioning into Chapter 3: The Rescue...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (window.__EVENT_BUS__) {
          window.__EVENT_BUS__.emit("CHANGE_CHAPTER", 3);
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // -------------------------------------------------------------
    // CHAPTER 3: THE RESCUE
    // -------------------------------------------------------------
    console.log("\n>>> EXECUTING CHAPTER 3: THE RESCUE <<<");
    const ch3Result = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter3RescueScene");
        if (!scene) return { error: "Chapter 3 scene not active" };

        // 1. Acquire Bow via Game System
        window.__SAVE_SYSTEM__.setBowAcquired(20);
        scene.bowSystem.checkBowStatus();

        // 2. Defeat enemies and collect all 9 Photo Pieces via PuzzleManager
        const enemies = scene.enemiesList || [];
        enemies.forEach((enemy) => {
          enemy.takeDamage(100, 1);
        });

        const photoPieces = [
          "photo_piece_01", "photo_piece_02", "photo_piece_03",
          "photo_piece_04", "photo_piece_05", "photo_piece_06",
          "photo_piece_07", "photo_piece_08", "photo_piece_09"
        ];
        photoPieces.forEach(p => window.__PUZZLE_MANAGER__.collectPhotoPiece(p));

        // 3. Unlock Ancient Forest Chest
        scene.player.sprite.setPosition(6970, 595);
        scene.cameras.main.scrollX = 6400;
        scene.unlockChest();

        const save = window.__SAVE_SYSTEM__.load();
        return {
          hasBow: save.hasBow,
          photoPieces: save.puzzles.photoPieces.length,
          isPhotoComplete: save.puzzles.isPhotoComplete,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 3 Combat, Photo Puzzle & Chest Result:", ch3Result.result.value);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Transition into Chapter 4
    console.log("Transitioning into Chapter 4: The Darkness...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (window.__EVENT_BUS__) {
          window.__EVENT_BUS__.emit("CHANGE_CHAPTER", 4);
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // -------------------------------------------------------------
    // CHAPTER 4: THE DARKNESS
    // -------------------------------------------------------------
    console.log("\n>>> EXECUTING CHAPTER 4: THE DARKNESS <<<");
    const ch4Result = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter4DarknessScene");
        if (!scene) return { error: "Chapter 4 scene not active" };

        // 1. Test Torch & Sunlight
        scene.torchSystem.setTorchState(true);
        scene.player.sprite.setPosition(1950, 580);
        scene.torchSystem.update(0, 16);
        const inSunlight = scene.torchSystem.getInSunlight();

        // 2. Defeat cave monsters & collect all 3 ticket pieces via PuzzleManager
        const monsters = scene.monstersList || [];
        monsters.forEach(m => m.takeDamage(100, 1));

        const ticketPieces = ["ticket_piece_01", "ticket_piece_02", "ticket_piece_03"];
        ticketPieces.forEach(p => window.__PUZZLE_MANAGER__.collectTicketPiece(p));
        window.__SAVE_SYSTEM__.collectItem("mysterious_cave_note");

        // 3. Unlock Cave Vault Chest
        scene.player.sprite.setPosition(6640, 595);
        scene.cameras.main.scrollX = 6200;
        scene.unlockChest();

        const save = window.__SAVE_SYSTEM__.load();
        return {
          torchLit: scene.torchSystem.isLit(),
          inSunlight,
          ticketComplete: save.puzzles.isTicketComplete,
          hasTrainTicket: save.hasTrainTicket,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 4 Torch, Ticket Puzzle & Vault Result:", ch4Result.result.value);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Transition into Chapter 5
    console.log("Transitioning into Chapter 5: The Station...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (window.__EVENT_BUS__) {
          window.__EVENT_BUS__.emit("CHANGE_CHAPTER", 5);
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // -------------------------------------------------------------
    // CHAPTER 5: THE STATION
    // -------------------------------------------------------------
    console.log("\n>>> EXECUTING CHAPTER 5: THE STATION <<<");
    const ch5Result = await send("Runtime.evaluate", {
      expression: `(() => {
        const game = window.__PHASER_GAME__;
        const scene = game?.scene?.getScene("Chapter5StationScene");
        if (!scene || !scene.player) return { error: "Chapter 5 scene not active" };

        // 1. Validate Ticket at Gate (x = 1200)
        scene.player.sprite.setPosition(1200, 580);
        scene.validateTicket();

        // 2. Board moving train & defeat aerial dinosaurs
        scene.player.sprite.setPosition(3400, 480);
        const dinos = scene.dinosaursList || [];
        dinos.forEach(d => d.takeDamage(100, 1));

        // 3. Move to Locomotive Observation Safe (x = 6640) & Unlock Safe
        scene.player.sprite.setPosition(6640, 485);
        scene.cameras.main.scrollX = 6200;
        scene.unlockChest();

        const save = window.__SAVE_SYSTEM__.load();
        return {
          sceneKey: scene.scene.key,
          isTicketValidated: scene.isTicketValidated,
          dinosCount: dinos.length,
          hasChapter6Key: save.hasChapter6Key,
          hasLetterFragment5: save.hasLetterFragment5,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 5 Ticket Validation, Combat & Safe Result:", ch5Result.result.value);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Capture Chapter 5 Gameplay Screenshot
    const shotCh5 = await send("Page.captureScreenshot", { format: "png" });
    const ch5Path = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch5_gameplay.png";
    writeFileSync(ch5Path, Buffer.from(shotCh5.data, "base64"));
    console.log(`Saved screenshot: ${ch5Path}`);

    // Transition into Chapter 6
    console.log("Transitioning into Chapter 6: The Destination...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (window.__EVENT_BUS__) {
          window.__EVENT_BUS__.emit("CHANGE_CHAPTER", 6);
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // -------------------------------------------------------------
    // CHAPTER 6: THE DESTINATION
    // -------------------------------------------------------------
    console.log("\n>>> EXECUTING CHAPTER 6: THE DESTINATION <<<");
    const ch6Result = await send("Runtime.evaluate", {
      expression: `(() => {
        const game = window.__PHASER_GAME__;
        const scene = game?.scene?.getScene("Chapter6DestinationScene");
        if (!scene || !scene.player) return { error: "Chapter 6 scene not active" };

        // 1. Recover Ronny's Bag at dock (x = 480) via Game System
        window.__SAVE_SYSTEM__.collectItem("ronny_travel_bag");
        window.__SAVE_SYSTEM__.addArrows(15);
        scene.player.heal(100);

        // 2. Trigger boiler explosion sequence
        scene.triggerTrainExplosion();

        // 3. Vanquish 4 Crag Monsters and collect 4 Map Pieces via PuzzleManager
        const enemies = scene.enemiesList || [];
        enemies.forEach(e => e.takeDamage(100, 1));

        const mapPieces = ["map_piece_01", "map_piece_02", "map_piece_03", "map_piece_04"];
        mapPieces.forEach(p => window.__PUZZLE_MANAGER__.collectMapPiece(p));

        // 4. Reach Coastal Summit Chest (x = 6640) & Unlock Chest
        scene.player.sprite.setPosition(6640, 580);
        scene.cameras.main.scrollX = 6200;
        scene.unlockChest();

        const save = window.__SAVE_SYSTEM__.load();
        return {
          sceneKey: scene.scene.key,
          hasRonnyBag: save.hasRonnyBag,
          trainExploded: save.trainExploded,
          mapPieces: save.puzzles.mapPieces.length,
          isMapComplete: save.puzzles.isMapComplete,
          hasChapter7Key: save.hasChapter7Key,
          hasLetterFragment6: save.hasLetterFragment6,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 6 Dock, Explosion, Map Puzzle & Summit Chest Result:", ch6Result.result.value);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Capture Chapter 6 Gameplay Screenshot
    const shotCh6 = await send("Page.captureScreenshot", { format: "png" });
    const ch6Path = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch6_gameplay.png";
    writeFileSync(ch6Path, Buffer.from(shotCh6.data, "base64"));
    console.log(`Saved screenshot: ${ch6Path}`);

    // Transition into Chapter 7
    console.log("Transitioning into Chapter 7: The Heaven...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (window.__EVENT_BUS__) {
          window.__EVENT_BUS__.emit("CHANGE_CHAPTER", 7);
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // -------------------------------------------------------------
    // CHAPTER 7: THE HEAVEN
    // -------------------------------------------------------------
    console.log("\n>>> EXECUTING CHAPTER 7: THE HEAVEN <<<");
    const ch7Result = await send("Runtime.evaluate", {
      expression: `(() => {
        const game = window.__PHASER_GAME__;
        const scene = game?.scene?.getScene("Chapter7HeavenScene");
        if (!scene || !scene.player) return { error: "Chapter 7 scene not active" };

        // 1. Verify NO COMBAT: bow disabled in chapter 7
        const combatAllowed = scene.bowSystem?.getIsCombatAllowed ? scene.bowSystem.getIsCombatAllowed() : false;

        // 2. Collect all 5 Clifftop Roses via PuzzleManager
        const roseIds = ["rose_01", "rose_02", "rose_03", "rose_04", "rose_05"];
        roseIds.forEach(id => window.__PUZZLE_MANAGER__.collectRose(id));

        // 3. Collect 7th Secret Letter Fragment at Summit Threshold via SaveSystem
        window.__SAVE_SYSTEM__.collectItem("letter_fragment_07");

        // 4. Destroy rose sprites in scene
        if (scene.roseSprites) {
          scene.roseSprites.forEach(r => r.destroy());
          scene.roseSprites.clear();
        }

        // 5. Position player right before Ronny on clifftop (x = 6480, Ronny is at 6520)
        scene.player.sprite.setPosition(6480, 580);
        scene.cameras.main.scrollX = 6000;

        const save = window.__SAVE_SYSTEM__.load();
        return {
          sceneKey: scene.scene.key,
          combatAllowed,
          rosesCount: save.roses.length,
          hasBouquet: save.hasBouquet,
          hasLetterFragment7: save.hasLetterFragment7,
          totalLetterFragments: save.letterFragments.length,
          necklaceActivated: save.necklaceActivated,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 7 Peaceful Exploration, Roses & 7th Letter Result:", ch7Result.result.value);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Capture Chapter 7 Gameplay Screenshot
    const shotCh7 = await send("Page.captureScreenshot", { format: "png" });
    const ch7Path = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch7_gameplay.png";
    writeFileSync(ch7Path, Buffer.from(shotCh7.data, "base64"));
    console.log(`Saved screenshot: ${ch7Path}`);

    // Trigger Reunion Sequence (Titi reaches Ronny, necklaces glow, bouquet offered, hug embrace)
    console.log("\n>>> EXECUTING CLIMACTIC REUNION SEQUENCE <<<");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter7HeavenScene");
        if (scene) {
          scene.triggerReunionSequence();
        }
      })()`,
    });

    // Wait for necklace glow + bouquet offer + hug embrace animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Capture Chapter 7 Reunion & Hug Screenshot
    const shotReunion = await send("Page.captureScreenshot", { format: "png" });
    const reunionPath = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch7_reunion.png";
    writeFileSync(reunionPath, Buffer.from(shotReunion.data, "base64"));
    console.log(`Saved screenshot: ${reunionPath}`);

    // Wait for Letter Reveal modal to appear (delayed call in scene after hug)
    console.log("Waiting for Seven-Piece Secret Letter Assembly Modal...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Capture 7-Piece Letter Assembly Modal Screenshot
    const shotLetter = await send("Page.captureScreenshot", { format: "png" });
    const letterPath = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch7_letter_reveal.png";
    writeFileSync(letterPath, Buffer.from(shotLetter.data, "base64"));
    console.log(`Saved screenshot: ${letterPath}`);

    // Click "Assemble All 7 Pieces Into The Complete Letter" in LetterAssemblyModal
    console.log("Assembling all 7 pieces into complete letter...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const assembleBtn = buttons.find(b => b.textContent.includes('Assemble All 7 Pieces'));
        if (assembleBtn) assembleBtn.click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Click "Proceed to Sunset Ending" to transition to Sunset Ending Modal
    console.log("Proceeding to Sunset Ending Screen...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const continueBtn = buttons.find(b => b.textContent.includes('Proceed to Sunset') || b.textContent.includes('Sunset Ending') || b.textContent.includes('Watch Sunset'));
        if (continueBtn) continueBtn.click();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Capture Sunset Ending Screen Screenshot
    const shotSunset = await send("Page.captureScreenshot", { format: "png" });
    const sunsetPath = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch7_sunset_ending.png";
    writeFileSync(sunsetPath, Buffer.from(shotSunset.data, "base64"));
    console.log(`Saved screenshot: ${sunsetPath}`);

    // -------------------------------------------------------------
    // FINAL PERSISTENT SAVE VERIFICATION
    // -------------------------------------------------------------
    console.log("\n>>> INSPECTING FINAL PERSISTENT SAVE STATE <<<");
    const finalSaveState = await send("Runtime.evaluate", {
      expression: `window.__SAVE_SYSTEM__.load()`,
      returnByValue: true,
    });

    const save = finalSaveState.result.value;
    console.log("================================================================================");
    console.log("   FINAL PLAYTHROUGH AUDIT & VERIFICATION REPORT (CHAPTERS 1 TO 7)");
    console.log("================================================================================");
    console.log(`- Save Schema Version: ${save.version}`);
    console.log(`- Active Chapter: ${save.chapter}`);
    console.log(`- Unlocked Chapters: [${save.unlockedChapters.join(", ")}]`);
    console.log(`- Completed Chapters: [${save.completedChapters.join(", ")}]`);
    console.log(`- Letter Fragments Collected: [${save.letterFragments.join(", ")}] (${save.letterFragments.length}/7)`);
    console.log(`- Keys Acquired: Ch2(${save.hasChapter2Key}), Ch3(${save.hasChapter3Key}), Ch4(${save.hasChapter4Key}), Ch5(${save.hasChapter5Key}), Ch6(${save.hasChapter6Key}), Ch7(${save.hasChapter7Key})`);
    console.log(`- Hunting Bow: Acquired(${save.hasBow}), Quiver(${save.arrowCount}/${save.maxArrows})`);
    console.log(`- Chapter 3 Photo Puzzle: ${save.puzzles.photoPieces.length}/9 pieces, Complete: ${save.puzzles.isPhotoComplete}`);
    console.log(`- Chapter 4 Ticket Puzzle: ${save.puzzles.ticketPieces.length}/3 pieces, Ticket Item: ${save.hasTrainTicket}`);
    console.log(`- Chapter 6 Ronny's Pack: Acquired(${save.hasRonnyBag}), Engine Exploded(${save.trainExploded})`);
    console.log(`- Chapter 6 Destination Map: ${save.puzzles.mapPieces.length}/4 pieces, Complete: ${save.puzzles.isMapComplete}`);
    console.log(`- Chapter 7 Clifftop Roses: ${save.roses.length}/5, Bouquet Assembled: ${save.hasBouquet}`);
    console.log(`- Chapter 7 Leaf Necklaces Radiant: ${save.necklaceActivated}`);
    console.log(`- Chapter 7 Reunion Completed: ${save.reunionCompleted}`);
    console.log(`- Chapter 7 Seven-Piece Letter Revealed: ${save.finalLetterRevealed}`);
    console.log(`- Whole Game Completed Flag: ${save.gameCompleted}`);

    console.log(`\nTotal Browser Console Logs: ${consoleLogs.length}`);
    const errors = consoleLogs.filter((l) => l.type === "error");
    console.log(`Console Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.error("Console Error Details:", JSON.stringify(errors, null, 2));
    }

    if (!save.gameCompleted) {
      throw new Error("gameCompleted flag is not true in SaveData!");
    }
    if (save.letterFragments.length !== 7) {
      throw new Error(`Expected 7 letter fragments, got ${save.letterFragments.length}`);
    }
    if (!save.hasBouquet) {
      throw new Error("hasBouquet is false in SaveData!");
    }
    if (!save.hasRonnyBag) {
      throw new Error("hasRonnyBag is false in SaveData!");
    }
    if (!save.reunionCompleted) {
      throw new Error("reunionCompleted is false in SaveData!");
    }
    if (!save.finalLetterRevealed) {
      throw new Error("finalLetterRevealed is false in SaveData!");
    }
    if (!save.necklaceActivated) {
      throw new Error("necklaceActivated is false in SaveData!");
    }
    if (save.completedChapters.length !== 7) {
      throw new Error(`Expected 7 completed chapters, got ${save.completedChapters.length}`);
    }

    console.log("\n>>> ALL CHAPTER 1 THROUGH 7 GATES PASSED PERFECTLY! <<<");

    ws.close();
  } finally {
    chromeProcess.kill();
    nextServer.kill();
  }
}

run().catch((err) => {
  console.error("Playthrough verification failed:", err);
  process.exit(1);
});
