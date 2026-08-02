import { IIngreso } from './iingreso';
import { ICosto } from './icosto';
import { IProduccion } from './iproduccion';

export interface IReporteFiltros {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  id_usuario?: number | null;
  id_finca?: number | null;
  id_cultivo?: number | null;
}

export interface IResumenFinanciero {
  total_ingresos: number;
  total_costos: number;
  ganancia_estimada: number;
  margen_ganancia: number;
  cantidad_ingresos: number;
  cantidad_costos: number;
  cantidad_producciones: number;
}

export interface IIngresoPorCultivo {
  id_cultivo: number;
  cultivo: string;
  finca: string;
  total_ingresos: number;
  cantidad_ingresos: number;
}

export interface ICostoPorCultivo {
  id_cultivo: number;
  cultivo: string;
  finca: string;
  total_costos: number;
  cantidad_costos: number;
}

export interface ICostoPorTipo {
  tipo_costo: string;
  total_costos: number;
  cantidad_costos: number;
}

export interface IProduccionPorCultivo {
  id_cultivo: number;
  cultivo: string;
  finca: string;
  unidad_medida: string;
  total_producido: number;
  cantidad_registros: number;
}

export interface IReporteFinanciero {
  filtros: IReporteFiltros;
  resumen: IResumenFinanciero;

  ingresos_por_cultivo: IIngresoPorCultivo[];
  costos_por_cultivo: ICostoPorCultivo[];
  costos_por_tipo: ICostoPorTipo[];
  produccion_por_cultivo: IProduccionPorCultivo[];

  ultimos_ingresos: IIngreso[];
  ultimos_costos: ICosto[];
  ultimas_producciones: IProduccion[];
}