export interface IPlagaRegistrada {
  id_plaga_registrada?: number;
  nombre_comun: string;
  nombre_cientifico?: string | null;
  tipo_plaga?: string | null;
  descripcion?: string | null;
  fuente?: string | null;
  estado: number;
}