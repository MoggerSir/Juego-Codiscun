import Phaser from "phaser";
import { configuracionJuego } from "./configuracion-juego";
import { inicializarRegistroEnemigos } from "./entidades/enemigos/registroEnemigos";

// Instanciar catálogo de enemigos (Previene tree-shaking en producción)
inicializarRegistroEnemigos();

// Inicializar Phaser con la configuración global
new Phaser.Game(configuracionJuego);
