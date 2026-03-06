from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class EmpresaData(BaseModel):
    nombre: str
    tipo: Literal['publica', 'privada']
    cuit: str
    sector: str
    pais: str
    fechaFundacion: str
    empleados: str
    sitioWeb: str
    descripcion: str

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
