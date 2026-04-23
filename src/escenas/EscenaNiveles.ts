import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { ASSETS } from "@constantes/constantes-assets";
import { GestorNiveles } from "@niveles/GestorNiveles";
import { SistemaGuardado } from "@sistemas/SistemaGuardado";
import { CONFIG_AUDIO } from "@constantes/config-audio";
import { RegistryManager } from "../registry/RegistryManager";
import "../ui/game-ui.css";
import "../ui/selector-niveles.css";

/**
 * Escena de Selección de Niveles (UI Moderna Híbrida).
 * Utiliza Phaser DOM para un renderizado dinámico y responsivo con estética Premium.
 */
export class EscenaNiveles extends Phaser.Scene {
  private uiElement: HTMLElement | null = null;
  private transicionando: boolean = false;
  private movido: boolean = false;
  private isDown: boolean = false;
  private startX: number = 0;
  private scrollLeft: number = 0;

  // --- Miembros Senior: Ajustes y Memoria ---
  private estadoMenu:
    | "CERRADO"
    | "ABRIENDO"
    | "ABIERTO"
    | "CERRANDO"
    | "CONFIRMANDO" = "CERRADO";
  private listeners: {
    [key: string]: {
      el: HTMLElement | Window | Document;
      type: string;
      cb: any;
    };
  } = {};

  constructor() {
    super({ key: ESCENAS.NIVELES });
  }

