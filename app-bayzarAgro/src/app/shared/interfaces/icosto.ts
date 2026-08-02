import { Ifinca } from './ifinca';
import { ICultivo } from './icultivo';
import { IActividad } from './iactividad';
import { IUsuario } from './iusuario';

export interface ICosto {
  id_costo?: number;

  id_usuario?: number;
  id_finca?: number | null;
  id_cultivo?: number | null;
  id_actividad?: number | null;

  tipo_costo: string;
  descripcion: string;

  cantidad_personas?: number | null;
  horas_trabajadas?: number | null;
  costo_por_hora?: number | null;

  monto: number;
  fecha: string;
  observaciones?: string | null;

  estado: number;
  fecha_registro?: string;

  usuario?: IUsuario;
  finca?: Ifinca;
  cultivo?: ICultivo;
  actividad?: IActividad;
}