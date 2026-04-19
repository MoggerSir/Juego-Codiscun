import { ClaveEscena } from "@constantes/constantes-escenas";

export interface TextoCinematica {
  contenido: string; // El texto a mostrar
  startTime?: number; // Cuándo empieza a mostrarse el texto (en milisegundos desde el inicio del paso)
  duration?: number; // Cuánto dura el texto en pantalla
  x?: number; // Relativo al centro si no se especifica, o porcentaje. Mejor manejar exacto o calculable
  y?: number;
  ancho?: number; // WordWrap
  estilo?: Phaser.Types.GameObjects.Text.TextStyle; // Configuración de fuente, color, stroke
}

export interface OpcionCinematica {
  texto: string; // Lo que dice el botón
  accion: "cambiar_escena" | "cambiar_cinematica" | "cargar_nivel";
  destino: ClaveEscena | string; // Ej: ESCENAS.NIVELES, 'intro_parte2' o '1' (para el nivel)
}

export interface PasoCinematica {
  imagenRuta: string; // Ruta de la imagen (ej: "assets/cinematicas-img/escena1.jpeg")
  imagenClave: string; // Clave para la caché de Phaser
  duracionEnPantalla: number; // Tiempo que se queda la imagen en ms (sin contar fade)
  fadeIn: number; // Duración del fade in en ms
  fadeOut: number; // Duración del fade out en ms
  escala?: number; // Para ajustar tamaño de la imagen si es muy grande. Default 1
  x?: number; // Posición X (por defecto el centro del canvas)
  y?: number; // Posición Y (por defecto el centro del canvas)
  textos?: TextoCinematica[]; // Opcional, lista de textos a mostrar secuencialmente o juntos
  opciones?: OpcionCinematica[]; // Opcional, botones de decisión al final del paso
  efecto?: "ninguno" | "zoom_in" | "zoom_out"; // Opcional: efecto leve de escala mientras está en pantalla
}

export interface ConfiguracionCinematica {
  id: string; // Identificador (ej. "intro")
  musicaClave?: string; // Por si quisiéramos cambiar la música
  pasos: PasoCinematica[]; // Lista de imágenes/secuencias
  escenaSiguiente: ClaveEscena | string; // A dónde ir después de terminar ("EscenaNiveles", "EscenaJuego", etc)
}
