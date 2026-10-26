import { spawn } from "child_process";
import { writeFileSync } from "fs";

async function run() {
  console.log("Starting Next.js production server for Ronny & Fox verification...");
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
      "--user-data-dir=C:\\Users\\nightfury\\.gemini\\antigravity\\scratch\\chrome-cdp-profile-ronny-fox",
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

    // Click "New Game" or "Continue" and confirm overwrite if prompted
    console.log("Starting game session...");
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
    // In case the overwrite modal appeared:
    await send("Runtime.evaluate", {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent.includes('Reset') || b.textContent.includes('Start New'));
        if (confirmBtn) confirmBtn.click();
      })()`,
    });

    console.log("Waiting for game canvas to boot Chapter 1 Garden...");
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // 1. Teleport player near Ronny's campsite (x = 5850) BEFORE triggering the betrayal script
    console.log("Teleporting player near Ronny campsite (x = 5850) to observe Ronny Waiting...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (scene && scene.player) {
          scene.player.sprite.setPosition(5850, 595);
          scene.player.sprite.setVelocity(0, 0);
          scene.cameras.main.scrollX = 5500;
        }
      })()`,
    });

    // Let camera settle and observe Ronny waiting with bowl of feed
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // CAPTURE SCREENSHOT 1: Ronny Waiting with Food
    console.log("1. Capturing Screenshot: Ronny Waiting with Food...");
    const shot1 = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch1_ronny_waiting_food.png",
      Buffer.from(shot1.data, "base64")
    );
    console.log("Saved ch1_ronny_waiting_food.png");

    // 2. Walk Titi forward to x = 5980 to trigger the Betrayal Encounter!
    console.log("2. Moving Titi forward past x = 5950 to trigger Fox Betrayal Encounter...");
    await send("Runtime.evaluate", {
      expression: `(() => {
        const scene = window.__PHASER_GAME__?.scene?.getScene("Chapter1GardenScene");
        if (scene && scene.player) {
          scene.player.sprite.setPosition(5980, 595);
          scene.player.sprite.setVelocity(0, 0);
        }
      })()`,
    });

    // Wait 500ms for encounter to trigger and Fox to begin attracting Titi
    await new Promise((resolve) => setTimeout(resolve, 600));

    // CAPTURE SCREENSHOT 2: Fox Attracting Titi with Food
    console.log("2. Capturing Screenshot: Fox Attracting Titi...");
    const shot2 = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch1_fox_attracting_titi.png",
      Buffer.from(shot2.data, "base64")
    );
    console.log("Saved ch1_fox_attracting_titi.png");

    // 3. Wait for Ronny to react (surprised -> sad with dropped scoop and heartbreak)
    console.log("3. Waiting for Ronny heartbreak reaction (ronny_sad)...");
    await new Promise((resolve) => setTimeout(resolve, 2200));

    // CAPTURE SCREENSHOT 3: Ronny Sad
    console.log("3. Capturing Screenshot: Ronny Sad...");
    const shot3 = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch1_ronny_sad.png",
      Buffer.from(shot3.data, "base64")
    );
    console.log("Saved ch1_ronny_sad.png");

    // 4. Wait for Ronny to turn and walk away
    console.log("4. Waiting for Ronny to walk away into wilderness (ronny_walking_away)...");
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // CAPTURE SCREENSHOT 4: Ronny Walking Away
    console.log("4. Capturing Screenshot: Ronny Walking Away...");
    const shot4 = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(
      "C:\\Users\\nightfury\\.gemini\\antigravity\\brain\\876eb528-2510-40f2-aaf2-9dca3a59e674\\ch1_ronny_walking_away.png",
      Buffer.from(shot4.data, "base64")
    );
    console.log("Saved ch1_ronny_walking_away.png");

    console.log(`Total console logs captured: ${consoleLogs.length}`);
    const errors = consoleLogs.filter((l) => l.type === "error");
    console.log(`Console errors found: ${errors.length}`);
    if (errors.length > 0) {
      console.error("Error details:", JSON.stringify(errors, null, 2));
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
