export interface IPerfil {
  nombre: string;
  apellidos?: string | null;
  correo: string;
  telefono?: string | null;
  acceso: string;
  secreto?: string | null;
}