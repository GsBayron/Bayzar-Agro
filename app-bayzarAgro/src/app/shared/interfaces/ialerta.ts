export interface IAlerta {
  tipo: string;
  titulo: string;
  mensaje: string;
  nivel: string;
  fecha?: string | null;
  origen: string;
  id_origen: number;
}