import os
from google import genai
from google.genai import types
from models import ResearchData
from dotenv import load_dotenv

load_dotenv()

# Configuración del cliente usando la variable de entorno automática
client = genai.Client()

def investigate_company(cuit: str, nombre: str, sector: str) -> ResearchData:
    """
    Agente Investigador: Ejecuta un Deep Research usando la API de Google Gemini anclada a Búsqueda.
    NOTA: Gemini no permite combinar google_search con response_mime_type="application/json" en una
    sola llamada. Por eso usamos dos pasos: primero buscamos con grounding, luego estructuramos el JSON.
    """
    search_prompt = f"""
    Realiza una investigación profunda (Due Diligence Research) de la empresa argentina o multinacional:
    Nombre: {nombre}
    CUIT: {cuit}
    Sector: {sector}

    Busca y proporciona información reciente y veraz sobre:
    1. Noticias de mercado, reputacionales o legales recientes (con fechas y URLs).
    2. Datos corporativos básicos (empleados, sede, descripción, año de fundación).
    3. Posibles riesgos (legales, operacionales, de mercado, regulatorios).
    4. Oportunidades de mercado en su sector.
    5. Principales competidores y sus fortalezas.
    6. Datos financieros estimados (o reales si es pública) como ingresos, ratios o deuda.

    REGLA ESTRICTA 1: Toda la información DEBE venir de tu búsqueda en Google en tiempo real.
    REGLA ESTRICTA 2: No inventes juicios, riesgos o noticias que no encuentres explícitamente.
    REGLA ESTRICTA 3: Detalla las URLs originales de cada fuente encontrada.
    """

    print(f"[*] PASO 1: Grounded search de {nombre} con Google Search...")
    
    # PASO 1: Búsqueda con grounding (sin JSON schema — incompatible con tools)
    search_response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=search_prompt,
        config=types.GenerateContentConfig(
            tools=[{"google_search": {}}],
            temperature=0.1,
        ),
    )

    raw_research = search_response.text
    if not raw_research:
        raise ValueError("El modelo no devolvió texto en el paso de búsqueda. Verificar cuota o API key.")

    print(f"[*] PASO 2: Estructurando resultado como JSON para {nombre}...")

    # PASO 2: Estructurar el texto libre como JSON usando el schema de Pydantic (sin google_search)
    structure_prompt = f"""
    Dado el siguiente texto de investigación sobre la empresa "{nombre}", extrae y organiza toda la 
    información en el formato JSON solicitado. Conserva todas las URLs y fuentes mencionadas.
    Si algún dato no está disponible en el texto, usa null o una lista vacía según corresponda.
    No inventes información que no esté en el texto.

    TEXTO DE INVESTIGACIÓN:
    ---
    {raw_research}
    ---
    """

    structured_response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=structure_prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ResearchData,
            temperature=0.0,
        ),
    )

    try:
        return ResearchData.model_validate_json(structured_response.text)
    except Exception as e:
        print("Error validando JSON en PASO 2:", structured_response.text)
        raise e
