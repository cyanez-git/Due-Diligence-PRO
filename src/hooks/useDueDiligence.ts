import { useState, useCallback } from 'react';
import type {
  EmpresaData,
  ResearchData,
  ResultadoDueDiligence
} from '@/types';
import * as api from '@/services/api';

export function useDueDiligence() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoDueDiligence | null>(null);

  const analizarDueDiligence = useCallback(async (
    empresa: EmpresaData,
    research: ResearchData
  ): Promise<ResultadoDueDiligence> => {
    setLoading(true);

    try {
      const resultadoAPI = await api.analizarDueDiligence(empresa, research);
      setResultado(resultadoAPI);
      return resultadoAPI;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analizarDueDiligence, loading, resultado };
}
