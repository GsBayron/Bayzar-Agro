import { IActividad } from './iactividad';
import { IInventario } from './iinventario';
import { IPlagaCultivo } from './iplaga-cultivo';
import { ICosto } from './icosto';
import { IIngreso } from './iingreso';
import { IProduccion } from './iproduccion';
import { IIngresoAgricultor } from './iingreso-agricultor';

export interface IDashboard {

  // Administrador
  usuarios?: number;
  agricultores?: number;
  fincas?: number;
  cultivos?: number;
  inventario?: number;
  plagas?: number;

  // Agricultor
  mis_fincas?: number;
  mis_cultivos?: number;
  mi_inventario?: number;
  mis_plagas?: number;

  // Compartidos
  actividades_hoy: number;
  actividades_vencidas: number;
  productos_por_vencer: number;

  // Totales
  total_costos: number;
  total_ingresos: number;
  ganancia_estimada: number;

  // Alertas
  registros_produccion: number;
  alertas_criticas: number;

  // Detalles
  ultimos_costos: ICosto[];
  ultimos_ingresos: IIngreso[];
  ultimas_producciones: IProduccion[];

  // Listados
  proximas_actividades: IActividad[];
  plagas_criticas: IPlagaCultivo[];
  productos_vencen_pronto: IInventario[];

  ingresos_por_agricultor: IIngresoAgricultor[];
}