import { spawn } from "child_process";
import { writeFileSync } from "fs";

async function run() {
  console.log("Starting Next.js production server for Polished Titi verification...");
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
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-polished",
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

    // Click "New Game"
    console.log("Starting game session...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newGameBtn = buttons.find(b => b.textContent.includes('New Game') || b.textContent.includes('Start'));
        if (newGameBtn) newGameBtn.click();
      })()`,
    });

    console.log("Waiting for game canvas to boot and load polished frames...");
    await new Promise((resolve) => setTimeout(resolve, 3500));

    // 1. Capture Polished IDLE Screenshot
    console.log("1. Capturing polished IDLE screenshot...");
    await new Promise((resolve) => setTimeout(resolve, 600));
    const idleShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_polished_idle.png",
      Buffer.from(idleShot.data, "base64")
    );
    console.log("Saved titi_polished_idle.png");

    // 2. Capture Polished RUNNING Screenshot
    console.log("2. Simulating running RIGHT (holding D)...");
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "d",
      code: "KeyD",
      windowsVirtualKeyCode: 68,
    });
    await new Promise((resolve) => setTimeout(resolve, 350));
    const runShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_polished_running.png",
      Buffer.from(runShot.data, "base64")
    );
    console.log("Saved titi_polished_running.png");

    // 3. Capture Polished JUMPING Screenshot (Rising arc - verify NO ground shadow!)
    console.log("3. Simulating JUMP (pressing W while running)...");
    await send("Input.dispatchKeyEvent", {
      type: "keyDown",
      key: "w",
      code: "KeyW",
      windowsVirtualKeyCode: 87,
    });
    await new Promise((resolve) => setTimeout(resolve, 130)); // peak rising phase
    const jumpShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_polished_jumping.png",
      Buffer.from(jumpShot.data, "base64")
    );
    console.log("Saved titi_polished_jumping.png");

    // 4. Capture Polished FALLING Screenshot (Descending arc - verify clean air under feet!)
    console.log("4. Waiting for FALLING descent phase...");
    await new Promise((resolve) => setTimeout(resolve, 380));
    const fallShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_polished_falling.png",
      Buffer.from(fallShot.data, "base64")
    );
    console.log("Saved titi_polished_falling.png");

    // Release jump & run keys
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

    await new Promise((resolve) => setTimeout(resolve, 800));

    // 5. Trigger HURT animation (simulate hazard contact or play anim directly)
    console.log("5. Testing and capturing HURT animation...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (!window.__PHASER_GAME__) return false;
        const scene = window.__PHASER_GAME__.scene.getScene("Chapter1GardenScene");
        if (!scene) return false;
        const playerSprite = scene.children.list.find(c => c.texture && c.texture.key.includes("frame_titibaccha"));
        if (playerSprite) {
          playerSprite.anims.play("titibaccha_hurt", true);
          return true;
        }
        return false;
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    const hurtShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_polished_hurt.png",
      Buffer.from(hurtShot.data, "base64")
    );
    console.log("Saved titi_polished_hurt.png");

    // 6. Test HAPPY animation (verify NO blue artifact!)
    console.log("6. Testing and capturing HAPPY animation (verifying clean left margin)...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        if (!window.__PHASER_GAME__) return false;
        const scene = window.__PHASER_GAME__.scene.getScene("Chapter1GardenScene");
        if (!scene) return false;
        const playerSprite = scene.children.list.find(c => c.texture && c.texture.key.includes("frame_titibaccha"));
        if (playerSprite) {
          playerSprite.anims.play("titibaccha_happy", true);
          return true;
        }
        return false;
      })()`,
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const happyShot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\titi_polished_happy.png",
      Buffer.from(happyShot.data, "base64")
    );
    console.log("Saved titi_polished_happy.png");

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
