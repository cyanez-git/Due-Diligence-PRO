# Plan de Implementación: Backend de Deep Research con IA

## Objetivo
Transformar la aplicación React "Due Diligence Pro" de una maqueta estática con datos "hardcodeados" a un Frontend Ligero conectado a un Backend Inteligente construido en Python.

## Arquitectura

### 1. El Frontend (React)
- **Rol:** Actúa como cliente ligero. Recolecta el CUIT y renderiza la interfaz.
- **Cambios realizados:** Se eliminó toda regla de negocio (scoring, switches, textos estáticos). Se creó un middleware `src/services/api.ts` que se encarga exclusivamente de rutear las peticiones `fetch` hacia el Backend local (`localhost:8000`).

### 2. El Backend (Python + FastAPI)
- **Rol:** Motor que controla el ciclo de vida del *Deep Research* garantizando seguridad y orquestación.
- **Rutas clave:**
  - `GET /api/empresas/{cuit}`: Validación de CUIT rápida.
  - `POST /api/research`: Ejecuta el Agente Investigador.
  - `POST /api/analyze`: Ejecuta el Agente Auditor.

### 3. El Motor de IA (Google Gemini 2.0)
- **Agente Investigador:** Utiliza búsqueda web en tiempo real (Google Search Grounding) para encontrar noticias y datos corporativos recientes del CUIT especificado.
- **Agente Auditor:** Módulo "Reviewer" que toma el JSON en crudo encontrado por el investigador, audita las URL para evitar alucinaciones (inventos de IA) y genera un Dictamen de Scoring Formal (Aprobado/Revisar/Rechazado).

## Instalación y Ejecución

*Nota: Se requiere una clave API de Google Gemini (Google AI Studio) guardada en un `backend/.env` bajo el nombre `GEMINI_API_KEY` para que el sistema funcione.*

```bash
# 1. Navegar a la carpeta backend
cd backend

# 2. Instalar dependencias 
pip install -r requirements.txt

# 3. Levantar el servidor de Python en Uvicorn (Puerto 8000)
python -m uvicorn main:app --port 8000
```
