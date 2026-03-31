import Phaser from 'phaser';

/**
 * Representa la configuración completa de un asset de imagen o spritesheet.
 */
export interface AssetInfo {
  key: string;
  url: string;
  type: 'image' | 'spritesheet' | 'audio';
  frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
}

/**
 * Representa la configuración completa de una animación en Phaser.
 */
export interface AnimConfig {
  key: string;
  assetKey: string; // La llave del sprite que usará esta animación
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
}

/**
 * Interfaz para agrupar assets y animaciones de un módulo completo (ej: Jugador, Goomba).
 */
export interface RegistryModule {
  assets: Record<string, AssetInfo>;
  anims?: Record<string, AnimConfig>;
}
