import { ESCENAS } from "@constantes/constantes-escenas";
import { ConfiguracionCinematica } from "./TiposCinematica";

const baseEstiloTexto = {
  fontFamily: "Arial Black",
  fontSize: "24px",
  color: "#ffffff",
  stroke: "#000000",
  strokeThickness: 6,
  align: "center",
};

export const CINEMATICA_INTRO: ConfiguracionCinematica = {
  id: "intro",
  escenaSiguiente: ESCENAS.NIVELES, // Al terminar la intro, enviar a la selección de niveles
  pasos: [
    {
      imagenRuta: "assets/cinematicas-img/escena1.jpeg",
      imagenClave: "intro_escena1",
      duracionEnPantalla: 2000,
      fadeIn: 1000,
      fadeOut: 500,
      escala: 0.5,
      efecto: "zoom_in",
      textos: [
        {
          contenido:
            "Fernanda se preparaba para salir de fiesta con sus amigas",
          y: 500,
          ancho: 800,
          estilo: baseEstiloTexto,
        },
      ],
    },
    {
      imagenRuta: "assets/cinematicas-img/escena2.jpeg",
      imagenClave: "intro_escena2",
      duracionEnPantalla: 3000,
      fadeIn: 500,
      fadeOut: 500,
      escala: 1.0,
      textos: [
        {
          contenido: "",
          y: 50,
          ancho: 800,
          estilo: baseEstiloTexto,
        },
      ],
    },
    {
      imagenRuta: "assets/cinematicas-img/escena3.jpeg",
      imagenClave: "intro_escena3",
      duracionEnPantalla: 2500,
      fadeIn: 500,
      fadeOut: 500,
      escala: 1.0,
      efecto: "zoom_out",
      textos: [
        {
          contenido:
            "Ella se preparo, se puso linda su amiga llaba, nada le importo",
          y: 500,
          ancho: 800,
          estilo: baseEstiloTexto,
        },
      ],
    },
    {
      imagenRuta: "assets/cinematicas-img/escena4.jpeg",
      imagenClave: "intro_escena4",
      duracionEnPantalla: 2500,
      fadeIn: 500,
      fadeOut: 500,
      escala: 1.0,
      textos: [
        {
          contenido: "",
          y: 50,
          ancho: 800,
          estilo: baseEstiloTexto,
        },
      ],
    },
    {
      imagenRuta: "assets/cinematicas-img/escena5.jpeg",
      imagenClave: "intro_escena5",
      duracionEnPantalla: 4000,
      fadeIn: 1000,
      fadeOut: 1500,
      escala: 1.0,
      efecto: "zoom_in",
      textos: [
        {
          contenido: "Amiga: ¿esta como... muy aburrido no?",
          y: 500,
          startTime: 0, // Empieza inmediatamente
          duration: 2000, // Desaparece a los 2 segundos
          estilo: { ...baseEstiloTexto, color: "#9821b6ff" },
        },
        {
          contenido: "Fernanda: Sí, vamos a otro lado.",
          y: 500,
          startTime: 2500, // Empieza a los 2.5 segundos (después de que la amiga se calla)
          // duration: Si omites el duration, se queda en pantalla hasta que acabe la imagen entera
          estilo: { ...baseEstiloTexto, color: "#f520eaff" },
        },
      ],
    },
    {
      imagenRuta: "assets/cinematicas-img/escena6.jpeg",
      imagenClave: "intro_escena6",
      duracionEnPantalla: 3000,
      fadeIn: 500,
      fadeOut: 500,
      escala: 1.0,
      textos: [
        {
          contenido: "Amiga: esta apunto de ponerse interesante...",
          y: 500,
          ancho: 800,
          estilo: { ...baseEstiloTexto, color: "#9821b6ff" },
        },
      ],
    },
    {
      imagenRuta: "assets/cinematicas-img/escena7.jpeg",
      imagenClave: "intro_escena7",
      duracionEnPantalla: 4000,
      fadeIn: 500,
      fadeOut: 1000,
      escala: 0.5,
      efecto: "zoom_in",
      textos: [
        {
          contenido:
            "los dos jovenes comenzaron a ligar en la fiesta hasta que una cosa llevo a la otra y se fueron a los baños...",
          y: 500,
          ancho: 800,
          estilo: baseEstiloTexto,
        },
      ],
    },
    {
      imagenRuta: "assets/cinematicas-img/escena8.jpeg",
      imagenClave: "intro_escena8",
      duracionEnPantalla: 4000,
      fadeIn: 500,
      fadeOut: 1000,
      escala: 0.5,
      efecto: "zoom_in",
      opciones: [
        {
          texto: "pedirle usar condon",
          accion: "cambiar_escena",
          destino: ESCENAS.MENU,
        },
        {
          texto: "no pedirle usar condon",
          accion: "cargar_nivel",
          destino: "nivel-1",
        },
      ],
    },
  ],
};

// Mapa central para indexar las cinemáticas por ID
export const RegistroCinematicas: Record<string, ConfiguracionCinematica> = {
  [CINEMATICA_INTRO.id]: CINEMATICA_INTRO,
};
