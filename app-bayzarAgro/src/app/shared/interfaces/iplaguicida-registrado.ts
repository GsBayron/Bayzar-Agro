export interface IPlaguicidaRegistrado {
  id_plaguicida_registrado?: number;
  numero_registro?: string | null;
  nombre_comercial: string;
  ingrediente_activo?: string | null;
  tipo_plaguicida?: string | null;
  cultivo_autorizado?: string | null;
  plaga_objetivo?: string | null;
  titular?: string | null;
  estado_registro?: string | null;
  fuente?: string | null;
  estado: number;
}