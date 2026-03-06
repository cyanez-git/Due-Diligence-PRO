import type {
    EmpresaData,
    ResearchData,
    DatosEmpresaEnriquecidos,
    ResultadoDueDiligence
} from '@/types';

// En producción (Render): VITE_API_URL = "https://due-diligence-backend-onpd.onrender.com/api"
// En desarrollo local: se usa '/api' que el proxy de Vite redirige a localhost:8000
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

// Timeout en milisegundos para las operaciones de IA (2 minutos)
const RESEARCH_TIMEOUT_MS = 120_000;
const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Helper para crear un fetch con timeout vía AbortController.
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            throw new Error(
                `La solicitud tardó más de ${Math.round(timeoutMs / 1000)} segundos. ` +
                `El servidor puede estar iniciando o con alta carga. Por favor, reintente.`
            );
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Helper para manejar las respuestas de la API
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        if (response.status === 504) {
            throw new Error('El servidor tardó demasiado en responder (Gateway Timeout). ' +
                'Esto puede ocurrir la primera vez que se activa el servicio. Por favor, reintente.');
        }
        if (response.status === 503) {
            throw new Error('El servicio no está disponible en este momento. Por favor, reintente en unos segundos.');
        }
        const errorText = await response.text().catch(() => 'Error de red desconocido');
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.json();
}

/**
 * Busca datos enriquecidos de una empresa usando su CUIT.
 */
export async function buscarEmpresaPorCuit(cuit: string): Promise<DatosEmpresaEnriquecidos | null> {
    const cuitLimpio = cuit.replace(/\D/g, '');
    if (!cuitLimpio) return null;

    try {
        const response = await fetchWithTimeout(
            `${API_URL}/empresas/${cuitLimpio}`,
            {},
            DEFAULT_TIMEOUT_MS
        );
        if (response.status === 404) {
            return null;
        }
        return await handleResponse<DatosEmpresaEnriquecidos>(response);
    } catch (error) {
        console.error('Error buscando empresa por CUIT en la API:', error);
        // Para la búsqueda de CUIT, fallamos silenciosamente permitiendo ingreso manual
        return null;
    }
}

/**
 * Realiza una investigación exhaustiva sobre una empresa.
 * Usa un timeout extendido de 2 minutos para permitir que la IA trabaje.
 */
export async function realizarResearch(empresa: EmpresaData): Promise<ResearchData> {
    const response = await fetchWithTimeout(
        `${API_URL}/research`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empresa }),
        },
        RESEARCH_TIMEOUT_MS
    );
    return handleResponse<ResearchData>(response);
}

/**
 * Realiza el análisis de Due Diligence.
 * Usa un timeout extendido de 2 minutos para el procesamiento de IA.
 */
export async function analizarDueDiligence(
    empresa: EmpresaData,
    research: ResearchData
): Promise<ResultadoDueDiligence> {
    const response = await fetchWithTimeout(
        `${API_URL}/analyze`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empresa, research }),
        },
        RESEARCH_TIMEOUT_MS
    );
    return handleResponse<ResultadoDueDiligence>(response);
}
