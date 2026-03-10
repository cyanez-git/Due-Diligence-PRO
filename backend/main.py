import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
from models import EmpresaData, DatosEmpresaEnriquecidos, ResearchData, ResultadoDueDiligence
from agents.researcher import investigate_company
from agents.reviewer import analyze_and_score

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
