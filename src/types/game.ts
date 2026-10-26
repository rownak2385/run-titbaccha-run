export interface CheckpointData {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface SaveData {
  version: number;
  chapter: number;
  unlockedChapters: number[];
  completedChapters: number[];
  activeCheckpoint: CheckpointData | null;
  health: number;
  maxHealth: number;
  collectedItems: string[];
  unlockedChests: string[];
  defeatedEnemies: string[];
  puzzles: {
    photoPieces: string[];
    isPhotoComplete: boolean;
    ticketPieces: string[];
    isTicketComplete: boolean;
    mapPieces: string[];
    isMapComplete: boolean;
  };
  hasBow: boolean;
  arrowCount: number;
  maxArrows: number;
  hasChapter2Key: boolean;
  hasChapter3Key: boolean;
  hasChapter4Key: boolean;
  hasChapter5Key: boolean;
  hasChapter6Key: boolean;
  hasChapter7Key: boolean;
  letterFragments: number[];
  hasLetterFragment1: boolean;
  hasLetterFragment2: boolean;
  hasLetterFragment3: boolean;
  hasLetterFragment4: boolean;
  hasLetterFragment5: boolean;
  hasLetterFragment6: boolean;
  hasLetterFragment7: boolean;
  hasTrainTicket: boolean;
  hasCaveNote: boolean;
  hasRonnyBag: boolean;
  trainExploded: boolean;
  roses: string[];
  hasBouquet: boolean;
  necklaceActivated: boolean;
  reunionCompleted: boolean;
  finalLetterRevealed: boolean;
  gameCompleted: boolean;
  settings: {
    muted: boolean;
    masterVolume: number;
  };
  timestamp: number;
}

export interface PlayerMotionState {
  isGrounded: boolean;
  isMoving: boolean;
  facing: "left" | "right";
  currentSpeed: number;
  isInvulnerable: boolean;
  isBoosted: boolean;
  boostTimeRemainingMs: number;
}

export interface GameHUDState {
  chapter: number;
  chapterTitle: string;
  health: number;
  maxHealth: number;
  speedBoostActive: boolean;
  speedBoostSecondsRemaining: number;
  hasKey: boolean;
  hasLetterFragment: boolean;
  letterCount: number;
  hasBow: boolean;
  arrowCount: number;
  maxArrows: number;
  torchAvailable: boolean;
  torchActive: boolean;
  inSunlight: boolean;
  hasTrainTicket: boolean;
  photoPiecesCount: number;
  isPhotoComplete: boolean;
  ticketPiecesCount: number;
  isTicketComplete: boolean;
  mapPiecesCount: number;
  isMapComplete: boolean;
  rosesCount: number;
  hasBouquet: boolean;
  necklaceGlowActive: boolean;
  checkpointLabel: string | null;
  notificationMessage: string | null;
}

export interface CinematicCue {
  startTime: number;
  endTime: number;
  speaker?: string;
  text: string;
}

export interface CinematicData {
  id: string;
  title: string;
  chapterLabel: string;
  videoSrcMp4?: string;
  videoSrcWebm?: string;
  subtitles: CinematicCue[];
  fallbackDescription: string;
  durationSeconds?: number;
}
