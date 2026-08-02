import { Ifinca } from './ifinca';
import { ICultivo } from './icultivo';
import { IProduccion } from './iproduccion';
import { IUsuario } from './iusuario';

export interface IIngreso {
  id_ingreso?: number;

  id_usuario?: number;
  id_finca: number;
  id_cultivo: number;
  id_produccion?: number | null;

  fecha: string;
  descripcion: string;

  cantidad_vendida: number;
  unidad_medida: string;

  precio_unitario: number;
  monto_total: number;

  cliente?: string | null;
  destino?: string | null;
  observaciones?: string | null;

  estado: number;
  fecha_registro?: string;

  usuario?: IUsuario;
  finca?: Ifinca;
  cultivo?: ICultivo;
  produccion?: IProduccion;
}