  create(): void {
    this.transicionando = false;

    // Manejar música del menú
    if (this.cache.audio.exists(ASSETS.MUSICA_MENU)) {
      const musicaMenu = this.sound.get(ASSETS.MUSICA_MENU) || this.sound.add(ASSETS.MUSICA_MENU, { loop: true, volume: 0.5 });
      if (!musicaMenu.isPlaying) {
        musicaMenu.play();
      }
    }

    // 1. Bloqueo de entrada de Phaser para que la UI Domine el Input
    this.input.enabled = true;

    // 2. Obtener Datos Reales de Progresión
    const niveles = GestorNiveles.obtenerEstadoProgresion();

    // 3. Obtener rutas del registro para el DOM
    const getPath = (key: string) => RegistryManager.getAssetPath(key);

    // 4. Construir el HTML In-Memory (Template Literals)
    const htmlContent = `
      <div class="selector-container" id="selector-niveles">
        
        ${this.sound.locked ? `
        <div id="start-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; display: flex; justify-content: center; align-items: center; background: rgba(0,0,0,0.5); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); z-index: 20000; cursor: pointer; text-align: center;">
          <h1 style="color: #FFD700; font-size: clamp(1.5rem, 6vw, 3rem); text-shadow: 4px 4px 0px #000, 0 0 20px #FFD700; animation: pulseClick 2s ease-in-out infinite; font-family: 'Press Start 2P', monospace;">¡HAZ CLICK PARA COMENZAR!</h1>
        </div>
        ` : ''}

        <h1 class="selector-titulo">Mundos de Aventura</h1>

        <!-- HUD DE AJUSTES SENIOR -->
        <div class="settings-hud">
          <div class="settings-btn" id="gear-btn">
            <img src="${getPath(ASSETS.UI_GEAR)}" alt="settings">
          </div>

          <div class="settings-panel" id="settings-panel">
            <h2 class="settings-titulo">Ajustes</h2>
            <button class="reset-btn" id="btn-cambiar-heroe" style="margin-bottom: 20px; border-color: var(--neon-cyan); color: var(--neon-cyan);">CAMBIAR HÉROE</button>
            
            <div class="volume-control" style="margin-bottom: 20px;">
              <p class="settings-label" style="font-size: 0.5rem; color: #888; margin-bottom: 8px; text-transform: uppercase;">Volumen Maestro</p>
              <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="${CONFIG_AUDIO.volumen}" 
                     style="width: 100%; height: 6px; cursor: pointer; accent-color: var(--neon-cyan);">
            </div>

            <button class="reset-btn" id="reset-btn">REINICIAR PROGRESO</button>
            
            <div class="confirm-module" id="confirm-module">
              <p class="confirm-txt">¿BORRAR TODO EL PROGRESO?</p>
              <div class="confirm-botones">
                <button class="btn-confirm" id="btn-confirm">SÍ, BORRAR</button>
                <button class="btn-cancel" id="btn-cancel">NO</button>
              </div>
            </div>
          </div>
        </div>

        <!-- OVERLAY DE CIERRE -->
        <div class="settings-overlay" id="settings-overlay"></div>
        
        <div class="niveles-wrapper">
          ${niveles
            .map(
              (n, index) => `
            <div class="nivel-card ${n.desbloqueado ? "" : "bloqueado"}" 
                 data-id="${n.id}" 
                 style="animation-delay: ${index * 0.1}s">
              <div class="nivel-numero">${n.id === "backroom" ? "???" : niveles.filter((lvl, i) => lvl.id !== "backroom" && i <= index).length}</div>
              <div class="nivel-nombre">${n.nombreDisplay}</div>
              <div class="nivel-record">Récord: ${n.mejorPuntaje}</div>
              <div class="nivel-icono">
                <img src="${n.desbloqueado ? getPath(ASSETS.UI_UNLOCK) : getPath(ASSETS.UI_LOCK)}" 
                     class="img-status ${n.desbloqueado ? "unlocked" : "locked"}" alt="status">
              </div>
              ${n.mejorPuntaje > 0 ? `<div class="nivel-check"><img src="${getPath(ASSETS.UI_CHECK)}" class="img-check" alt="completado"></div>` : ""}
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="instrucciones">
          Desliza para ver más mundos
        </div>
      </div>
    `;

    // 4. Inyección Nativa en Body (Full Screen Illusion)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent.trim();
    this.uiElement = tempDiv.firstChild as HTMLElement;
    document.body.appendChild(this.uiElement);

    const container = this.uiElement;

    // 5. Inyección de Lógica Senior (Settings)
    this.setupSettingsHUD(container);

    // 6. Gestión de Eventos Delegados (Click en Tarjetas)
    const wrapper = container.querySelector(".niveles-wrapper") as HTMLElement;

    // --- Lógica de Scroll (Nativa + Ayuda Visual) ---
    this.movido = false;
    let clickX = 0;

    this.registrarListener(wrapper, "mousedown", (e: MouseEvent) => {
      this.isDown = true;
      this.movido = false;
      clickX = e.clientX;
      wrapper.style.cursor = "grabbing";
      this.startX = e.clientX - wrapper.offsetLeft;
      this.scrollLeft = wrapper.scrollLeft;
    });

    this.registrarListener(wrapper, "mouseleave", () => {
      this.isDown = false;
      wrapper.style.cursor = "grab";
    });

    this.registrarListener(wrapper, "mouseup", () => {
      this.isDown = false;
      wrapper.style.cursor = "grab";
    });

    this.registrarListener(wrapper, "mousemove", (e: MouseEvent) => {
      if (!this.isDown) return;
      e.preventDefault();
      const x = e.clientX - wrapper.offsetLeft;
      const walk = (x - this.startX) * 1.5;
      wrapper.scrollLeft = this.scrollLeft - walk;

      if (Math.abs(e.clientX - clickX) > 10) {
        this.movido = true;
      }
    });

    // --- Selección de Nivel ---
    const cards = container.querySelectorAll(".nivel-card");
    cards.forEach((cardNode: Element) => {
      const card = cardNode as HTMLElement;
      this.registrarListener(card, "pointerup", (e: PointerEvent) => {
        e.stopPropagation();
        if (this.movido) {
          this.movido = false;
          return;
        }
        if (card.classList.contains("bloqueado")) return;
        const id = card.getAttribute("data-id");
        if (id) {
          this.seleccionarNivel(id, container);
        }
      });
    });

    // 7. Ciclo de Vida: Registro de Limpieza (Security Shield)
    this.events.once("shutdown", () => {
      this.limpiarUI();
    });
  }

  /**
   * Configura el HUD de Ajustes con lógica Senior de estados y limpieza.
   */
  private setupSettingsHUD(container: HTMLElement): void {
    const gearBtn = container.querySelector("#gear-btn") as HTMLElement;
    const panel = container.querySelector("#settings-panel") as HTMLElement;
    const overlay = container.querySelector("#settings-overlay") as HTMLElement;
    const resetBtn = container.querySelector("#reset-btn") as HTMLElement;
    const btnCambiarHeroe = container.querySelector("#btn-cambiar-heroe") as HTMLElement;
    const confirmModule = container.querySelector("#confirm-module") as HTMLElement;
    const btnConfirm = container.querySelector("#btn-confirm") as HTMLElement;
    const btnCancel = container.querySelector("#btn-cancel") as HTMLElement;
    const startOverlay = container.querySelector("#start-overlay") as HTMLElement;

    // Lógica para Autoplay Policy (Click to Start)
    if (startOverlay) {
      this.registrarListener(startOverlay, "click", () => {
        startOverlay.remove();
        if (this.cache.audio.exists(ASSETS.MUSICA_MENU)) {
          const musicaMenu = this.sound.get(ASSETS.MUSICA_MENU) || this.sound.add(ASSETS.MUSICA_MENU, { loop: true, volume: 0.5 });
          if (!musicaMenu.isPlaying) {
            musicaMenu.play();
          }
        }
      });
    }

    // Abrir/Cerrar Menú
    const toggleMenu = (e?: Event) => {
      if (e) e.stopPropagation();
      if (this.estadoMenu === "ABRIENDO" || this.estadoMenu === "CERRANDO")
        return;

      if (this.estadoMenu === "CERRADO") {
        this.estadoMenu = "ABRIENDO";
        this.input.enabled = false; // Bloquear Phaser
        document.body.classList.add("no-scroll");
        panel.classList.add("active");
        overlay.classList.add("active");
        this.estadoMenu = "ABIERTO";
      } else {
        this.cerrarMenu(panel, overlay, confirmModule);
      }
    };

    this.registrarListener(gearBtn, "click", toggleMenu);
    this.registrarListener(overlay, "click", toggleMenu);

    // Lógica de Reset
    if (resetBtn) {
      resetBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        confirmModule.classList.add("active");
        this.estadoMenu = "CONFIRMANDO";
      });
    }

    if (btnCambiarHeroe) {
      btnCambiarHeroe.addEventListener('click', () => {
        this.scene.start(ESCENAS.SELECTOR_PERSONAJE, { modoEdicion: true });
      });
    }

    // Lógica de Volumen
    const volumeSlider = container.querySelector("#volume-slider") as HTMLInputElement;
    if (volumeSlider) {
      this.registrarListener(volumeSlider, "input", (e: any) => {
        const val = parseFloat(e.target.value);
        CONFIG_AUDIO.aplicarVolumen(this, val);
        
        // Persistir volumen inmediatamente
        const progreso = SistemaGuardado.cargar();
        progreso.volumen = val;
        SistemaGuardado.guardar(progreso);
      });
    }

    this.registrarListener(btnCancel, "click", (e: Event) => {
      e.stopPropagation();
      confirmModule.classList.remove("active");
      this.estadoMenu = "ABIERTO";
    });

    this.registrarListener(btnConfirm, "click", async (e: Event) => {
      e.stopPropagation();
      this.ejecutarReinicio(panel, overlay, confirmModule);
    });

    // Teclado Senior
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        (this.estadoMenu === "ABIERTO" || this.estadoMenu === "CONFIRMANDO")
      ) {
        toggleMenu();
      } else if (e.key === "Enter" && this.estadoMenu === "CONFIRMANDO") {
        this.ejecutarReinicio(panel, overlay, confirmModule);
      }
    };
    this.registrarListener(window as any, "keydown", onKeyDown);
  }

  private async ejecutarReinicio(
    panel: HTMLElement,
    overlay: HTMLElement,
    confirm: HTMLElement,
  ): Promise<void> {
    try {
      console.log("[Ajustes] Iniciando formateo de datos...");

      // 1. Efecto Visual de Cierre
      confirm.classList.remove("active");
      await this.cerrarMenu(panel, overlay, confirm);

      // 2. Operación Atómica
      SistemaGuardado.borrar();
      console.log("[Ajustes] Datos borrados exitosamente.");

      // 3. Reinicio Limpio por Escena
      this.scene.start(ESCENAS.NIVELES);
    } catch (err) {
      console.error("[Ajustes] Fallo crítico en el reseteo:", err);
      alert("Error al formatear datos: " + err);
      this.estadoMenu = "ABIERTO";
    }
  }

  private async cerrarMenu(
    panel: HTMLElement,
    overlay: HTMLElement,
    confirm: HTMLElement,
  ): Promise<void> {
    this.estadoMenu = "CERRANDO";
    panel.classList.remove("active");
    overlay.classList.remove("active");
    confirm.classList.remove("active");
    document.body.classList.remove("no-scroll");

    return new Promise((resolve) => {
      const onEnd = () => {
        panel.removeEventListener("transitionend", onEnd);
        this.estadoMenu = "CERRADO";
        this.input.enabled = true; // Liberar Phaser
        resolve();
      };
      panel.addEventListener("transitionend", onEnd);
      // Fallback por si la animación no dispara
      setTimeout(onEnd, 400);
    });
  }

  /**
   * Registrador Manual de Listeners (Senior Memory Pattern)
   */
  private registrarListener(
    el: HTMLElement | Window | Document,
    type: string,
    cb: any,
  ): void {
    const id = `${type}_${Math.random()}`;
    el.addEventListener(type, cb);
    this.listeners[id] = { el, type, cb };
  }

  /**
   * Maneja la transición al nivel seleccionado de forma sincronizada y blindada.
   */
  private seleccionarNivel(id: string, container: HTMLElement): void {
    if (this.transicionando) return;
    this.transicionando = true;

    container.classList.add("ui-fade-out");

    const timeoutFallback = setTimeout(() => {
      this.scene.start(ESCENAS.JUEGO, { idNivel: id });
    }, 400);

    container.addEventListener(
      "animationend",
      () => {
        clearTimeout(timeoutFallback);
        this.scene.start(ESCENAS.JUEGO, { idNivel: id });
      },
      { once: true },
    );
  }

  /**
   * Destrucción manual para evitar memory leaks (Anti-Ghost Buttons)
   */
  private limpiarUI(): void {
    console.log("[EscenaNiveles] Iniciando limpieza profunda de memoria...");

    // 1. Limpieza de Listeners Manuales (Senior Cleanup)
    Object.values(this.listeners).forEach((obj) => {
      obj.el.removeEventListener(obj.type, obj.cb);
    });
    this.listeners = {};
    document.body.classList.remove("no-scroll");

    // 2. Destrucción de DOM Nativo
    if (this.uiElement && this.uiElement.parentNode) {
      this.uiElement.parentNode.removeChild(this.uiElement);
      this.uiElement = null;
    }
  }
}
