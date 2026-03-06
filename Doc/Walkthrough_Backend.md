# Manual de Funcionalidad: Deep Research Backend

## ¿Cómo Funciona el Deep Research?

El sistema actual ha reemplazado exitosamente los datos de simulación por un Flujo Asíncrono de Inteligencia Artificial que opera en dos fases de Agentic Workflow (Doble Factor).

### Fase 1: Recolección y Búsqueda Activa (Agente Investigador)
Cuando el usuario hace clic en "Realizar Research" en la interfaz:
1. React lanza un `POST` a `/api/research`.
2. Python FastAPI recibe la petición y despierta al `researcher.py`.
3. Gemini SDK enciende su herramienta de *Búsqueda de Google en Vivo* e investiga al CUIT/Empresa buscada en toda internet.
4. Extrae noticias, detecta competidores y evalúa tamaño.
5. El agente convierte toda esa masa de texto de la web y la inserta en un modelo de datos estructurado (Pydantic Models) con forma de JSON.

### Fase 2: Puntuación y Veracidad (Agente Auditor)
Cuando la Fase 1 termina y el usuario hace clic en "Analizar Resultados":
1. React lanza un `POST` a `/api/analyze` enviando los datos recolectados.
2. FastAPI despierta al `reviewer.py`.
3. Otro agente de Gemini actúa con el rol de un Oficial de Riesgo y Cumplimiento estricto. Audita los datos aportados por la búsqueda web, emite un "Scoring" preciso en base a las 6 métricas de Due Diligence, y redacta un *Resumen Ejecutivo* final.

### Fase 3: Renderizado
El Frontend recibe este Dictamen final y pinta los Semáforos y gráficas con total objetividad y basada en datos reales obtenidos de internet minutos antes.

> **Importante:** Cada petición de Deep Research demorará unos segundos mientras la IA busca literalmente por todo Google e internet para extraer las noticias reales del día actual sobre dicha compañía.
