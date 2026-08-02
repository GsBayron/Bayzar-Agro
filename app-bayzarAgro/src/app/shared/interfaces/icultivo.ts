import { Ifinca } from './ifinca';

export interface ICultivo {

  id_cultivo?: number;
  id_finca: number;
  nombre: string;
  tipo_cultivo?: string;
  variedad?: string;
  fecha_siembra?: string;
  fecha_estimada_cosecha?: string;
  area_sembrada?: number | null;
  cantidad_plantas?: number | null;
  distancia_siembra?: number | null;
  unidad_area?: string;
  estado_cultivo: string;
  descripcion?: string;
  estado: number;
  fecha_registro?: string;
  finca?: Ifinca;
}