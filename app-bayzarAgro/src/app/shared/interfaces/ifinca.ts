export interface Ifinca {
  id_finca?: number;
  id_usuario?: number;
  nombre: string;
  ubicacion?: string | null;
  provincia?: string | null;
  canton?: string | null;
  distrito?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  area?: number | null;
  unidad_area?: string | null;
  descripcion?: string | null;
  estado: number | boolean;
  fecha_registro?: string;
}
