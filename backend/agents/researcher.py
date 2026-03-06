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
    """
    prompt = f"""
    Realiza una investigación profunda (Due Diligence Research) de la empresa argentina o multinacional:
    Nombre: {nombre}
    CUIT: {cuit}
    Sector: {sector}

    Busca y proporciona información reciente y veraz sobre:
    1. Noticias de mercado, reputacionales o legales recientes.
    2. Datos corporativos básicos (empleados, sede, descripción).
    3. Posibles riesgos (legales, operacionales, de mercado).
    4. Oportunidades de mercado en su sector.
    5. Principales competidores y sus fortalezas.
    6. Datos financieros estimados (o reales si es pública) como ingresos, ratios o deuda.

    REGLA ESTRICTA 1: Toda la información que des DEBE venir de tu búsqueda en Google en tiempo real.
    REGLA ESTRICTA 2: No inventes juicios, riesgos o noticias si no los encuentras explícitamente.
    REGLA ESTRICTA 3: Proporciona las URLs originales en los campos de 'url' o 'fuente'.
    """

    print(f"[*] Iniciando investigación de {nombre} (Gemini + Búsqueda)...")
    
    # Modelo 2.0 Flash es el recomendado actual para respuestas rápidas, json, y búsqueda web
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            # Configurar para que devuelva un JSON estructurado con el modelo de Pydantic
            response_mime_type="application/json",
            response_schema=ResearchData,
            # Activar el anclaje a la búsqueda de Google
            tools=[{"google_search": {}}],
            temperature=0.1, # Temperatura baja para minimizar creatividad / alucinaciones
        ),
    )

    # El SDK parsea y valida automáticamente si lo casteamos o bien podemos leer response.text que ya es JSON
    # Pydantic puede validar el string
    try:
        return ResearchData.model_validate_json(response.text)
    except Exception as e:
        print("Error validando JSON:", response.text)
        raise e
