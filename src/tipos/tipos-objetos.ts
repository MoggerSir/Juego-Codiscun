export interface DatosPopup {
  titulo: string;
  mensaje: string;
  colorBorde?: string;
}

export type ListaMensajes = Record<string, DatosPopup>;
