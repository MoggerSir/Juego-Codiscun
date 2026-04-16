import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { EstadoSession } from "@sistemas/EstadoSession";
import { SistemaGuardado } from "@sistemas/SistemaGuardado";
import "../ui/selector-personajes.css";
import { ASSETS } from "@constantes/constantes-assets";

export class EscenaSelectorPersonaje extends Phaser.Scene {
  private domElement: HTMLElement | null = null;
  private modoEdicion: boolean = false; // true si viene desde Settings (ya tiene progreso)

  constructor() {
    super({ key: ESCENAS.SELECTOR_PERSONAJE });
  }

  init(data: any) {
    this.modoEdicion = data?.modoEdicion || false;
  }

  create(): void {
    const html = `
      <div id="personaje-screen" class="ui-screen" style="z-index: 10000; position: absolute; top:0; left:0; width:100%; height:100%;">
        
        ${!this.modoEdicion ? `
        <div id="start-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); z-index: 20000; cursor: pointer; text-align: center;">
          <h1 style="color: #FFD700; font-size: clamp(1.5rem, 6vw, 3rem); text-shadow: 4px 4px 0px #000, 0 0 20px #FFD700; animation: pulseClick 2s ease-in-out infinite;">¡HAZ CLICK PARA COMENZAR!</h1>
        </div>
        ` : ''}

        <h1 class="personaje-titulo">ELIGE A TU PERSONAJE</h1>
        
        <div class="personaje-container">
          <!-- TARJETA FERNANDA -->
          <div class="personaje-card fernanda" id="card-fernanda">
            <div class="personaje-img-container">
              <img class="personaje-sprite" src="assets/sprites/jugador/Fernanda.png" alt="Fernanda">
            </div>
            <div class="personaje-nombre">FERNANDA</div>
            <div class="personaje-desc">
              Ágil, brillante y siempre auténtica.<br>Orgullosa mujer de la comunidad LGBT+ lista para liderar con creatividad y decisión.
            </div>
          </div>

          <!-- TARJETA HARRY -->
          <div class="personaje-card harry" id="card-harry">
            <div class="personaje-img-container">
              <img class="personaje-sprite" src="assets/sprites/jugador2/harry.png" alt="Harry">
            </div>
            <div class="personaje-nombre">HARRY</div>
            <div class="personaje-desc">
              Fuerza bruta y lealtad inquebrantable.<br>El clásico fan del Black Metal trve hetero dispuesto a darlo todo por proteger a su equipo.
            </div>
          </div>
        </div>
        
        ${this.modoEdicion ? '<button id="btn-volver" class="btn-neon" style="margin-top: 2rem;">CANCELAR Y VOLVER</button>' : ''}
      </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = html.trim();
    this.domElement = div.firstChild as HTMLElement;
    document.body.appendChild(this.domElement);

    // Event Listeners
    const cardFernanda = this.domElement.querySelector("#card-fernanda");
    const cardHarry = this.domElement.querySelector("#card-harry");
    const btnVolver = this.domElement.querySelector("#btn-volver");
    const startOverlay = this.domElement.querySelector("#start-overlay");

    // Lógica para Autoplay Policy (Click to Start)
    if (startOverlay) {
      startOverlay.addEventListener("click", () => {
        startOverlay.remove();
        this.iniciarMusicaMenu();
      });
    } else {
      // Si no hay overlay (modo edición), se intenta llamar directamente
      this.iniciarMusicaMenu();
    }

    cardFernanda?.addEventListener("click", () => this.seleccionarPersonaje("fernanda"));
    cardHarry?.addEventListener("click", () => this.seleccionarPersonaje("harry"));
    btnVolver?.addEventListener("click", () => this.volverSinCambios());

    // Clean up
    this.events.once("shutdown", () => {
      this.domElement?.remove();
    });
  }

  private iniciarMusicaMenu(): void {
    if (this.cache.audio.exists(ASSETS.MUSICA_MENU)) {
      const musicaMenu = this.sound.get(ASSETS.MUSICA_MENU) || this.sound.add(ASSETS.MUSICA_MENU, { loop: true, volume: 0.5 });
      if (!musicaMenu.isPlaying) {
        musicaMenu.play();
      }
    }
  }

  private seleccionarPersonaje(id: string): void {
    // 1. Guardar en memoria (Sesión actual)
    EstadoSession.obtener().setIdPersonajeActual(id);

    // 2. Persistir permanentemente
    const progreso = SistemaGuardado.cargar();
    progreso.personajeSeleccionado = id;
    SistemaGuardado.guardar(progreso);

    // 3. Efectos Opcionales (Ej. play de sonido global si fuera necesario)
    if (this.cache.audio.exists(ASSETS.SFX_POWER_UP)) {
      this.sound.play(ASSETS.SFX_POWER_UP, { volume: 0.5 });
    }

    // 4. Transición natural a la siguiente pantalla
    this.scene.start(ESCENAS.NIVELES);
  }

  private volverSinCambios(): void {
    this.scene.start(ESCENAS.NIVELES);
  }
}
