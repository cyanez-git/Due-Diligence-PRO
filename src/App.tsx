import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Search,
  Thermometer,
  FileText,
  Download,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Loader2
} from 'lucide-react';
import { EmpresaForm } from '@/sections/EmpresaForm';
import { ResearchPanel } from '@/sections/ResearchPanel';
import { ResearchLoadingPanel } from '@/sections/ResearchLoadingPanel';
import { TablaTemperatura } from '@/sections/TablaTemperatura';
import { useResearch } from '@/hooks/useResearch';
import { useDueDiligence } from '@/hooks/useDueDiligence';
import { useExportPDF } from '@/hooks/useExportPDF';
import type { EmpresaData, InformeCompleto } from '@/types';
import './App.css';

type Step = 'form' | 'research' | 'analysis' | 'report';

function App() {
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [informe, setInforme] = useState<InformeCompleto | null>(null);

  const { realizarResearch, buscarPorCuit, loading: loadingResearch, error: researchError, data: researchData } = useResearch();
  const { analizarDueDiligence } = useDueDiligence();
  const { exportarAPDF, exporting, progress } = useExportPDF();

  const informeRef = useRef<HTMLDivElement>(null);

  // Helper para mostrar la etiqueta de ID según el país
  const getIdLabel = (pais: string) => pais === 'Argentina' ? 'CUIT' : 'ID Fiscal';

  const handleEmpresaSubmit = async (data: EmpresaData) => {
    setEmpresa(data);
    setCurrentStep('research');

    try {
      const research = await realizarResearch(data);
      setInforme(prev => ({
        empresa: data,
        research,
        resultado: prev?.resultado || {} as NonNullable<typeof prev>["resultado"],
      }));
    } catch (error) {
      console.error('Error en research:', error);
    }
  };

  const handleBuscarPorId = async (cuit: string) => {
    return await buscarPorCuit(cuit);
  };

  const handleStartAnalysis = async () => {
    if (!empresa || !researchData) return;

    setCurrentStep('analysis');

    try {
      const resultadoDD = await analizarDueDiligence(empresa, researchData);
      setInforme({
        empresa,
        research: researchData,
        resultado: resultadoDD,
      });
      setCurrentStep('report');
    } catch (error) {
      console.error('Error en análisis:', error);
    }
  };

  const handleReset = () => {
    setCurrentStep('form');
    setEmpresa(null);
    setInforme(null);
    window.location.reload();
  };

  const handleCancelResearch = () => {
    // Volver al formulario sin perder los datos de empresa
    setCurrentStep('form');
  };

  const handleRetryResearch = async () => {
    if (!empresa) return;
    try {
      const research = await realizarResearch(empresa);
      setInforme(prev => ({
        empresa,
        research,
        resultado: prev?.resultado || {} as NonNullable<typeof prev>["resultado"],
      }));
    } catch (error) {
      console.error('Error en reintento de research:', error);
    }
  };

  const handleExportPDF = async () => {
    if (!informe) return;

    try {
      await exportarAPDF(informe, 'informe-content');
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Error al exportar el PDF. Intente nuevamente.');
    }
  };

  // Renderizar indicador de pasos
  const renderStepIndicator = () => {
    const steps = [
      { id: 'form', label: 'Datos', icon: Building2 },
      { id: 'research', label: 'Research', icon: Search },
      { id: 'analysis', label: 'Análisis', icon: Sparkles },
      { id: 'report', label: 'Informe', icon: FileText },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center bg-white rounded-full shadow-md px-6 py-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentIndex;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                    flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300
                    ${isCurrent ? 'bg-blue-100 text-blue-700' : ''}
                    ${isActive && !isCurrent ? 'text-green-600' : 'text-slate-400'}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isCurrent ? 'bg-blue-600 text-white' : ''}
                    ${isActive && !isCurrent ? 'bg-green-100' : 'bg-slate-100'}
                  `}>
                    {isActive && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isCurrent ? 'block' : 'hidden sm:block'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/sofredigital-logo.svg" alt="SofreDigital" className="h-10" />
              <div className="h-8 w-px bg-slate-300" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Due Diligence Pro</h1>
                <p className="text-xs text-slate-500">Análisis integral de empresas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="hidden sm:flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                Identificación Fiscal
              </Badge>
              {currentStep !== 'form' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nuevo Análisis
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        {/* Step: Form */}
        {currentStep === 'form' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Bienvenido a Due Diligence Pro
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Realice análisis completos de empresas públicas y privadas.
                Seleccione el <strong>país</strong> e ingrese la <strong>identificación fiscal</strong> para obtener un análisis preciso.
              </p>
            </div>
            <EmpresaForm
              onSubmit={handleEmpresaSubmit}
              loading={loadingResearch}
              onBuscarPorCuit={handleBuscarPorId}
            />
          </div>
        )}

        {/* Step: Cargando Research */}
        {currentStep === 'research' && empresa && !researchData && (
          <ResearchLoadingPanel
            empresaNombre={empresa.nombre}
            onCancel={handleCancelResearch}
            error={researchError}
            onRetry={handleRetryResearch}
          />
        )}

        {currentStep === 'research' && empresa && researchData && (
          <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Research de {empresa.nombre}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {getIdLabel(empresa.pais)}: {empresa.identificacionFiscal}
                  </Badge>
                  <span className="text-slate-600 text-sm">
                    {empresa.tipo === 'publica' ? 'Empresa Pública' : 'Empresa Privada'} • {empresa.sector}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleStartAnalysis}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generar Análisis DD
              </Button>
            </div>
            <ResearchPanel data={researchData} empresaNombre={empresa.nombre} />
          </div>
        )}

        {/* Step: Analysis (Loading) */}
        {currentStep === 'analysis' && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-2">
              Analizando Due Diligence
            </h3>
            <p className="text-slate-600 text-center max-w-md">
              Estamos evaluando todos los aspectos legales, financieros, operacionales
              y de mercado de la empresa. Esto puede tomar unos momentos...
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Step: Report */}
        {currentStep === 'report' && informe?.resultado && (
          <div className="animate-fade-in space-y-6">
            {/* Header del informe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Informe de Due Diligence
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-600">
                    {informe.empresa.nombre}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {getIdLabel(informe.empresa.pais)}: {informe.empresa.identificacionFiscal}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exportando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exportar PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Barra de progreso de exportación */}
            {exporting && (
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Generando PDF...</span>
                  <span className="text-sm text-slate-500">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Contenido del informe para exportar */}
            <div id="informe-content" ref={informeRef}>
              {/* Tabs del informe */}
              <Tabs defaultValue="temperatura" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="temperatura" className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    <span className="hidden sm:inline">Tabla de Temperatura</span>
                    <span className="sm:hidden">Temperatura</span>
                  </TabsTrigger>
                  <TabsTrigger value="research" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Research</span>
                    <span className="sm:hidden">Research</span>
                  </TabsTrigger>
                  <TabsTrigger value="resumen" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Resumen Ejecutivo</span>
                    <span className="sm:hidden">Resumen</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="temperatura" className="mt-6">
                  <TablaTemperatura resultado={informe.resultado} />
                </TabsContent>

                <TabsContent value="research" className="mt-6">
                  <ResearchPanel
                    data={informe.research}
                    empresaNombre={informe.empresa.nombre}
                  />
                </TabsContent>

                <TabsContent value="resumen" className="mt-6">
                  <Card>
                    <CardContent className="p-8">
                      <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                          <img src="/sofredigital-logo.svg" alt="SofreDigital" className="h-12 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-slate-900">
                            Informe de Due Diligence
                          </h3>
                          <p className="text-slate-500">
                            {informe.empresa.nombre}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {getIdLabel(informe.empresa.pais)}: {informe.empresa.identificacionFiscal}
                          </Badge>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">
                              Información de la Empresa
                            </h4>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                              <div>
                                <p className="text-sm text-slate-500">{getIdLabel(informe.empresa.pais)}</p>
                                <p className="font-medium">{informe.empresa.identificacionFiscal}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Tipo</p>
                                <p className="font-medium capitalize">{informe.empresa.tipo}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">Sector</p>
                                <p className="font-medium">{informe.empresa.sector}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-500">País</p>
                                <p className="font-medium">{informe.empresa.pais}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">
                              Resultado del Análisis
                            </h4>
                            <div className="flex items-center gap-4">
                              <div className={`
                                w-24 h-24 rounded-full flex items-center justify-center
                                ${informe.resultado.porcentaje >= 75 ? 'bg-emerald-100' :
                                  informe.resultado.porcentaje >= 50 ? 'bg-amber-100' : 'bg-red-100'}
                              `}>
                                <span className={`
                                  text-2xl font-bold
                                  ${informe.resultado.porcentaje >= 75 ? 'text-emerald-700' :
                                    informe.resultado.porcentaje >= 50 ? 'text-amber-700' : 'text-red-700'}
                                `}>
                                  {informe.resultado.porcentaje}%
                                </span>
                              </div>
                              <div>
                                <Badge className={`
                                  text-lg px-4 py-1
                                  ${informe.resultado.recomendacion === 'aprobado' ? 'bg-emerald-100 text-emerald-800' :
                                    informe.resultado.recomendacion === 'condicional' ? 'bg-amber-100 text-amber-800' :
                                      'bg-red-100 text-red-800'}
                                `}>
                                  {informe.resultado.recomendacion === 'aprobado' ? 'APROBADO' :
                                    informe.resultado.recomendacion === 'condicional' ? 'APROBADO CON CONDICIONES' :
                                      'RECHAZADO'}
                                </Badge>
                                <p className="text-sm text-slate-600 mt-2">
                                  Puntaje: {informe.resultado.puntajeTotal} / {informe.resultado.puntajeMaximo}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">
                              Resumen Ejecutivo
                            </h4>
                            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                              {informe.resultado.resumenEjecutivo}
                            </p>
                          </div>

                          <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-blue-900">Nota Importante</p>
                              <p className="text-sm text-blue-700">
                                Este informe es generado automáticamente basándose en información
                                pública disponible y datos del CUIT proporcionado. Se recomienda
                                validar los hallazgos con asesores legales y financieros antes de
                                tomar decisiones de inversión.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <img src="/sofredigital-logo.svg" alt="SofreDigital" className="h-5 opacity-60" />
              © 2025 SofreDigital — Due Diligence Pro. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                Análisis por ID Fiscal
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Datos actualizados
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
