type EventCallback = (...args: any[]) => void;

class EventBusEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in EventBus listener for "${event}":`, error);
        }
      });
    }
  }

  clear(): void {
    this.events.clear();
  }
}

export const EventBus = new EventBusEmitter();

if (typeof window !== "undefined") {
  (window as any).__EVENT_BUS__ = EventBus;
}

export const GAME_EVENTS = {
  // Phaser to React
  GAME_READY: "GAME_READY",
  HEALTH_UPDATED: "HEALTH_UPDATED",
  SPEED_BOOST_UPDATED: "SPEED_BOOST_UPDATED",
  CHECKPOINT_ACTIVATED: "CHECKPOINT_ACTIVATED",
  ITEM_COLLECTED: "ITEM_COLLECTED",
  CHEST_OPENED: "CHEST_OPENED",
  CUTSCENE_TRIGGER: "CUTSCENE_TRIGGER",
  PLAYER_DEATH: "PLAYER_DEATH",
  NOTIFICATION: "NOTIFICATION",

  // Combat & Weapons
  BOW_ACQUIRED: "BOW_ACQUIRED",
  AMMO_UPDATED: "AMMO_UPDATED",

  // Torch & Darkness
  TORCH_TOGGLED: "TORCH_TOGGLED",
  SUNLIGHT_ENTERED: "SUNLIGHT_ENTERED",
  SUNLIGHT_EXITED: "SUNLIGHT_EXITED",

  // Puzzles
  PUZZLE_UPDATED: "PUZZLE_UPDATED",
  PHOTO_COMPLETED: "PHOTO_COMPLETED",
  TICKET_COMPLETED: "TICKET_COMPLETED",
  MAP_COMPLETED: "MAP_COMPLETED",
  ROSE_COLLECTED: "ROSE_COLLECTED",
  BOUQUET_ASSEMBLED: "BOUQUET_ASSEMBLED",

  // Chapters & Transitions
  CHAPTER_UNLOCKED: "CHAPTER_UNLOCKED",
  CHAPTER_COMPLETED: "CHAPTER_COMPLETED",
  ENEMY_DEFEATED: "ENEMY_DEFEATED",
  EXPLOSION_TRIGGERED: "EXPLOSION_TRIGGERED",
  NECKLACE_GLOW_TOGGLED: "NECKLACE_GLOW_TOGGLED",
  REUNION_TRIGGERED: "REUNION_TRIGGERED",
  LETTER_REVEAL_TRIGGERED: "LETTER_REVEAL_TRIGGERED",
  GAME_COMPLETED: "GAME_COMPLETED",

  // React to Phaser
  PAUSE_GAME: "PAUSE_GAME",
  RESUME_GAME: "RESUME_GAME",
  RESTART_CHECKPOINT: "RESTART_CHECKPOINT",
  SET_MUTED: "SET_MUTED",
  RELOAD_SAVE: "RELOAD_SAVE",
  CHANGE_CHAPTER: "CHANGE_CHAPTER",
} as const;
