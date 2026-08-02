export interface IPlan {
  id_plan: number;
  nombre: string;
  codigo: string;
  precio_mensual: number | string;
  descripcion?: string | null;
  limite_usuarios?: number | null;
  limite_fincas?: number | null;
  almacenamiento_mb?: number | null;
  soporte?: string | null;
  destacado: number;
  estado: number;
  fecha_registro?: string;
}