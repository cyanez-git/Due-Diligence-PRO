import os
from google import genai
from google.genai import types
from models import InformeFinancieroExtraido
from dotenv import load_dotenv

load_dotenv()

client = genai.Client()

# Límite de caracteres para evitar saturar el contexto de Gemini
MAX_CHARS = 50_000


def parse_informe(texto_crudo: str, pais: str) -> InformeFinancieroExtraido:
    """
    Agente Parser de Informes Financieros.
    Recibe el texto extraído del archivo (PDF, HTML o TXT) y usa Gemini para
    estructurar los datos relevantes en el modelo InformeFinancieroExtraido.
    """

    # Truncar si el texto es demasiado largo
    texto_para_analizar = texto_crudo[:MAX_CHARS]
    fue_truncado = len(texto_crudo) > MAX_CHARS

    prompt = f"""
    Eres un analista financiero experto. Se te proporciona el texto de un informe financiero/crediticio
    de una empresa de {pais} (puede ser un informe NOSIS, Veraz, SERASA, BCU, o equivalente).

    Tu tarea es extraer la información estructurada disponible en el texto.
    Si un dato no está presente o no puedes determinarlo con certeza, devuelve null para ese campo.
    No inventes información que no esté explícitamente en el texto.

    REGLAS IMPORTANTES:
    - Para el campo "alertas", incluye CUALQUIER observación negativa: juicios, protestos,
      inhibiciones, cheques rechazados, deudas vencidas, inhabilitaciones, quiebras, etc.
    - Para "calificacionRiesgo" busca scores crediticios, categorías de riesgo o clasificaciones
      del tipo A/B/C, Alto/Medio/Bajo, o similares.
    - Para "tipo", determina si es empresa pública (estado) o privada.
    - Para los campos monetarios (ingresos, deuda, ebitda, etc.) incluye la moneda y período si
      están disponibles (ej: "ARS 15.000.000 - Ejercicio 2023").

    TEXTO DEL INFORME ({pais}){" [TRUNCADO A 50.000 CARACTERES]" if fue_truncado else ""}:
    ---
    {texto_para_analizar}
    ---
    """

    print(f"[*] Agente Parser: estructurando informe financiero de {pais} ({len(texto_para_analizar)} chars)...")

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=InformeFinancieroExtraido,
            temperature=0.0,
        ),
    )

    try:
        resultado = InformeFinancieroExtraido.model_validate_json(response.text)
        # Siempre adjuntamos el texto crudo completo (truncado también) para usarlo
        # más adelante como contexto en researcher y reviewer
        resultado.textoCrudo = texto_para_analizar
        return resultado
    except Exception as e:
        print("Error validando JSON del Parser de Informe:", response.text)
        raise e
