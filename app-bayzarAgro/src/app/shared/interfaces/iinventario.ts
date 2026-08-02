import { Ifinca } from './ifinca';
import { IPlaguicidaRegistrado } from './iplaguicida-registrado';
import { IFertilizanteRegistrado } from './ifertilizante-registrado';

export interface IInventario {
  id_inventario?: number;
  id_usuario?: number;
  id_finca?: number | null;
  tipo_producto: string;
  id_plaguicida_registrado?: number | null;
  id_fertilizante_registrado?: number | null;
  nombre_manual?: string | null;
  descripcion_manual?: string | null;
  cantidad: number;
  unidad_medida: string;
  fecha_compra?: string | null;
  fecha_vencimiento?: string | null;
  ubicacion?: string;
  observaciones?: string;
  estado: number;
  fecha_registro?: string;
  finca?: Ifinca;
  plaguicida?: IPlaguicidaRegistrado;
  fertilizante?: IFertilizanteRegistrado;
}