import Phaser from "phaser";
import { ESCENAS } from "@constantes/constantes-escenas";
import { ConfiguracionCinematica, PasoCinematica } from "@cinematicas/TiposCinematica";
import { RegistroCinematicas } from "@cinematicas/RegistroCinematicas";

export class EscenaCinematica extends Phaser.Scene {
  private configActual!: ConfiguracionCinematica;
  private pasoIndex: number = 0;
  
  private imagenActual?: Phaser.GameObjects.Image;
  private textosActivos: Phaser.GameObjects.Text[] = [];
  private botonesActivos: Phaser.GameObjects.Text[] = []; // O usamos GameObject si hacemos contenedores

  private isFlujoActivo: boolean = false;

  constructor() {
    super({ key: ESCENAS.CINEMATICA });
  }

  init(data: { idCinematica: string }) {
    const id = data?.idCinematica || "intro";
    this.configActual = RegistroCinematicas[id];
    this.pasoIndex = 0;
    this.isFlujoActivo = false;
  }

  preload() {
    // Si la cinemática no existe, salimos
    if (!this.configActual) {
      console.error("Cinematica no encontrada:", this.configActual);
      return;
    }

    // Cargamos dinámicamente solo las imágenes que necesita esta cinemática
    this.configActual.pasos.forEach((paso) => {
      this.load.image(paso.imagenClave, paso.imagenRuta);
    });

    // Pequeño texto de "Cargando..."
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, "Cargando Cinemática...", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);
  }

  create() {
    if (!this.configActual || this.configActual.pasos.length === 0) {
      // Fallback si algo falló
      this.scene.start(ESCENAS.NIVELES);
      return;
    }

    const { width, height } = this.scale;

    // Fondo negro sólido
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Botón para saltar cinemática (esquina superior derecha)
    const btnSkip = this.add.text(width - 20, 20, "Saltar Skip >>", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#aaaaaa",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    btnSkip.on("pointerdown", () => {
      this.finalizarCinematica();
    });

    btnSkip.on("pointerover", () => btnSkip.setColor("#ffffff"));
    btnSkip.on("pointerout", () => btnSkip.setColor("#aaaaaa"));

    // Opcional: permitir tap en el canvas para avanzar más rápido el paso actual
    this.input.on('pointerdown', () => {
      // Si quisiéramos avanzar rápido: this.siguientePaso();
      // Por ahora para no romper los tweens lo dejamos solo en el SKIP general
    });

    this.isFlujoActivo = true;
    this.mostrarPasoActual();
  }

  private mostrarPasoActual() {
    if (!this.isFlujoActivo) return;

    if (this.pasoIndex >= this.configActual.pasos.length) {
      this.finalizarCinematica();
      return;
    }

    const paso = this.configActual.pasos[this.pasoIndex];
    const { width, height } = this.scale;

    // 1. Limpiar objetos del paso anterior
    if (this.imagenActual) this.imagenActual.destroy();
    this.textosActivos.forEach(t => t.destroy());
    this.textosActivos = [];
    this.botonesActivos.forEach(b => b.destroy());
    this.botonesActivos = [];

    // 2. Crear Imagen (inicia invisible)
    const posX = paso.x !== undefined ? paso.x : width / 2;
    const posY = paso.y !== undefined ? paso.y : height / 2;
    
    this.imagenActual = this.add.image(posX, posY, paso.imagenClave);
    this.imagenActual.setAlpha(0);
    
    // Auto-ajustar escala si la imagen es más grande que la pantalla, respetando config
    let baseScale = paso.escala || 1;
    // Fix para que entre en pantalla la imagen si es muy ancha:
    const relRatio = Math.min(width / this.imagenActual.width, height / this.imagenActual.height);
    if (relRatio < 1 && !paso.escala) {
       baseScale = relRatio * 0.9; // Margen
    }
    this.imagenActual.setScale(baseScale);

    // 3. Crear Textos y Programar sus animaciones (Timeline)
    if (paso.textos && paso.textos.length > 0) {
      paso.textos.forEach((txtConfig) => {
        const txtX = txtConfig.x !== undefined ? txtConfig.x : width / 2;
        const txtY = txtConfig.y !== undefined ? txtConfig.y : height - 100;
        
        const textoObj = this.add.text(txtX, txtY, txtConfig.contenido, txtConfig.estilo);
        textoObj.setOrigin(0.5);
        textoObj.setAlpha(0);
        
        if (txtConfig.ancho) {
          textoObj.setWordWrapWidth(txtConfig.ancho);
        }
        this.textosActivos.push(textoObj);

        const tInicio = txtConfig.startTime || 0;
        const tDuracion = txtConfig.duration;

        // Aparecer el texto con su propio delay
        this.time.delayedCall(tInicio, () => {
          if (!this.isFlujoActivo || !textoObj.active) return;
          this.tweens.add({
            targets: textoObj,
            alpha: 1,
            duration: paso.fadeIn,
            ease: "Linear"
          });
        });

        // Si tiene duración propia, desaparecerlo antes de que acabe la imagen
        if (tDuracion !== undefined) {
          this.time.delayedCall(tInicio + tDuracion, () => {
            if (!this.isFlujoActivo || !textoObj.active) return;
            this.tweens.add({
              targets: textoObj,
              alpha: 0,
              duration: paso.fadeOut,
              ease: "Linear"
            });
          });
        }
      });
    }

    // 4. Efectos base: Tween de Fade In (solo para la imagen, los textos se manejan con retraso arriba)
    this.tweens.add({
      targets: this.imagenActual,
      alpha: 1,
      duration: paso.fadeIn,
      ease: "Linear",
      onComplete: () => {
        // Al terminar de aparecer la imagen, se decide si avanzamos solos o mostramos opciones
        if (!this.isFlujoActivo) return;

        if (paso.opciones && paso.opciones.length > 0) {
          // Hay decisiones: se muestran después de haber dejado leer el texto principal
          this.time.delayedCall(paso.duracionEnPantalla, () => {
            this.mostrarOpciones(paso.opciones!);
          });
        } else {
          // Flujo continuo normal
          this.time.delayedCall(paso.duracionEnPantalla, () => {
            this.desaparecerPasoActual(paso);
          });
        }
      }
    });

    // 5. Efectos extra de escala durante la duración
    if (paso.efecto === "zoom_in") {
      this.tweens.add({
        targets: this.imagenActual,
        scale: baseScale * 1.15,
        duration: paso.fadeIn + paso.duracionEnPantalla + paso.fadeOut,
        ease: "Sine.easeInOut"
      });
    } else if (paso.efecto === "zoom_out") {
      this.imagenActual.setScale(baseScale * 1.15);
      this.tweens.add({
        targets: this.imagenActual,
        scale: baseScale,
        duration: paso.fadeIn + paso.duracionEnPantalla + paso.fadeOut,
        ease: "Sine.easeInOut"
      });
    }
  }

  private desaparecerPasoActual(paso: PasoCinematica, onCloseCallback?: () => void) {
    if (!this.isFlujoActivo) return;

    // Fade out de la imagen y de cualquier texto o botón que siga activo
    const objetosOut: any[] = [this.imagenActual];
    this.textosActivos.forEach(t => {
      // Solo hacer fadeout de los textos que sigan mostrándose
      if (t.active && t.alpha > 0) objetosOut.push(t);
    });
    this.botonesActivos.forEach(b => {
      if (b.active && b.alpha > 0) objetosOut.push(b);
    });

    this.tweens.add({
      targets: objetosOut,
      alpha: 0,
      duration: paso.fadeOut || 500,
      ease: "Linear",
      onComplete: () => {
        if (!this.isFlujoActivo) return;
        
        if (onCloseCallback) {
          onCloseCallback();
        } else {
          this.pasoIndex++;
          this.mostrarPasoActual();
        }
      }
    });
  }

  private mostrarOpciones(opciones: import("@cinematicas/TiposCinematica").OpcionCinematica[]) {
    if (!this.isFlujoActivo) return;

    const { width, height } = this.scale;
    const btnHeight = 60;
    const totalHeight = opciones.length * btnHeight + (opciones.length - 1) * 20;
    let startY = (height / 2) - (totalHeight / 2);

    opciones.forEach((opc) => {
      const btn = this.add.text(width / 2, startY, opc.texto, {
        fontFamily: "Arial Black",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#222222",
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

      const hitArea = new Phaser.Geom.Rectangle(0, 0, btn.width, btn.height);
      btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      btn.on('pointerover', () => btn.setBackgroundColor("#ff5555"));
      btn.on('pointerout', () => btn.setBackgroundColor("#222222"));

      btn.on('pointerdown', () => {
        // Al elegir una opción, detener el flujo y proceder con fade out general
        btn.setBackgroundColor("#00ff00");
        
        this.time.delayedCall(200, () => {
          this.procesarDecision(opc);
        });
      });

      this.botonesActivos.push(btn);
      startY += btnHeight + 20;
    });

    // Fade in de los botones
    this.tweens.add({
      targets: this.botonesActivos,
      alpha: 1,
      duration: 500,
      ease: "Linear"
    });
  }

  private procesarDecision(opcion: import("@cinematicas/TiposCinematica").OpcionCinematica) {
    if (!this.configActual) return;
    const pasoActual = this.configActual.pasos[this.pasoIndex];
    
    this.desaparecerPasoActual(pasoActual, () => {
      if (opcion.accion === "cambiar_escena") {
        this.isFlujoActivo = false;
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(opcion.destino);
        });
      } else if (opcion.accion === "cambiar_cinematica") {
        // Reiniciamos con la nueva cinemática
        this.scene.restart({ idCinematica: opcion.destino });
      } else if (opcion.accion === "cargar_nivel") {
        this.isFlujoActivo = false;
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(ESCENAS.JUEGO, { idNivel: opcion.destino });
        });
      }
    });
  }

  private finalizarCinematica() {
    this.isFlujoActivo = false;
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Transición final
      this.scene.start(this.configActual.escenaSiguiente);
    });
  }
}
