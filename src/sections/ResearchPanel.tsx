import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Newspaper, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Users,
  ExternalLink,
  DollarSign,
  Activity,
  Building2,
  MapPin,
  Calendar,
  CreditCard,
  Sparkles
} from 'lucide-react';
import type { ResearchData } from '@/types';

interface ResearchPanelProps {
  data: ResearchData;
  empresaNombre: string;
}

export function ResearchPanel({ data, empresaNombre }: ResearchPanelProps) {
  const getRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-300';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          Resultados del Research: {empresaNombre}
        </h2>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          <Activity className="w-4 h-4 mr-1" />
          Análisis Completado
        </Badge>
      </div>

      {/* Datos de la Empresa desde CUIT */}
      {data.datosEmpresa && (
        <Card className="border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Datos de la Empresa
              <Badge variant="outline" className="ml-2 bg-white">
                <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                Enriquecido con CUIT
              </Badge>
            </CardTitle>
            <CardDescription>
              Información obtenida desde registros públicos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Users className="w-4 h-4" />
                  <p className="text-xs uppercase">Empleados</p>
                </div>
                <p className="font-semibold text-slate-900">{data.datosEmpresa.empleados}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <p className="text-xs uppercase">Año de Fundación</p>
                </div>
                <p className="font-semibold text-slate-900">{data.datosEmpresa.fechaFundacion}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <p className="text-xs uppercase">Sede</p>
                </div>
                <p className="font-semibold text-slate-900">{data.datosEmpresa.sede}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <p className="text-xs uppercase">Ingresos Estimados</p>
                </div>
                <p className="font-semibold text-slate-900">{data.datosEmpresa.ingresosEstimados}</p>
              </div>
              <div className="col-span-2 md:col-span-2 bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Building2 className="w-4 h-4" />
                  <p className="text-xs uppercase">Descripción</p>
                </div>
                <p className="font-medium text-slate-900 text-sm">{data.datosEmpresa.descripcion}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              <strong>Fuente:</strong> {data.datosEmpresa.fuente}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Noticias */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            Noticias Recientes
          </CardTitle>
          <CardDescription>
            Últimas noticias relevantes sobre la empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64">
            <div className="p-4 space-y-4">
              {data.noticias.map((noticia, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-slate-900 flex-1 pr-4">
                      {noticia.titulo}
                    </h4>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {noticia.fecha}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{noticia.resumen}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {noticia.fuente}
                    </Badge>
                    {noticia.url && (
                      <a 
                        href={noticia.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Ver fuente <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {index < data.noticias.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Datos Financieros */}
      {data.datosFinancieros && (
        <Card>
          <CardHeader className="bg-slate-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Datos Financieros
            </CardTitle>
            <CardDescription>
              Información financiera clave de la empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.datosFinancieros.ingresos && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Ingresos Anuales</p>
                  <p className="font-semibold text-slate-900">{data.datosFinancieros.ingresos}</p>
                </div>
              )}
              {data.datosFinancieros.beneficioNeto && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Beneficio Neto</p>
                  <p className="font-semibold text-slate-900">{data.datosFinancieros.beneficioNeto}</p>
                </div>
              )}
              {data.datosFinancieros.deuda && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Deuda Total</p>
                  <p className="font-semibold text-slate-900">{data.datosFinancieros.deuda}</p>
                </div>
              )}
              {data.datosFinancieros.ratioDeudaCapital && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">Ratio Deuda/Capital</p>
                  <p className="font-semibold text-slate-900">{data.datosFinancieros.ratioDeudaCapital}</p>
                </div>
              )}
              {data.datosFinancieros.ebitda && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase">EBITDA</p>
                  <p className="font-semibold text-slate-900">{data.datosFinancieros.ebitda}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              <strong>Fuente:</strong> {data.datosFinancieros.fuente}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Riesgos */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Riesgos Identificados
          </CardTitle>
          <CardDescription>
            Factores de riesgo relevantes para la evaluación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.riesgos.map((riesgo, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Badge className={`${getRiesgoColor(riesgo.nivel)} capitalize`}>
                  {riesgo.nivel}
                </Badge>
                <div>
                  <p className="font-medium text-slate-900">{riesgo.categoria}</p>
                  <p className="text-sm text-slate-600">{riesgo.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Oportunidades
          </CardTitle>
          <CardDescription>
            Potenciales oportunidades de crecimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.oportunidades.map((oportunidad, index) => (
              <li key={index} className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{oportunidad}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Competidores */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Análisis Competitivo
          </CardTitle>
          <CardDescription>
            Principales competidores en el mercado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.competidores.map((competidor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-slate-900">{competidor.nombre}</h4>
                <Badge variant="outline" className="mt-1 mb-2">{competidor.mercado}</Badge>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase">Fortalezas:</p>
                  <ul className="text-sm text-slate-600">
                    {competidor.fortalezas.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
