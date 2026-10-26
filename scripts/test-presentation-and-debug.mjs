import { spawn } from "child_process";
import { writeFileSync } from "fs";

async function run() {
  console.log("Starting Next.js production server for Presentation & Debug Overlay verification...");
  const nextServer = spawn(
    "node",
    ["./node_modules/next/dist/bin/next", "start", "-p", "3000"],
    {
      cwd: "C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\run-titibaccha-run",
      stdio: "pipe",
    }
  );

  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log("Launching Headless Chrome on port 9222...");
  const chromeProcess = spawn(
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    [
      "--headless=new",
      "--remote-debugging-port=9222",
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-presentation",
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

    console.log("Navigating to http://localhost:3000...");
    await send("Page.navigate", { url: "http://localhost:3000" });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    console.log("Starting game session (Continue or New Game)...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const continueBtn = buttons.find(b => b.textContent.includes('Continue'));
        if (continueBtn && !continueBtn.disabled) {
          continueBtn.click();
        } else {
          const newGameBtn = buttons.find(b => b.textContent.includes('New Game') || b.textContent.includes('Start'));
          if (newGameBtn) newGameBtn.click();
        }
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Handle overwrite modal if active
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.includes('Reset') || b.textContent.includes('Start New'));
        if (confirmBtn) confirmBtn.click();
      })()`,
    });

    console.log("Waiting for Chapter 1 Garden scene to initialize...");
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Inspect scene state and position player at Ronny's clearing (x = 5820)
    console.log("Positioning camera and characters at Chapter 1 Campsite Clearing...");
    const sceneState = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (!scene || !scene.player) return { error: "Scene or player not found" };

        scene.player.sprite.setPosition(5820, 595);
        scene.player.sprite.setVelocity(0, 0);
        scene.cameras.main.scrollX = 5480;

        return {
          player: {
            x: scene.player.sprite.x,
            y: scene.player.sprite.y,
            scaleX: scene.player.sprite.scaleX,
            scaleY: scene.player.sprite.scaleY,
            width: scene.player.sprite.width,
            height: scene.player.sprite.height,
            anim: scene.player.sprite.anims.currentAnim?.key,
          },
          ronny: {
            x: scene.ronnySprite.x,
            y: scene.ronnySprite.y,
            scaleX: scene.ronnySprite.scaleX,
            scaleY: scene.ronnySprite.scaleY,
            width: scene.ronnySprite.width,
            height: scene.ronnySprite.height,
            anim: scene.ronnySprite.anims.currentAnim?.key,
          },
          fox: {
            x: scene.foxSprite.x,
            y: scene.foxSprite.y,
            scaleX: scene.foxSprite.scaleX,
            scaleY: scene.foxSprite.scaleY,
            width: scene.foxSprite.width,
            height: scene.foxSprite.height,
            anim: scene.foxSprite.anims.currentAnim?.key,
          },
          isDebugActive: scene.isDebugOverlayActive,
        };
      })()`,
      returnByValue: true,
    });

    console.log("Scene Character Inspection Results:", JSON.stringify(sceneState.result.value, null, 2));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // CAPTURE 1: Clean Presentation Screenshot (Titi, Ronny, and Fox with NO debug overlays)
    console.log("Capturing Clean Presentation Screenshot (ch1_presentation_clean.png)...");
    const shotClean = await send("Page.captureScreenshot", { format: "png" });
    const cleanPath = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch1_presentation_clean.png";
    writeFileSync(cleanPath, Buffer.from(shotClean.data, "base64"));
    console.log(`Saved: ${cleanPath}`);

    // TOGGLE DEBUG OVERLAY ON
    console.log("Toggling Developer Debug Overlay ON (F3 / ~)...");
    const toggleOnResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (!scene) return false;
        scene.toggleDebugOverlay();
        return scene.isDebugOverlayActive;
      })()`,
      returnByValue: true,
    });
    console.log("Debug Overlay Active Status:", toggleOnResult.result.value);

    // Let debug graphics draw
    await new Promise((resolve) => setTimeout(resolve, 800));

    // CAPTURE 2: Developer Debug Overlay Screenshot
    console.log("Capturing Developer Debug Overlay Screenshot (ch1_debug_overlay.png)...");
    const shotDebug = await send("Page.captureScreenshot", { format: "png" });
    const debugPath = "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch1_debug_overlay.png";
    writeFileSync(debugPath, Buffer.from(shotDebug.data, "base64"));
    console.log(`Saved: ${debugPath}`);

    // TOGGLE DEBUG OVERLAY OFF
    console.log("Toggling Developer Debug Overlay OFF...");
    const toggleOffResult = await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (!scene) return true;
        scene.toggleDebugOverlay();
        return scene.isDebugOverlayActive;
      })()`,
      returnByValue: true,
    });
    console.log("Debug Overlay Active Status:", toggleOffResult.result.value);

    // Check console errors
    console.log(`Total console logs: ${consoleLogs.length}`);
    const errors = consoleLogs.filter((l) => l.type === "error");
    console.log(`Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.error("Console error details:", JSON.stringify(errors, null, 2));
    }

    ws.close();
  } finally {
    chromeProcess.kill();
    nextServer.kill();
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
