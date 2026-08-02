import { IUsuario } from './iusuario';

export interface IRespuestaLogin {
  message: string;
  token: string;
  usuario: IUsuario;
}
