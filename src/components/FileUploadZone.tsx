import { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { InformeFinancieroExtraido } from '@/types';

// Si existe VITE_API_URL y termina en /api, se lo quitamos para que API_BASE sea la raíz
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
const ACCEPTED_TYPES = ['.pdf', '.html', '.htm', '.txt'];
const MAX_SIZE_MB = 5;

interface FileUploadZoneProps {
  pais: string;
  onInformeExtraido: (informe: InformeFinancieroExtraido) => void;
  onRemove: () => void;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export function FileUploadZone({ pais, onInformeExtraido, onRemove }: FileUploadZoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [informe, setInforme] = useState<InformeFinancieroExtraido | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // Validar extensión
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setErrorMsg(`Formato no soportado. Use: ${ACCEPTED_TYPES.join(', ')}`);
      setUploadState('error');
      return;
    }
    // Validar tamaño
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`El archivo supera el límite de ${MAX_SIZE_MB} MB.`);
      setUploadState('error');
      return;
    }

    setFileName(file.name);
    setUploadState('uploading');
    setErrorMsg(null);
    setInforme(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pais', pais);

      const res = await fetch(`${API_BASE}/api/parse-informe`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Error desconocido' }));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      const data: InformeFinancieroExtraido = await res.json();
      setInforme(data);
      setUploadState('success');
      onInformeExtraido(data);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al procesar el archivo.');
      setUploadState('error');
    }
  }, [pais, onInformeExtraido]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState('idle');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  const handleRemove = () => {
    setUploadState('idle');
    setFileName(null);
    setErrorMsg(null);
    setInforme(null);
    onRemove();
  };

  // Campos auto-completados (no nulos)
  const camposCompletados = informe
    ? Object.entries({
        'Nombre': informe.nombreEmpresa,
        'ID Fiscal': informe.identificacionFiscal,
        'Sector': informe.sector,
        'Descripción': informe.descripcion,
        'Tipo': informe.tipo,
        'Calificación': informe.calificacionRiesgo,
      }).filter(([, v]) => v).map(([k]) => k)
    : [];

  const isDragging = uploadState === 'dragging';
  const isUploading = uploadState === 'uploading';

  return (
    <div className="space-y-3">
      {/* Zona de drop / botón */}
      {uploadState !== 'success' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setUploadState('dragging'); }}
          onDragLeave={() => setUploadState('idle')}
          onDrop={handleDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2
            border-2 border-dashed rounded-xl p-6 cursor-pointer
            transition-all duration-200 select-none
            ${isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : isUploading
                ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-70'
                : uploadState === 'error'
                  ? 'border-red-300 bg-red-50 hover:border-red-400'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Analizando <span className="font-semibold text-slate-800">{fileName}</span>...
              </p>
              <p className="text-xs text-slate-400">Gemini está leyendo el informe</p>
            </>
          ) : (
            <>
              <UploadCloud className={`w-8 h-8 ${uploadState === 'error' ? 'text-red-400' : 'text-slate-400'}`} />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Arrastrá un archivo o{' '}
                  <span className="text-blue-600 underline underline-offset-2">seleccionalo</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  PDF, HTML o TXT — máx. {MAX_SIZE_MB} MB
                </p>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {['NOSIS', 'Veraz', 'SERASA', 'BCU', 'Otro informe'].map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Estado: éxito */}
      {uploadState === 'success' && informe && (
        <Alert className="bg-emerald-50 border-emerald-200 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <AlertDescription className="text-emerald-800 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-medium truncate max-w-[200px]">{fileName}</span>
                  {informe.calificacionRiesgo && (
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                      Score: {informe.calificacionRiesgo}
                    </Badge>
                  )}
                </div>
                {camposCompletados.length > 0 && (
                  <p className="text-xs text-emerald-700">
                    Campos completados: <span className="font-medium">{camposCompletados.join(', ')}</span>
                  </p>
                )}
                {informe.alertas.length > 0 && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    ⚠ {informe.alertas.length} alerta{informe.alertas.length > 1 ? 's' : ''} detectada{informe.alertas.length > 1 ? 's' : ''} en el informe
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-emerald-500 hover:text-emerald-700 transition-colors shrink-0 mt-0.5"
                title="Quitar archivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estado: error */}
      {uploadState === 'error' && (
        <div className="flex items-start gap-2">
          <Alert className="bg-red-50 border-red-200 py-2 flex-1">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <AlertDescription className="text-red-700 text-sm">{errorMsg}</AlertDescription>
          </Alert>
          <button
            type="button"
            onClick={handleRemove}
            className="text-slate-400 hover:text-slate-600 mt-2 transition-colors"
            title="Descartar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
