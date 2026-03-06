import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Globe, Search, Brain, FileText, Building2 } from 'lucide-react';

interface ResearchLoadingPanelProps {
    empresaNombre: string;
    onCancel: () => void;
}

const ETAPAS = [
    { icon: Search, label: 'Buscando información pública de la empresa...', delay: 0 },
    { icon: Globe, label: 'Consultando fuentes y noticias recientes...', delay: 6000 },
    { icon: Building2, label: 'Analizando datos del sector e industria...', delay: 13000 },
    { icon: Brain, label: 'Evaluando riesgos y oportunidades de mercado...', delay: 20000 },
    { icon: FileText, label: 'Estructurando resultados del Research...', delay: 27000 },
];

export function ResearchLoadingPanel({ empresaNombre, onCancel }: ResearchLoadingPanelProps) {
    const [etapaActual, setEtapaActual] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    // Avanzar etapas progresivamente para indicar que la IA está trabajando
    useEffect(() => {
        const timers = ETAPAS.slice(1).map((etapa, i) =>
            setTimeout(() => setEtapaActual(i + 1), etapa.delay)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    // Contador de segundos transcurridos
    useEffect(() => {
        const interval = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const EtapaIcon = ETAPAS[etapaActual].icon;

    return (
        <div className="animate-fade-in flex flex-col items-center justify-center py-12 px-4">
            <Card className="w-full max-w-lg shadow-xl border-0">
                <CardContent className="p-8">
                    {/* Círculo animado central */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-6">
                            {/* Anillo exterior pulsante */}
                            <div className="w-28 h-28 border-4 border-blue-100 rounded-full absolute inset-0 animate-ping opacity-30" />
                            {/* Anillo spinner */}
                            <div className="w-28 h-28 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            {/* Ícono central */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                    <EtapaIcon className="w-7 h-7 text-white" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 text-center mb-1">
                            Investigando {empresaNombre}
                        </h3>
                        <p className="text-slate-500 text-sm text-center">
                            Gemini AI está realizando la búsqueda en internet
                        </p>
                    </div>

                    {/* Etapas del proceso */}
                    <div className="space-y-3 mb-8">
                        {ETAPAS.map((etapa, index) => {
                            const Icon = etapa.icon;
                            const isCompleted = index < etapaActual;
                            const isActive = index === etapaActual;
                            return (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-500 ${isActive ? 'bg-blue-50 border border-blue-200' :
                                            isCompleted ? 'opacity-50' : 'opacity-30'
                                        }`}
                                >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-100' : isActive ? 'bg-blue-100' : 'bg-slate-100'
                                        }`}>
                                        {isCompleted ? (
                                            <span className="text-green-600 text-xs font-bold">✓</span>
                                        ) : (
                                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                        )}
                                    </div>
                                    <span className={`text-sm ${isActive ? 'text-blue-800 font-medium' : 'text-slate-500'}`}>
                                        {etapa.label}
                                    </span>
                                    {isActive && (
                                        <div className="ml-auto flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer con tiempo y botón cancelar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                            Tiempo transcurrido: <span className="font-mono font-medium text-slate-600">{formatTime(elapsed)}</span>
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                        >
                            <X className="w-4 h-4" />
                            Cancelar y volver
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <p className="text-xs text-slate-400 mt-4 text-center max-w-md">
                Este proceso puede tomar entre 15 y 45 segundos dependiendo de la cantidad de información disponible en internet.
            </p>
        </div>
    );
}
