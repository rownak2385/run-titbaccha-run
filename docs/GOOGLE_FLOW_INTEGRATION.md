# Google Flow Video Integration Specification

> **Project**: *Run Titibaccha, Run!*  
> **Target Audience**: Video Editors, Motion Artists, and Technical Game Directors  
> **Standard**: Chapter Cinematics & Narrative Transitions

---

## 1. Overview & Architecture

The game utilizes a decoupled React-based **Cinematic Player** (`CinematicPlayer.tsx`) that sits over the Phaser 3 canvas. When narrative milestones or cutscene triggers occur (e.g. Chapter 1 Intro, Chapter 1 Fox Betrayal Outro), Phaser pauses its physics simulation and signals React via `EventBus.emit(GAME_EVENTS.CUTSCENE_TRIGGER, cutsceneId)`.

The cinematic player seamlessly loads the corresponding video asset from `/public/assets/videos/`. If a browser fails to load or decode the video file, the player smoothly presents an animated typographic and illustrated fallback scene without interrupting the game loop.

---

## 2. Directory Layout & Filename Conventions

Place exported MP4 / WebM video files into:
`public/assets/videos/`

### Standard Cutscene Filenames:

| Scene Identifier | Filename | Description | Target Length |
| :--- | :--- | :--- | :--- |
| `chapter1_intro` | `chapter1_intro.mp4` / `.webm` | Titi surviving the meteor strike, seeing Ronny's distant camp. | 15–25 sec |
| `chapter1_betrayal` | `chapter1_betrayal.mp4` / `.webm` | Titi tempted by fox's bait, Ronny's heartbreak and departure. | 25–40 sec |
| `chapter2_intro` | `chapter2_intro.mp4` / `.webm` | Titi starting "The Search" into the wilderness alone. | 15–20 sec |

---

## 3. Video Encoding Guidelines

For optimal desktop browser performance and fast progressive streaming:

- **Container Formats**: Dual delivery: `.mp4` (H.264) and `.webm` (VP9/AV1).
- **Resolution**: 1920x1080 (16:9) or 1280x720 (16:9).
- **Framerate**: 24 fps or 30 fps (constant framerate).
- **Color Profile**: YUV 4:2:0, Rec.709 color space.
- **Video Bitrate**: 2,500 – 4,000 kbps (CRF 20–22).
- **Audio Codec**: AAC-LC (for MP4) or Opus (for WebM), stereo 48kHz, 160 kbps.
- **FastStart Flag**: Must enable progressive download (`movflags +faststart` for MP4 so video begins buffering immediately).

### Recommended FFmpeg Command:
```bash
ffmpeg -i source_master.mov \
  -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 160k -ar 48000 \
  public/assets/videos/chapter1_betrayal.mp4
```

---

## 4. Subtitle & Narrative Text Integration

Subtitles are supplied via declarative JSON objects in `src/game/data/CinematicTracks.ts` or standard WebVTT (`.vtt`) files.
Each cue contains:
- `startTime`: seconds from video start
- `endTime`: seconds from video start
- `speaker`: Character name (`"Ronny"`, `"Narrator"`, `"Fox"`)
- `text`: Subtitle dialogue or descriptive closed caption

---

## 5. Player Features Supported

- [x] HTML5 `<video>` autoplay with audio synchronized to game mute settings.
- [x] Skip button with progressive visual timer.
- [x] Graceful fallback to procedural illustrated panels if media is absent.
- [x] Automatic completion hook returning player to game or chapter outro modal.
