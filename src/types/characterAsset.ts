export type CharacterId = "titibaccha" | "ronny" | "fox";

export type AnimationKeyTiti =
  | "idle"
  | "running"
  | "jumping"
  | "falling"
  | "hurt"
  | "eating"
  | "shooting"
  | "happy"
  | "sad";

export type AnimationKeyRonny =
  | "idle"
  | "waiting_food"
  | "feeding"
  | "surprised"
  | "sad"
  | "walking_away"
  | "running"
  | "hugging";

export type AnimationKeyFox =
  | "idle"
  | "walking"
  | "attracting"
  | "eating"
  | "deceptive";

export type AnimationFormat = "spritesheet" | "frameSequence" | "procedural";

export interface AnimationDefinition {
  key: string;
  format: AnimationFormat;
  frames?: number[];
  framePaths?: string[];
  frameRate: number;
  repeat: number;
  description: string;
}

export interface PhysicsBodyConfig {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

export interface CharacterMetadata {
  id: CharacterId;
  name: string;
  defaultFacing: "left" | "right";
  spritesheetPath?: string;
  frameSequenceDir?: string;
  frameWidth: number;
  frameHeight: number;
  anchorX: number;
  anchorY: number;
  scale?: number;
  textureFilter: "nearest" | "linear";
  physics: PhysicsBodyConfig;
  animations: Record<string, AnimationDefinition>;
}

export interface CharacterManifest {
  version: string;
  name: string;
  characters: Record<CharacterId, CharacterMetadata>;
}
