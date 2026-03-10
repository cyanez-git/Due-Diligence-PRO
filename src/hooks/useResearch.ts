import { useState, useCallback } from 'react';
import type { EmpresaData, ResearchData, DatosEmpresaEnriquecidos } from '@/types';
import * as api from '@/services/api';

export function useResearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResearchData | null>(null);

  const buscarPorCuit = useCallback(async (taxId: string): Promise<DatosEmpresaEnriquecidos | null> => {
    try {
      return await api.buscarEmpresaPorId(taxId);
    } catch (err) {
      console.error('Error buscando por ID fiscal:', err);
      // Return null to allow manual entry if API fails or company is not found
      return null;
    }
  }, []);

  const realizarResearch = useCallback(async (empresa: EmpresaData): Promise<ResearchData> => {
    setLoading(true);
    setError(null);

    try {
      const researchData = await api.realizarResearch(empresa);
      setData(researchData);
      return researchData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error en el research';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { realizarResearch, buscarPorCuit, loading, error, data };
}

