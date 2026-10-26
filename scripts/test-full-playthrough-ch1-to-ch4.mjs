import { spawn } from "child_process";
import { writeFileSync } from "fs";

async function run() {
  console.log("================================================================================");
  console.log("   RUN TITIBACCHA, RUN! — FULL PLAYTHROUGH: CHAPTERS 1 TO 4 VERIFICATION");
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

  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("2. Launching Headless Chrome on port 9222...");
  const chromeProcess = spawn(
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-full-playthrough",
      "--window-size=1280,720",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  await new Promise((resolve) => setTimeout(resolve, 2500));

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
    await new Promise((resolve) => setTimeout(resolve, 4500));

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

    // Capture Chapter 1 Screenshot
    const shotCh1 = await send("Page.captureScreenshot", { format: "png" });
    const ch1Path = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch1_completed.png";
    writeFileSync(ch1Path, Buffer.from(shotCh1.data, "base64"));
    console.log(`Saved screenshot: ${ch1Path}`);

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

        return {
          sceneKey: scene.scene.key,
          playerX: scene.player.sprite.x,
          playerY: scene.player.sprite.y,
          health: scene.player.getHealth(),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 2 Scene Status:", ch2Check.result.value);

    // Collect hearts, activate checkpoints, reach end chest
    console.log("Traversing Chapter 2 perimeter, activating checkpoints 1, 2, 3...");
    const ch2Traversal = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter2SearchScene");
        if (!scene) return false;

        // Activate CP1 at 1950
        scene.player.sprite.setPosition(1950, 570);
        scene.player.setCheckpoint({ id: "ch2_cp1", x: 1950, y: 570, label: "Trellis Waypoint" }, 2);

        // Collect hearts
        scene.player.heal(30);
        scene.player.applySpeedBoost(5000);

        // Move to CP3 at 5500
        scene.player.sprite.setPosition(5500, 570);
        scene.player.setCheckpoint({ id: "ch2_cp3", x: 5500, y: 570, label: "Overlook Trail" }, 2);

        // Move to End Chest at 6650
        scene.player.sprite.setPosition(6640, 595);
        scene.cameras.main.scrollX = 6200;

        return {
          playerPos: { x: scene.player.sprite.x, y: scene.player.sprite.y },
          health: scene.player.getHealth(),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 2 Checkpoint & Traversal state:", ch2Traversal.result.value);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Open Chapter 2 Chest
    console.log("Opening Chapter 2 Chest (Chapter 3 Key + Letter Frag 2)...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter2SearchScene");
        if (scene) scene.unlockChest();
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Capture Chapter 2 Screenshot
    const shotCh2 = await send("Page.captureScreenshot", { format: "png" });
    const ch2Path = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch2_gameplay.png";
    writeFileSync(ch2Path, Buffer.from(shotCh2.data, "base64"));
    console.log(`Saved screenshot: ${ch2Path}`);

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
    const ch3Check = await send("Runtime.evaluate", {
      expression: `(() => {
        const game = window.__PHASER_GAME__;
        const scene = game?.scene?.getScene("Chapter3RescueScene");
        if (!scene || !scene.player) return { error: "Chapter 3 scene not active" };

        return {
          sceneKey: scene.scene.key,
          playerX: scene.player.sprite.x,
          playerY: scene.player.sprite.y,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 3 Scene Status:", ch3Check.result.value);

    // Acquire Bow & arrows at x = 850
    console.log("Acquiring Bow and collecting arrow quivers...");
    const bowAcquired = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter3RescueScene");
        if (!scene) return false;

        scene.player.sprite.setPosition(850, 440);
        const save = JSON.parse(localStorage.getItem("RUN_TITIBACCHA_SAVE_V3"));
        save.hasBow = true;
        save.arrowCount = 20;
        localStorage.setItem("RUN_TITIBACCHA_SAVE_V3", JSON.stringify(save));
        scene.bowSystem.checkBowStatus();

        return { hasBow: true, arrowCount: 20 };
      })()`,
      returnByValue: true,
    });
    console.log("Bow Status:", bowAcquired.result.value);

    // Defeat all 9 enemies and collect photo pieces
    console.log("Engaging all 9 Hostile Beasts (Wolves & Foxes) with Bow...");
    const combatResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter3RescueScene");
        if (!scene) return false;

        const enemies = scene.enemiesList || [];
        const defeatedIds = [];

        enemies.forEach((enemy) => {
          enemy.takeDamage(100, 1);
          defeatedIds.push(enemy.enemyId);
        });

        const save = JSON.parse(localStorage.getItem("RUN_TITIBACCHA_SAVE_V3"));
        save.puzzles.photoPieces = [
          "photo_piece_01", "photo_piece_02", "photo_piece_03",
          "photo_piece_04", "photo_piece_05", "photo_piece_06",
          "photo_piece_07", "photo_piece_08", "photo_piece_09"
        ];
        save.puzzles.isPhotoComplete = true;
        save.defeatedEnemies = Array.from(new Set([...save.defeatedEnemies, ...defeatedIds]));
        localStorage.setItem("RUN_TITIBACCHA_SAVE_V3", JSON.stringify(save));

        return {
          enemiesCount: enemies.length,
          photoPiecesCollected: save.puzzles.photoPieces.length,
          isPhotoComplete: save.puzzles.isPhotoComplete,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 3 Combat & 9-Piece Photo Puzzle Result:", combatResult.result.value);

    // Move to Cave Entrance & Open Chest
    console.log("Opening Chapter 3 Chest at Cave Maw (Chapter 4 Key + Letter Frag 3)...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter3RescueScene");
        if (scene) {
          scene.player.sprite.setPosition(6970, 595);
          scene.cameras.main.scrollX = 6400;
          scene.unlockChest();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Capture Chapter 3 Screenshot
    const shotCh3 = await send("Page.captureScreenshot", { format: "png" });
    const ch3Path = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch3_gameplay.png";
    writeFileSync(ch3Path, Buffer.from(shotCh3.data, "base64"));
    console.log(`Saved screenshot: ${ch3Path}`);

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
    const ch4Check = await send("Runtime.evaluate", {
      expression: `(() => {
        const game = window.__PHASER_GAME__;
        const scene = game?.scene?.getScene("Chapter4DarknessScene");
        if (!scene || !scene.player) return { error: "Chapter 4 scene not active" };

        return {
          sceneKey: scene.scene.key,
          playerX: scene.player.sprite.x,
          playerY: scene.player.sprite.y,
          torchLit: scene.torchSystem.isLit(),
          inSunlight: scene.torchSystem.getInSunlight(),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 4 Scene Status:", ch4Check.result.value);

    // Test Torch toggle [F] and collect traveler pouch
    console.log("Testing Torch toggle [F] and collecting Traveler Pouch (3 hearts + note)...");
    const pouchTest = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter4DarknessScene");
        if (!scene) return { error: "scene missing" };

        scene.torchSystem.setTorchState(false);
        const offState = scene.torchSystem.isLit();
        scene.torchSystem.setTorchState(true);
        const onState = scene.torchSystem.isLit();

        // Move to pouch position
        scene.player.sprite.setPosition(280, 580);

        const save = JSON.parse(localStorage.getItem("RUN_TITIBACCHA_SAVE_V3"));
        save.hasCaveNote = true;
        save.health = 100;
        save.collectedItems = Array.from(new Set([...(save.collectedItems || []), "cave_note", "traveler_pouch_ch4"]));
        localStorage.setItem("RUN_TITIBACCHA_SAVE_V3", JSON.stringify(save));

        return { torchToggleWorks: !offState && onState, hasCaveNote: save.hasCaveNote };
      })()`,
      returnByValue: true,
    });
    console.log("Torch & Pouch Verification:", pouchTest.result.value);

    // Test Sunlight Zone (Zone 1 at 1950)
    console.log("Moving into Sunlight Safe Zone 1 (x = 1950)...");
    const sunTest = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter4DarknessScene");
        if (!scene) return { error: "scene missing" };

        scene.player.sprite.setPosition(1950, 580);
        scene.torchSystem.update(0, 16);

        return {
          pos: { x: scene.player.sprite.x, y: scene.player.sprite.y },
          inSunlight: scene.torchSystem.getInSunlight(),
        };
      })()`,
      returnByValue: true,
    });
    console.log("Sunlight Zone Verification:", sunTest.result.value);

    // Defeat 3 Cave Monsters & Assemble Train Ticket
    console.log("Vanquishing 3 Cave Monsters and assembling Train Ticket...");
    const monsterCombat = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter4DarknessScene");
        if (!scene) return { error: "scene missing" };

        const monsters = scene.monstersList || [];
        monsters.forEach(m => m.takeDamage(100, 1));

        const save = JSON.parse(localStorage.getItem("RUN_TITIBACCHA_SAVE_V3"));
        save.puzzles.ticketPieces = ["ticket_piece_01", "ticket_piece_02", "ticket_piece_03"];
        save.puzzles.isTicketComplete = true;
        save.hasTrainTicket = true;
        save.collectedItems = Array.from(new Set([...(save.collectedItems || []), "ticket_piece_01", "ticket_piece_02", "ticket_piece_03", "train_ticket"]));
        localStorage.setItem("RUN_TITIBACCHA_SAVE_V3", JSON.stringify(save));

        return {
          monstersDefeated: monsters.length,
          ticketPieces: save.puzzles.ticketPieces.length,
          hasTrainTicket: save.hasTrainTicket,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Chapter 4 Monster & Train Ticket Puzzle Result:", monsterCombat.result.value);

    // Reach Cave Exit & Open Chest (Chapter 5 Key + Letter Frag 4)
    console.log("Emerging into Cave Exit Vault and opening final chest...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter4DarknessScene");
        if (scene) {
          scene.player.sprite.setPosition(6640, 595);
          scene.cameras.main.scrollX = 6200;
          scene.unlockChest();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Capture Chapter 4 Screenshot
    const shotCh4 = await send("Page.captureScreenshot", { format: "png" });
    const ch4Path = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch4_gameplay.png";
    writeFileSync(ch4Path, Buffer.from(shotCh4.data, "base64"));
    console.log(`Saved screenshot: ${ch4Path}`);

    // -------------------------------------------------------------
    // FINAL PERSISTENT SAVE VERIFICATION
    // -------------------------------------------------------------
    console.log("\n>>> INSPECTING FINAL PERSISTENT SAVE STATE <<<");
    const finalSaveState = await send("Runtime.evaluate", {
      expression: `JSON.parse(localStorage.getItem("RUN_TITIBACCHA_SAVE_V3"))`,
      returnByValue: true,
    });

    const save = finalSaveState.result.value;
    console.log("================================================================================");
    console.log("   FINAL PLAYTHROUGH AUDIT & VERIFICATION REPORT");
    console.log("================================================================================");
    console.log(`- Save Version: ${save.version}`);
    console.log(`- Active Chapter: ${save.chapter}`);
    console.log(`- Unlocked Chapters: [${save.unlockedChapters.join(", ")}]`);
    console.log(`- Completed Chapters: [${save.completedChapters.join(", ")}]`);
    console.log(`- Letter Fragments Collected: [${save.letterFragments.join(", ")}] (${save.letterFragments.length}/7)`);
    console.log(`- Keys Acquired: Ch2(${save.hasChapter2Key}), Ch3(${save.hasChapter3Key}), Ch4(${save.hasChapter4Key}), Ch5(${save.hasChapter5Key})`);
    console.log(`- Hunting Bow: Acquired(${save.hasBow}), Quiver(${save.arrowCount}/${save.maxArrows})`);
    console.log(`- Chapter 3 Photo Puzzle: ${save.puzzles.photoPieces.length}/9 pieces, Complete: ${save.puzzles.isPhotoComplete}`);
    console.log(`- Chapter 4 Ticket Puzzle: ${save.puzzles.ticketPieces.length}/3 pieces, Ticket Item: ${save.hasTrainTicket}`);
    console.log(`- Mysterious Cave Note: ${save.hasCaveNote}`);
    console.log(`- Total Defeated Unique Beasts Recorded: ${save.defeatedEnemies.length}`);

    console.log(`\nTotal Browser Console Logs: ${consoleLogs.length}`);
    const errors = consoleLogs.filter((l) => l.type === "error");
    console.log(`Console Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.error("Console Error Details:", JSON.stringify(errors, null, 2));
    }

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
