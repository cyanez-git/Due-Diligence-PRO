import os
import io
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import pdfplumber
from bs4 import BeautifulSoup
from models import EmpresaData, DatosEmpresaEnriquecidos, ResearchData, ResultadoDueDiligence, InformeFinancieroExtraido
from agents.researcher import investigate_company
from agents.reviewer import analyze_and_score
from agents.file_parser import parse_informe

# Load API key configuration from our new .env file
load_dotenv()

if not os.getenv("GEMINI_API_KEY"):
    print("ALERTA CRÍTICA: La variable GEMINI_API_KEY no está configurada. El servidor fallará al instanciar el cliente GenAI.")

app = FastAPI(
    title="Due Diligence Pro - Deep Research AI Backend",
    description="Motor de inteligencia artificial impulsado por Google Gemini con Search Grounding para Risk Assessment.",
    version="1.1.0"
)

# Permitir al Frontend acceder al API — local y producción en Render
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# Agregar la URL de frontend de producción desde variable de entorno (ej: https://due-diligence-frontend.onrender.com)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",  # Permitir todos los subdominios de Render
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Límite de tamaño de archivo: 5 MB
# ---------------------------------------------------------------------------
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Extrae el texto de un archivo según su extensión.
    Soporta: .pdf, .html, .htm, .txt
    """
    name_lower = filename.lower()

    if name_lower.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text)
        return "\n".join(pages_text)

    elif name_lower.endswith((".html", ".htm")):
        soup = BeautifulSoup(file_bytes, "html.parser")
        # Eliminar scripts y estilos para quedarnos con texto limpio
        for tag in soup(["script", "style"]):
            tag.decompose()
        return soup.get_text(separator="\n", strip=True)

    elif name_lower.endswith(".txt"):
        # Intentar UTF-8, fallback a latin-1
        try:
            return file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1")

    else:
        raise ValueError(f"Formato de archivo no soportado: '{filename}'. Use PDF, HTML o TXT.")


class ResearchRequest(BaseModel):
    empresa: EmpresaData

class AnalyzeRequest(BaseModel):
    empresa: EmpresaData
    research: ResearchData

@app.get("/api/empresas/{tax_id}", response_model=DatosEmpresaEnriquecidos)
async def get_empresa_bursatil(tax_id: str):
    """
    Simulación de Base de Datos inicial u Oráculo para comprobar si un ID fiscal existe
    antes del inicio de la costosa o lenta investigación (IA).
    En un entorno productivo real, esto golpearía a la API de Nosis/AFIP u otros registros según el país.
    """
    if not tax_id or len(tax_id.replace('-', '').replace('.', '')) < 8:
        raise HTTPException(status_code=404, detail="Identificación fiscal no encontrada o inválida.")
    
    # Para fines de demostración sin conectar a AFIP real por cuota/precio:
    # Retornamos unos datos básicos base (solo como stub para evitar que la app explote si lo busca).
    return DatosEmpresaEnriquecidos(
        empleados="A definir por investigación",
        fechaFundacion="No registrada inicialmente",
        descripcion="Datos previos bloqueados. Proceda a iniciar Research.",
        sede="Argentina",
        ingresosEstimados="Desconocido",
        fuente="Validación local",
    )

@app.post("/api/parse-informe", response_model=InformeFinancieroExtraido)
async def parse_informe_financiero(
    file: UploadFile = File(...),
    pais: str = Form("Argentina"),
):
    """
    Recibe un archivo financiero (PDF/HTML/TXT) y usa Gemini IA para extraer los datos
    estructurados de la empresa. El archivo NO se almacena en el servidor.
    """
    print(f"-> Solicitud de parse-informe: archivo='{file.filename}', pais='{pais}'")

    # Validar tamaño
    file_bytes: bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"El archivo supera el límite de 5 MB ({len(file_bytes) / 1024 / 1024:.1f} MB)."
        )

    # Extraer texto
    try:
        texto = extract_text_from_file(file_bytes, file.filename or "")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not texto or len(texto.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail="No se pudo extraer texto del archivo. Verifique que el PDF no esté basado en imágenes escaneadas."
        )

    # Parsear con IA
    try:
        resultado = await asyncio.to_thread(parse_informe, texto, pais)
        return resultado
    except Exception as e:
        print("Error en parse-informe:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/research", response_model=ResearchData)
async def run_ai_deep_research(request: ResearchRequest):
    """
    Inicia el Agente Investigador. Gemini buscará en la red y formateará el ResearchData.
    Este paso puede demorar entre 10 y 25 segundos dependiendo de Google Search.
    Si empresa.contextoArchivo está presente, lo usa como fuente primaria adicional.
    """
    print(f"-> Petición de Deep Research recibida (POST /api/research): {request.empresa.nombre} ({request.empresa.pais})")
    try:
        result = await asyncio.to_thread(
            investigate_company, 
            request.empresa
        )
        return result
    except Exception as e:
        print("Error en Deep Research:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze", response_model=ResultadoDueDiligence)
async def run_ai_reviewer(request: AnalyzeRequest):
    """
    Inicia el Agente Auditor (Critic). Verifica el ResearchData JSON usando reglas 
    estructuradas de Due Diligence, puntúa usando a Gemini-2.0, y da un veredicto.
    Si empresa.contextoArchivo está presente, lo usa como fuente primaria en la evaluación.
    """
    print(f"-> Petición de Análisis recibida (POST /api/analyze): Evaluando Data de {request.empresa.nombre}")
    try:
        result = await asyncio.to_thread(
            analyze_and_score, 
            request.empresa, 
            request.research
        )
        return result
    except Exception as e:
        print("Error en Critic Rating:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "Due Diligence AI Motor online.", "version": "1.1.0"}


# Load API key configuration from our new .env file
load_dotenv()

if not os.getenv("GEMINI_API_KEY"):
    print("ALERTA CRÍTICA: La variable GEMINI_API_KEY no está configurada. El servidor fallará al instanciar el cliente GenAI.")

app = FastAPI(
    title="Due Diligence Pro - Deep Research AI Backend",
    description="Motor de inteligencia artificial impulsado por Google Gemini con Search Grounding para Risk Assessment.",
    version="1.0.0"
)

# Permitir al Frontend acceder al API — local y producción en Render
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# Agregar la URL de frontend de producción desde variable de entorno (ej: https://due-diligence-frontend.onrender.com)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",  # Permitir todos los subdominios de Render
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    empresa: EmpresaData

class AnalyzeRequest(BaseModel):
    empresa: EmpresaData
    research: ResearchData

@app.get("/api/empresas/{tax_id}", response_model=DatosEmpresaEnriquecidos)
async def get_empresa_bursatil(tax_id: str):
    """
    Simulación de Base de Datos inicial u Oráculo para comprobar si un ID fiscal existe
    antes del inicio de la costosa o lenta investigación (IA).
    En un entorno productivo real, esto golpearía a la API de Nosis/AFIP u otros registros según el país.
    """
    if not tax_id or len(tax_id.replace('-', '').replace('.', '')) < 8:
        raise HTTPException(status_code=404, detail="Identificación fiscal no encontrada o inválida.")
    
    # Para fines de demostración sin conectar a AFIP real por cuota/precio:
    # Retornamos unos datos básicos base (solo como stub para evitar que la app explote si lo busca).
    return DatosEmpresaEnriquecidos(
        empleados="A definir por investigación",
        fechaFundacion="No registrada inicialmente",
        descripcion="Datos previos bloqueados. Proceda a iniciar Research.",
        sede="Argentina",
        ingresosEstimados="Desconocido",
        fuente="Validación local",
    )

@app.post("/api/research", response_model=ResearchData)
async def run_ai_deep_research(request: ResearchRequest):
    """
    Inicia el Agente Investigador. Gemini buscará en la red y formateará el ResearchData.
    Este paso puede demorar entre 10 y 25 segundos dependiendo de Google Search.
    """
    print(f"-> Petición de Deep Research recibida (POST /api/research): {request.empresa.nombre} ({request.empresa.pais})")
    try:
        # Puesto que genai.Client() es síncrono por defecto, correremos el wrapper asíncrono básico:
        result = await asyncio.to_thread(
            investigate_company, 
            request.empresa
        )
        return result
    except Exception as e:
        print("Error en Deep Research:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze", response_model=ResultadoDueDiligence)
async def run_ai_reviewer(request: AnalyzeRequest):
    """
    Inicia el Agente Auditor (Critic). Verifica el ResearchData JSON usando reglas 
    estructuradas de Due Diligence, puntúa usando a Gemini-2.0, y da un veredicto.
    """
    print(f"-> Petición de Análisis recibida (POST /api/analyze): Evaluando Data de {request.empresa.nombre}")
    try:
        result = await asyncio.to_thread(
            analyze_and_score, 
            request.empresa, 
            request.research
        )
        return result
    except Exception as e:
        print("Error en Critic Rating:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "Due Diligence AI Motor online."}
