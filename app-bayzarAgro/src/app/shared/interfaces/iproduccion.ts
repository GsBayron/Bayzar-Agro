import { Ifinca } from './ifinca';
import { ICultivo } from './icultivo';
import { IUsuario } from './iusuario';

export interface IProduccion {
  id_produccion?: number;

  id_usuario?: number;
  id_finca: number;
  id_cultivo: number;

  fecha: string;

  cantidad: number;
  unidad_medida: string;

  cantidad_plantas?: number | null;

  calidad?: string | null;
  destino?: string | null;
  observaciones?: string | null;

  estado: number;
  fecha_registro?: string;

  usuario?: IUsuario;
  finca?: Ifinca;
  cultivo?: ICultivo;
}