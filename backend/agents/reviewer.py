import os
from google import genai
from google.genai import types
from models import ResearchData, ResultadoDueDiligence, EmpresaData
from dotenv import load_dotenv

load_dotenv()

client = genai.Client()

def analyze_and_score(empresa: EmpresaData, research: ResearchData) -> ResultadoDueDiligence:
    """
    Agente Evaluador (Critic): Revisa el research emitido por el agente 1 y genera la 
    evaluación final y el puntaje estructurado (Due Diligence Scoring).
    """
    prompt = f"""
    Eres un analista experto en Due Diligence (Risk & Compliance). 
    Se ha recolectado la siguiente información de la empresa {empresa.nombre} (CUIT: {empresa.cuit}):

    DATOS DE RESEARCH RECOPILADOS:
    {research.model_dump_json(indent=2)}

    TU TAREA:
    1. Lee cuidadosamente todo el research JSON aportado.
    2. Identifica si hay incoherencias obvias o alucinaciones. Si una noticia grave no tiene fuente o url razonable, bájale la prioridad.
    3. Construye un Score completo evaluando 6 categorías (legal, financiero, operacional, mercado, tecnologia, sostenibilidad).
    4. Por cada ítem crítico (ej. ratio deuda, juicios), asigna un estado 'aprobado', 'revisar' o 'rechazado' y justifica con la evidencia encontrada en el JSON.
    5. Asigna el puntaje total, calcula el porcentaje y emite un veredicto y un resumen ejecutivo formal y conservador.

    Devuelve EXACTAMENTE el esquema de datos esperado.
    """

    print(f"[*] Evaluando y calificando Due Diligence para {empresa.nombre}...")

    # Utilizamos 2.5 Flash o Pro para razonamiento complejo sobre JSONs grandes sin búsqueda web (solo razonamiento)
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ResultadoDueDiligence,
            temperature=0.2, # Ligeramente mayor porque debe redactar un buen resumen
        ),
    )

    try:
        return ResultadoDueDiligence.model_validate_json(response.text)
    except Exception as e:
        print("Error validando JSON Analizador:", response.text)
        raise e
