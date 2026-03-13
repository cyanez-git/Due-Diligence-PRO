export interface EmpresaData {
  nombre: string;
  tipo: 'publica' | 'privada';
  identificacionFiscal: string;
  sector: string;
  pais: string;
  sitioWeb: string;
  sinSitioWeb: boolean;
  descripcion: string;
  contextoArchivo?: string; // Texto extraído del informe financiero (opcional)
}

export interface InformeFinancieroExtraido {
  nombreEmpresa?: string;
  identificacionFiscal?: string;
  sector?: string;
  tipo?: 'publica' | 'privada';
  descripcion?: string;
  ingresos?: string;
  ebitda?: string;
  deuda?: string;
  ratioDeudaCapital?: string;
  beneficioNeto?: string;
  calificacionRiesgo?: string;
  alertas: string[];
  textoCrudo?: string;
}


export interface ResearchData {
  noticias: Noticia[];
  datosFinancieros: DatosFinancieros | null;
  riesgos: Riesgo[];
  oportunidades: string[];
  competidores: Competidor[];
  datosEmpresa: DatosEmpresaEnriquecidos | null;
}

export interface DatosEmpresaEnriquecidos {
  empleados: string;
  fechaFundacion: string;
  descripcion: string;
  sede: string;
  ingresosEstimados: string;
  fuente: string;
  nombre?: string;
  sector?: string;
  tipo?: 'publica' | 'privada';
}

export interface Noticia {
  titulo: string;
  fecha: string;
  fuente: string;
  resumen: string;
  url?: string;
}

export interface DatosFinancieros {
  ingresos?: string;
  beneficioNeto?: string;
  deuda?: string;
  ratioDeudaCapital?: string;
  ebitda?: string;
  fuente: string;
}

export interface Riesgo {
  categoria: string;
  descripcion: string;
  nivel: 'alto' | 'medio' | 'bajo';
}

export interface Competidor {
  nombre: string;
  mercado: string;
  fortalezas: string[];
}

export interface ItemDueDiligence {
  id: string;
  categoria: string;
  item: string;
  descripcion: string;
  estado: 'aprobado' | 'revisar' | 'rechazado';
  puntaje: number;
  observaciones: string;
  evidencia: string[];
}

export interface ResultadoDueDiligence {
  items: ItemDueDiligence[];
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
  recomendacion: 'aprobado' | 'condicional' | 'rechazado';
  resumenEjecutivo: string;
  fechaAnalisis: string;
}

export interface InformeCompleto {
  empresa: EmpresaData;
  research: ResearchData;
  resultado: ResultadoDueDiligence;
}
