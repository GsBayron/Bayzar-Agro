export interface IFertilizanteRegistrado {
  id_fertilizante_registrado?: number;
  numero_registro?: string | null;
  nombre_comercial: string;
  composicion?: string | null;
  tipo_fertilizante?: string | null;
  fabricante?: string | null;
  estado_registro?: string | null;
  fuente?: string | null;
  estado: number;
}