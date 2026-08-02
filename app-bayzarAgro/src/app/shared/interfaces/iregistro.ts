export interface IRegistro {
  nombre: string;
  apellidos?: string | null;
  correo: string;
  telefono?: string | null;
  secreto: string;
  confirmar_secreto: string;
  plan: string;
}

export interface IRespuestaRegistro {
  message: string;
  requiere_pago: boolean;
  redirect: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellidos?: string | null;
    correo: string;
    rol: string;
    estado_pago: string;
  };
}