export interface IUsuario {
  id_usuario?: number;
  id_plan?: number | null;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  acceso: string;
  secreto?: string;
  rol: string;
  estado: boolean;
  estado_pago?: string | null;
  fecha_registro?: string;
}
