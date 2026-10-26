import { spawn } from "child_process";
import { writeFileSync } from "fs";

async function run() {
  console.log("Starting Next.js production server for Titi prototype verification...");
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
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-titi",
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

    // Click "New Game" or "Continue"
    console.log("Clicking New Game button...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newGameBtn = buttons.find(b => b.textContent.includes('New Game') || b.textContent.includes('Start'));
        if (newGameBtn) newGameBtn.click();
      })()`,
    });

    console.log("Waiting for Phaser canvas to boot and load prototype frames...");
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // Verify which texture and animation are active
    const animCheck = await send("Runtime.evaluate", {
      expression: `(() => {
        if (!window.__PHASER_GAME__) return { ok: false, reason: "no __PHASER_GAME__" };
        const scene = window.__PHASER_GAME__.scene.getScene("Chapter1GardenScene");
        if (!scene) return { ok: false, reason: "no Chapter1GardenScene" };
        const playerSprite = scene.children.list.find(c => c.texture && (c.texture.key.includes("titibaccha") || c.texture.key.includes("frame_titibaccha")));
        return {
          ok: true,
          textureKey: playerSprite ? playerSprite.texture.key : "none",
          currentAnim: playerSprite && playerSprite.anims ? playerSprite.anims.currentAnim?.key : "none",
          currentFrame: playerSprite && playerSprite.anims ? playerSprite.anims.currentFrame?.textureKey : "none",
          x: playerSprite ? Math.round(playerSprite.x) : 0,
          y: playerSprite ? Math.round(playerSprite.y) : 0,
          bodyWidth: playerSprite && playerSprite.body ? playerSprite.body.width : 0,
          bodyHeight: playerSprite && playerSprite.body ? playerSprite.body.height : 0,
        };
      })()`,
      returnByValue: true,
    });
    console.log("Player Sprite Status:", JSON.stringify(animCheck.result.value));

    // 1. Capture IDLE Screenshot
    console.log("1. Capturing Titi standing IDLE screenshot...");
    await new Promise((resolve) => setTimeout(resolve, 800));
    const idleShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_standing_idle.png",
      Buffer.from(idleShot.data, "base64")
    );
    console.log("Saved titi_standing_idle.png");

    // 2. Capture RUNNING Screenshot
    console.log("2. Simulating running RIGHT (holding D)...");
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "d",
      code: "KeyD",
      windowsVirtualKeyCode: 68,
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
    const runShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_running.png",
      Buffer.from(runShot.data, "base64")
    );
    console.log("Saved titi_running.png");

    // 3. Capture JUMPING Screenshot (Rising arc: vy < 0)
    console.log("3. Simulating JUMP (pressing W while running)...");
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "w",
      code: "KeyW",
      windowsVirtualKeyCode: 87,
    });
    await new Promise((resolve) => setTimeout(resolve, 140)); // rising phase
    const jumpShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_jumping.png",
      Buffer.from(jumpShot.data, "base64")
    );
    console.log("Saved titi_jumping.png");

    // 4. Capture FALLING Screenshot (Descending arc: vy > 0)
    console.log("4. Waiting for apex transition to FALLING phase...");
    await new Promise((resolve) => setTimeout(resolve, 380)); // falling phase
    const fallShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_falling.png",
      Buffer.from(fallShot.data, "base64")
    );
    console.log("Saved titi_falling.png");

    // Release all keys
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "w",
      code: "KeyW",
      windowsVirtualKeyCode: 87,
    });
    await send("Input.dispatchKeyEvent", {
      type: "keyUp",
      key: "d",
      code: "KeyD",
      windowsVirtualKeyCode: 68,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Console errors report
    console.log("Total console logs captured:", consoleLogs.length);
    const errors = consoleLogs.filter((l) => l.type === "error");
    console.log("Console errors found:", errors.length);
    if (errors.length > 0) {
      console.log("Errors:", JSON.stringify(errors));
    }

    ws.close();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    try {
      chromeProcess.kill();
      nextServer.kill();
    } catch {
      // ignore
    }
  }
}

run();
