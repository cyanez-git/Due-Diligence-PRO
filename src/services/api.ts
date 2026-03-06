import type {
    EmpresaData,
    ResearchData,
    DatosEmpresaEnriquecidos,
    ResultadoDueDiligence
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper para manejar las respuestas de la API
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error de red desconocido');
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.json();
}

/**
 * Busca datos enriquecidos de una empresa usando su CUIT.
 * @param cuit El CUIT de la empresa a buscar.
 * @returns Los datos de la empresa o null si no se encuentran.
 */
export async function buscarEmpresaPorCuit(cuit: string): Promise<DatosEmpresaEnriquecidos | null> {
    const cuitLimpio = cuit.replace(/\D/g, '');
    if (!cuitLimpio) return null;

    try {
        const response = await fetch(`${API_URL}/empresas/${cuitLimpio}`);
        if (response.status === 404) {
            return null;
        }
        return await handleResponse<DatosEmpresaEnriquecidos>(response);
    } catch (error) {
        console.error('Error buscando empresa por CUIT en la API:', error);
        throw error;
    }
}

/**
 * Realiza una investigación exhaustiva sobre una empresa.
 * @param empresa Los datos iniciales de la empresa.
 * @returns El Research estructurado devuelto por la API.
 */
export async function realizarResearch(empresa: EmpresaData): Promise<ResearchData> {
    try {
        const response = await fetch(`${API_URL}/research`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ empresa }),
        });
        return await handleResponse<ResearchData>(response);
    } catch (error) {
        console.error('Error realizando research en la API:', error);
        throw error;
    }
}

/**
 * Realiza el análisis de Due Diligence enviando la empresa y su research.
 * @param empresa Los datos de la empresa.
 * @param research El research previamente generado.
 * @returns El resultado del Due Diligence devuelto por la API.
 */
export async function analizarDueDiligence(
    empresa: EmpresaData,
    research: ResearchData
): Promise<ResultadoDueDiligence> {
    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ empresa, research }),
        });
        return await handleResponse<ResultadoDueDiligence>(response);
    } catch (error) {
        console.error('Error analizando Due Diligence en la API:', error);
        throw error;
    }
}
