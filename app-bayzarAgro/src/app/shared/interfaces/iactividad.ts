import { ICultivo } from './icultivo';
import { IInventario } from './iinventario';

export interface IActividad {
  id_actividad?: number;
  id_cultivo: number;
  id_inventario?: number | null;
  tipo_actividad: string;
  fecha_programada: string;
  fecha_realizacion?: string | null;
  estado_actividad: string;
  prioridad: string;
  descripcion?: string | null;
  cantidad_producto?: number | null;
  unidad_producto?: string | null;
  responsable?: string | null;
  observaciones?: string | null;
  estado: number;
  fecha_registro?: string;
  cultivo?: ICultivo;
  inventario?: IInventario;
}