import { ICultivo } from './icultivo';
import { IPlagaRegistrada } from './iplaga-registrada';

export interface IPlagaCultivo {
  id_plaga_cultivo?: number;
  id_cultivo: number;
  id_plaga_registrada?: number | null;
  nombre_manual?: string | null;
  tipo_plaga_manual?: string | null;
  fecha_deteccion: string;
  nivel_riesgo: string;
  estado_plaga: string;
  descripcion?: string;
  observaciones?: string;
  estado: number;
  cultivo?: ICultivo;
  plaga?: IPlagaRegistrada;
}