import * as Phaser from "phaser";
import { CharacterId, CharacterManifest } from "@/types/characterAsset";
import manifestJson from "../../../public/assets/characters/manifest.json";

export interface CharacterValidationResult {
  characterId: CharacterId;
  hasProductionArt: boolean;
  activeSource: "production" | "procedural_fallback";
  missingAnimations: string[];
  registeredAnimations: string[];
  warnings: string[];
}

export interface ManifestValidationReport {
  timestamp: string;
  isAllProductionReady: boolean;
  characters: Record<CharacterId, CharacterValidationResult>;
}

export class AssetValidator {
  private static manifest: CharacterManifest = manifestJson as unknown as CharacterManifest;

  /**
   * Validates in-engine character textures and registered animations.
   * Returns a structured report without throwing errors or halting gameplay.
   */
  public static validateSceneCharacters(scene: Phaser.Scene): ManifestValidationReport {
    const characters = this.manifest.characters;
    const report: ManifestValidationReport = {
      timestamp: new Date().toISOString(),
      isAllProductionReady: true,
      characters: {} as Record<CharacterId, CharacterValidationResult>,
    };

    (Object.keys(characters) as CharacterId[]).forEach((charId) => {
      const meta = characters[charId];
      const prodTextureKey = `${charId}_spritesheet`;
      const hasProdSpritesheet = scene.textures.exists(prodTextureKey);
      const hasProdFrameSequence = scene.textures.exists(`frame_${charId}_idle_0`);
      const isProduction = hasProdSpritesheet || hasProdFrameSequence;

      const registeredAnims: string[] = [];
      const missingAnims: string[] = [];
      const warnings: string[] = [];

      Object.entries(meta.animations).forEach(([animName, animDef]) => {
        const canonicalKey = animDef.key;
        if (scene.anims.exists(canonicalKey)) {
          registeredAnims.push(canonicalKey);
        } else {
          missingAnims.push(canonicalKey);
        }
      });

      if (!isProduction) {
        report.isAllProductionReady = false;
        warnings.push(
          `Production artwork not detected for "${meta.name}". Active rendering: Procedural Vector Fallback.`
        );
      }

      report.characters[charId] = {
        characterId: charId,
        hasProductionArt: isProduction,
        activeSource: isProduction ? "production" : "procedural_fallback",
        missingAnimations: missingAnims,
        registeredAnimations: registeredAnims,
        warnings,
      };
    });

    return report;
  }

  /**
   * Logs a clean diagnostic summary to the browser console.
   */
  public static logDiagnostics(scene: Phaser.Scene): void {
    const report = this.validateSceneCharacters(scene);
    console.groupCollapsed(
      `[AssetValidator] Character Asset Diagnostics (${report.isAllProductionReady ? "PRODUCTION" : "FALLBACK ACTIVE"})`
    );
    console.info(`Status: ${report.isAllProductionReady ? "All Production Sprites Active" : "Procedural Fallback Pipeline Active"}`);
    (Object.keys(report.characters) as CharacterId[]).forEach((charId) => {
      const char = report.characters[charId];
      console.info(
        `%c${char.characterId}%c: [${char.activeSource}] | Anims Registered: ${char.registeredAnimations.length} | Missing: ${char.missingAnimations.length}`,
        "color: #f59e0b; font-weight: bold",
        "color: inherit"
      );
      if (char.warnings.length > 0) {
        char.warnings.forEach((w) => console.debug(`  - ${w}`));
      }
    });
    console.groupEnd();
  }
}
