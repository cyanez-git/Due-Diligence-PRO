import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Thermometer,
  Info,
  FileText
} from 'lucide-react';
import type { ItemDueDiligence, ResultadoDueDiligence } from '@/types';

interface TablaTemperaturaProps {
  resultado: ResultadoDueDiligence;
}

// Componente del círculo de semáforo
function SemaforoCircle({ estado }: { estado: 'aprobado' | 'revisar' | 'rechazado' }) {
  const colores = {
    aprobado: 'bg-emerald-500 shadow-emerald-500/50',
    revisar: 'bg-amber-500 shadow-amber-500/50',
    rechazado: 'bg-red-500 shadow-red-500/50',
  };

  const glowEffect = {
    aprobado: 'shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    revisar: 'shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    rechazado: 'shadow-[0_0_12px_rgba(239,68,68,0.6)]',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              w-6 h-6 rounded-full cursor-pointer transition-all duration-300
              ${colores[estado]} ${glowEffect[estado]}
              hover:scale-110 hover:shadow-lg
            `}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p className="capitalize font-medium">{estado}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Icono de estado
function EstadoIcon({ estado }: { estado: 'aprobado' | 'revisar' | 'rechazado' }) {
  switch (estado) {
    case 'aprobado':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    case 'revisar':
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    case 'rechazado':
      return <XCircle className="w-5 h-5 text-red-600" />;
  }
}

// Badge de estado
function EstadoBadge({ estado }: { estado: 'aprobado' | 'revisar' | 'rechazado' }) {
  const styles = {
    aprobado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    revisar: 'bg-amber-100 text-amber-800 border-amber-300',
    rechazado: 'bg-red-100 text-red-800 border-red-300',
  };

  const labels = {
    aprobado: 'Aprobado',
    revisar: 'Revisar',
    rechazado: 'Rechazado',
  };

  return (
    <Badge className={`${styles[estado]} capitalize font-medium`}>
      {labels[estado]}
    </Badge>
  );
}

// Barra de puntaje
function PuntajeBar({ puntaje }: { puntaje: number }) {
  const porcentaje = (puntaje / 10) * 100;
  let colorClass = 'bg-red-500';
  
  if (puntaje >= 8) colorClass = 'bg-emerald-500';
  else if (puntaje >= 5) colorClass = 'bg-amber-500';
  else if (puntaje >= 3) colorClass = 'bg-orange-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">Puntaje</span>
        <span className="font-semibold text-slate-900">{puntaje}/10</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

// Agrupar items por categoría
function agruparPorCategoria(items: ItemDueDiligence[]) {
  const grupos: Record<string, ItemDueDiligence[]> = {};
  
  items.forEach(item => {
    if (!grupos[item.categoria]) {
      grupos[item.categoria] = [];
    }
    grupos[item.categoria].push(item);
  });
  
  return grupos;
}

// Títulos de categorías
const categoriasTitulos: Record<string, string> = {
  legal: 'Legal y Regulatorio',
  financiero: 'Financiero',
  operacional: 'Operacional',
  mercado: 'Mercado y Competencia',
  tecnologia: 'Tecnología e Innovación',
  sostenibilidad: 'ESG y Sostenibilidad',
};

export function TablaTemperatura({ resultado }: TablaTemperaturaProps) {
  const grupos = agruparPorCategoria(resultado.items);
  
  // Calcular estadísticas
  const totalAprobados = resultado.items.filter(i => i.estado === 'aprobado').length;
  const totalRevisar = resultado.items.filter(i => i.estado === 'revisar').length;
  const totalRechazados = resultado.items.filter(i => i.estado === 'rechazado').length;

  // Determinar color del termómetro general
  const getTermometroColor = () => {
    if (resultado.porcentaje >= 75) return 'text-emerald-600';
    if (resultado.porcentaje >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRecomendacionColor = () => {
    switch (resultado.recomendacion) {
      case 'aprobado': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'condicional': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'rechazado': return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const getRecomendacionTexto = () => {
    switch (resultado.recomendacion) {
      case 'aprobado': return 'APROBADO';
      case 'condicional': return 'APROBADO CON CONDICIONES';
      case 'rechazado': return 'RECHAZADO';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con resultado general */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Thermometer className="w-7 h-7" />
                Tabla de Temperatura - Due Diligence
              </CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                Evaluación detallada por categorías
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getTermometroColor()}`}>
                {resultado.porcentaje}%
              </div>
              <Badge className={`${getRecomendacionColor()} text-lg px-4 py-1 mt-2`}>
                {getRecomendacionTexto()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Resumen de estadísticas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-700">{totalAprobados}</span>
              </div>
              <p className="text-sm text-emerald-600 font-medium">Aprobados</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center border border-amber-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-2xl font-bold text-amber-700">{totalRevisar}</span>
              </div>
              <p className="text-sm text-amber-600 font-medium">Revisar</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-200">
              <div className="flex items-center justify-center gap-2 mb-1">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-red-700">{totalRechazados}</span>
              </div>
              <p className="text-sm text-red-600 font-medium">Rechazados</p>
            </div>
          </div>

          {/* Barra de progreso general */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Puntaje Total</span>
              <span className="font-semibold text-slate-900">
                {resultado.puntajeTotal} / {resultado.puntajeMaximo} puntos
              </span>
            </div>
            <Progress 
              value={resultado.porcentaje} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla detallada por categorías */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.entries(grupos).map(([categoria, items]) => (
            <Card key={categoria} className="overflow-hidden">
              <CardHeader className="bg-slate-50 py-3">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  {categoriasTitulos[categoria] || categoria}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium w-16">Estado</th>
                      <th className="px-4 py-3 text-left font-medium">Item</th>
                      <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Descripción</th>
                      <th className="px-4 py-3 text-left font-medium w-32">Puntaje</th>
                      <th className="px-4 py-3 text-left font-medium w-24">Semáforo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <EstadoIcon estado={item.estado} />
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-slate-900">{item.item}</p>
                            <EstadoBadge estado={item.estado} />
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-sm text-slate-600">{item.descripcion}</p>
                          {item.observaciones && (
                            <div className="flex items-start gap-1 mt-1">
                              <Info className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-slate-500">{item.observaciones}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <PuntajeBar puntaje={item.puntaje} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <SemaforoCircle estado={item.estado} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Resumen Ejecutivo */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-slate-700 leading-relaxed">{resultado.resumenEjecutivo}</p>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              <strong>Fecha de análisis:</strong>{' '}
              {new Date(resultado.fechaAnalisis).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
