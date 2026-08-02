export interface IClima {
  finca: {
    id_finca: number;
    nombre: string;
    latitud: number;
    longitud: number;
  };

  clima_actual: {
    temperatura: number | null;
    humedad: number | null;
    lluvia: number | null;
    viento: number | null;
    probabilidad_lluvia: number | null;
  };

  recomendacion: string;
}