# AGENTS.md: Development Protocol & Architectural Contract

> **Scope**: Autonomous AI Agents and Software Engineers working on *Run Titibaccha, Run!*  
> **Authority**: Treat this document along with `docs/GAME_BIBLE.md` as strictly binding.

---

## 1. High-Level Technical Mandate

- **Stack**: Next.js App Router, React 18, TypeScript (Strict Mode), Phaser 3 (Arcade Physics), Tailwind CSS.
- **Client-Side Sandbox Rule**:
  - Phaser must NEVER run or be imported on the server side (SSR).
  - Use dynamic client-only loading (`useEffect` / dynamic import) for game initialization.
  - On React component unmount, `game.destroy(true)` must be called cleanly with all event listeners removed.
- **Division of Concerns**:
  - **React**: Responsible for the outer application shell, responsive title menus, Pause overlay, Controls modal, Mute toggle, Cutscene narrative modals, HUD overlays.
  - **Phaser**: Responsible exclusively for gameplay simulation, physics, collision detection, sprite animation, camera tracking, and sound triggers.
  - **Bridge (`EventBus`)**: A decoupled, typed EventEmitter facilitating two-way communication between React and Phaser without tight coupling or memory leaks.

---

## 2. Milestone 1 Strict Invariants & Anti-Patterns

1. **No Premature Complexity**:
   - Do NOT integrate remote backends, Supabase, Firebase, web analytics, payment providers, or user authentication.
   - Use deterministic, versioned `localStorage` saves.
2. **No Invented Content**:
   - DO NOT fabricate full letter texts, speculative Ronny dialogue trees, or fox backstory monologues.
   - Narrative moments must be structured as explicit placeholder cutscene hooks with clean UI transitions.
3. **No Combat / Bow / Enemy Sprawl in Milestone 1**:
   - Bow weapons, projectile systems, and enemy AI are deferred to later milestones. Abstract potential interfaces cleanly without polluting the Chapter 1 garden slice.
4. **No External Network Images**:
   - All sprites and tiles for this technical milestone must be generated procedurally via Phaser Graphics/Canvas or clean SVG data textures.
   - Asset directories (`/public/assets/...`) must be structured for incoming Google Flow and pipeline assets.
5. **Input Isolation**:
   - HTML UI overlays (modals, buttons, HUD) must stop propagation and blur keyboard focus so clicking the UI never inadvertently fires jumps or movement in Phaser.

---

## 3. Directory Layout Standard

```text
run-titibaccha-run/
├── docs/
│   └── GAME_BIBLE.md
├── AGENTS.md
├── public/
│   └── assets/
│       ├── audio/
│       ├── characters/
│       ├── ui/
│       ├── videos/
│       └── worlds/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ControlsModal.tsx
│   │   ├── CutsceneModal.tsx
│   │   ├── GameContainer.tsx
│   │   ├── GameHUD.tsx
│   │   ├── PauseModal.tsx
│   │   └── TitleMenu.tsx
│   ├── game/
│   │   ├── EventBus.ts
│   │   ├── constants.ts
│   │   ├── phaserConfig.ts
│   │   ├── scenes/
│   │   │   ├── BootScene.ts
│   │   │   ├── Chapter1GardenScene.ts
│   │   │   └── PreloadScene.ts
│   │   └── systems/
│   │       ├── AssetGenerator.ts
│   │       ├── PlayerController.ts
│   │       └── SaveSystem.ts
│   └── types/
│       └── game.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Verification Checklist

Before completing any task or milestone:
- [ ] TypeScript check passes with zero errors (`npm run typecheck`).
- [ ] ESLint passes without errors (`npm run lint`).
- [ ] Production build succeeds (`npm run build`).
- [ ] Clean state reloading & checkpoint resumption verified via save manager.
