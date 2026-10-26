import { GAME_CONSTANTS } from "../constants";
import { SaveSystem } from "./SaveSystem";
import { SoundEffects } from "./SoundEffects";
import { EventBus, GAME_EVENTS } from "../EventBus";

export class PuzzleManager {
  private static instance: PuzzleManager;

  public static getInstance(): PuzzleManager {
    if (!PuzzleManager.instance) {
      PuzzleManager.instance = new PuzzleManager();
    }
    return PuzzleManager.instance;
  }

  // --- Photo Puzzle (Chapter 3) ---

  public getPhotoPieces(): string[] {
    const save = SaveSystem.load();
    return save?.puzzles.photoPieces || [];
  }

  public isPhotoPieceCollected(pieceId: string): boolean {
    const pieces = this.getPhotoPieces();
    return pieces.includes(pieceId);
  }

  public collectPhotoPiece(pieceId: string): boolean {
    if (this.isPhotoPieceCollected(pieceId)) return false;

    SaveSystem.updatePuzzlePiece("photo", pieceId);
    const count = this.getPhotoPieces().length;

    EventBus.emit(
      GAME_EVENTS.PUZZLE_UPDATED,
      "photo",
      count,
      9,
      `Photo Memory Fragment [${count}/9] recovered!`
    );

    if (count >= 9) {
      EventBus.emit(GAME_EVENTS.PHOTO_COMPLETED);
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        "✨ All 9 Photo Fragments gathered! Memory of Ronny and Titi restored!"
      );
    } else {
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        `Recovered Photo Fragment ${count}/9 from the wild!`
      );
    }

    return true;
  }

  public isPhotoComplete(): boolean {
    const save = SaveSystem.load();
    return Boolean(save?.puzzles.isPhotoComplete || (save?.puzzles.photoPieces.length || 0) >= 9);
  }

  // --- Train Ticket Puzzle (Chapter 4) ---

  public getTicketPieces(): string[] {
    const save = SaveSystem.load();
    return save?.puzzles.ticketPieces || [];
  }

  public isTicketPieceCollected(pieceId: string): boolean {
    const pieces = this.getTicketPieces();
    return pieces.includes(pieceId);
  }

  public collectTicketPiece(pieceId: string): boolean {
    if (this.isTicketPieceCollected(pieceId)) return false;

    SaveSystem.updatePuzzlePiece("ticket", pieceId);
    const count = this.getTicketPieces().length;

    EventBus.emit(
      GAME_EVENTS.PUZZLE_UPDATED,
      "ticket",
      count,
      3,
      `Ticket Scrap [${count}/3] found!`
    );

    if (count >= 3) {
      EventBus.emit(GAME_EVENTS.TICKET_COMPLETED);
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        "🎫 All 3 Ticket Scraps assembled into a valid Train Ticket to the Autumn Forest!"
      );
    } else {
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        `Found Train Ticket Scrap ${count}/3 from the fallen beast!`
      );
    }

    return true;
  }

  public isTicketComplete(): boolean {
    const save = SaveSystem.load();
    return Boolean(
      save?.puzzles.isTicketComplete ||
      (save?.puzzles.ticketPieces.length || 0) >= 3 ||
      save?.hasTrainTicket
    );
  }

  // --- Destination Map Puzzle (Chapter 6) ---

  public getMapPieces(): string[] {
    const save = SaveSystem.load();
    return save?.puzzles.mapPieces || [];
  }

  public isMapPieceCollected(pieceId: string): boolean {
    const pieces = this.getMapPieces();
    return pieces.includes(pieceId);
  }

  public collectMapPiece(pieceId: string): boolean {
    if (this.isMapPieceCollected(pieceId)) return false;

    SaveSystem.updatePuzzlePiece("map", pieceId);
    const count = this.getMapPieces().length;

    EventBus.emit(
      GAME_EVENTS.PUZZLE_UPDATED,
      "map",
      count,
      4,
      `Destination Map Fragment [${count}/4] recovered!`
    );

    if (count >= 4) {
      EventBus.emit(GAME_EVENTS.MAP_COMPLETED);
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        "🗺️ All 4 Map Fragments assembled! The coastal trail to Ronny is revealed!"
      );
    } else {
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        `Recovered Coastal Map Fragment ${count}/4 from the fallen beast!`
      );
    }

    return true;
  }

  public isMapComplete(): boolean {
    const save = SaveSystem.load();
    return Boolean(save?.puzzles.isMapComplete || (save?.puzzles.mapPieces.length || 0) >= 4);
  }

  // --- Rose Collection & Bouquet Assembly (Chapter 7) ---

  public getRoses(): string[] {
    const save = SaveSystem.load();
    return save?.roses || [];
  }

  public isRoseCollected(roseId: string): boolean {
    const roses = this.getRoses();
    return roses.includes(roseId);
  }

  public collectRose(roseId: string): boolean {
    if (this.isRoseCollected(roseId)) return false;

    SoundEffects.playRosePickup();
    SaveSystem.collectRose(roseId);
    const count = this.getRoses().length;

    EventBus.emit(GAME_EVENTS.ROSE_COLLECTED, roseId, count, 5);

    if (count >= 5) {
      SoundEffects.playBouquetAssembled();
      EventBus.emit(GAME_EVENTS.BOUQUET_ASSEMBLED);
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        "💐 All 5 Wild Roses gathered! Assembled the Five-Rose Bouquet for Ronny!"
      );
    } else {
      EventBus.emit(
        GAME_EVENTS.NOTIFICATION,
        `🌹 Gathered Wild Clifftop Rose [${count}/5]!`
      );
    }

    return true;
  }

  public hasBouquet(): boolean {
    const save = SaveSystem.load();
    return Boolean(save?.hasBouquet || (save?.roses.length || 0) >= 5);
  }

  // --- Letter Fragments & Reveal Status ---

  public getLetterFragments(): number[] {
    const save = SaveSystem.load();
    return save?.letterFragments || [];
  }

  public isLetterComplete(): boolean {
    const frags = this.getLetterFragments();
    return frags.length >= 7 && [1, 2, 3, 4, 5, 6, 7].every((id) => frags.includes(id));
  }
}
