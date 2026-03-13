from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class EmpresaData(BaseModel):
    nombre: str
    tipo: Literal['publica', 'privada']
    identificacionFiscal: str
    sector: str
    pais: str
    sitioWeb: str
    sinSitioWeb: bool = False
    descripcion: str = ""
    contextoArchivo: Optional[str] = None  # Texto extraído del informe financiero subido

class InformeFinancieroExtraido(BaseModel):
    """Datos estructurados extraídos por IA de un informe financiero (NOSIS, Veraz, SERASA, etc.)"""
    nombreEmpresa: Optional[str] = Field(None, description="Nombre de la empresa según el informe")
    identificacionFiscal: Optional[str] = Field(None, description="CUIT, CNPJ, RUT u otro ID fiscal encontrado")
    sector: Optional[str] = Field(None, description="Sector o industria de la empresa")
    tipo: Optional[Literal['publica', 'privada']] = Field(None, description="Tipo de empresa")
    descripcion: Optional[str] = Field(None, description="Descripción o actividad principal de la empresa")
    ingresos: Optional[str] = Field(None, description="Ingresos o facturación registrada")
    ebitda: Optional[str] = Field(None, description="EBITDA si está disponible")
    deuda: Optional[str] = Field(None, description="Deuda total registrada")
    ratioDeudaCapital: Optional[str] = Field(None, description="Ratio deuda/capital si está disponible")
    beneficioNeto: Optional[str] = Field(None, description="Beneficio o resultado neto")
    calificacionRiesgo: Optional[str] = Field(None, description="Score o calificación de riesgo crediticio del informe (ej: A, B, Alto, Medio)")
    alertas: List[str] = Field(default_factory=list, description="Alertas, inhabilidades, juicios, protestos u observaciones negativas detectadas")
    textoCrudo: Optional[str] = Field(None, description="Texto completo del informe (se usa como contexto en los agentes)")


class DatosEmpresaEnriquecidos(BaseModel):
    empleados: str = Field(description="Rango o número estimado de empleados")
    fechaFundacion: str = Field(description="Año o fecha exacta de fundación")
    descripcion: str = Field(description="Descripción corporativa y misión de la empresa")
    sede: str = Field(description="País y/o ciudad sede")
    ingresosEstimados: str = Field(description="Estimación en USD de sus ingresos según su industria")
    fuente: str = Field(description="URL o fuente de donde se obtuvo esta información")
    nombre: Optional[str] = None
    sector: Optional[str] = None
    tipo: Optional[Literal['publica', 'privada']] = None

class Noticia(BaseModel):
    titulo: str
    fecha: str
    fuente: str
    resumen: str
    url: Optional[str] = Field(description="Link de la noticia original para evitar alucinaciones. MUY IMPORTANTE.")

class DatosFinancieros(BaseModel):
    ingresos: Optional[str] = None
    beneficioNeto: Optional[str] = None
    deuda: Optional[str] = None
    ratioDeudaCapital: Optional[str] = None
    ebitda: Optional[str] = None
    fuente: str = Field(description="Si es pública: Enlace al Balance general o reporte financiero. Si es privada: Justificación macroeconómica.")

class Riesgo(BaseModel):
    categoria: str = Field(description="Regulatorio, Mercado, Operacional, Legal, Ciberseguridad, etc.")
    descripcion: str
    nivel: Literal['alto', 'medio', 'bajo']

class Competidor(BaseModel):
    nombre: str
    mercado: str
    fortalezas: List[str]

class ResearchData(BaseModel):
    noticias: List[Noticia]
    datosFinancieros: Optional[DatosFinancieros] = None
    riesgos: List[Riesgo]
    oportunidades: List[str]
    competidores: List[Competidor]
    datosEmpresa: Optional[DatosEmpresaEnriquecidos] = None

# ---- Modelos Scoring Due Diligence ----

class ItemDueDiligence(BaseModel):
    id: str
    categoria: str
    item: str
    descripcion: str
    estado: Literal['aprobado', 'revisar', 'rechazado']
    puntaje: int = Field(description="Puntaje sobre 10 para este item evaluable")
    observaciones: str
    evidencia: List[str] = Field(description="Breve justificación con URLs o documentos mencionados")

class ResultadoDueDiligence(BaseModel):
    items: List[ItemDueDiligence]
    puntajeTotal: int = Field(description="Suma final de puntajes. Máximo depende de items.")
    puntajeMaximo: int
    porcentaje: int = Field(description="0-100 calculando (total/maximo)*100")
    recomendacion: Literal['aprobado', 'condicional', 'rechazado'] = Field(description="aprobado (>75%), condicional (50-75%), rechazado (<50%)")
    resumenEjecutivo: str = Field(description="Minucioso y profesional redactado corporativo interpretando el análisis final generado")
    fechaAnalisis: str
