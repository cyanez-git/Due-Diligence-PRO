import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Globe,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  Search,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Edit3
} from 'lucide-react';
import type { EmpresaData, DatosEmpresaEnriquecidos } from '@/types';

interface EmpresaFormProps {
  onSubmit: (data: EmpresaData) => void;
  loading?: boolean;
  onBuscarPorCuit?: (cuit: string) => Promise<DatosEmpresaEnriquecidos | null>;
}


export function EmpresaForm({ onSubmit, loading, onBuscarPorCuit }: EmpresaFormProps) {
  const [formData, setFormData] = useState<EmpresaData>({
    nombre: '',
    tipo: 'privada',
    cuit: '',
    sector: '',
    pais: '',
    fechaFundacion: '',
    empleados: '',
    sitioWeb: '',
    descripcion: '',
  });

  const [buscandoCuit, setBuscandoCuit] = useState(false);
  const [cuitEncontrado, setCuitEncontrado] = useState(false);
  const [cuitNoEncontrado, setCuitNoEncontrado] = useState(false);
  const [errorCuit, setErrorCuit] = useState<string | null>(null);
  const [datosEditados, setDatosEditados] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof EmpresaData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'cuit') {
      setCuitEncontrado(false);
      setCuitNoEncontrado(false);
      setErrorCuit(null);
      setDatosEditados(false);
    } else if (cuitEncontrado) {
      setDatosEditados(true);
    }
  };

  const handleBuscarPorCuit = async () => {
    if (!formData.cuit || formData.cuit.replace(/\D/g, '').length < 11) {
      setErrorCuit('Ingrese un CUIT/CUIL válido (11 dígitos)');
      return;
    }

    setBuscandoCuit(true);
    setErrorCuit(null);
    setCuitEncontrado(false);
    setCuitNoEncontrado(false);

    try {
      if (onBuscarPorCuit) {
        const datos = await onBuscarPorCuit(formData.cuit);
        if (datos) {
          setFormData(prev => ({
            ...prev,
            nombre: datos.nombre || prev.nombre,
            sector: datos.sector || prev.sector,
            tipo: datos.tipo || prev.tipo,
            empleados: datos.empleados || prev.empleados,
            fechaFundacion: datos.fechaFundacion || prev.fechaFundacion,
            descripcion: datos.descripcion || prev.descripcion,
            pais: datos.sede || prev.pais,
          }));
          setCuitEncontrado(true);
          setCuitNoEncontrado(false);
        } else {
          setCuitNoEncontrado(true);
          setCuitEncontrado(false);
        }
      }
    } catch {
      setErrorCuit('Error al buscar datos del CUIT. Intente nuevamente.');
    } finally {
      setBuscandoCuit(false);
    }
  };


  // Auto-buscar cuando el CUIT tiene 11 dígitos
  useEffect(() => {
    const cuitLimpio = formData.cuit.replace(/\D/g, '');
    if (cuitLimpio.length === 11 && onBuscarPorCuit && !cuitEncontrado && !buscandoCuit && !cuitNoEncontrado) {
      handleBuscarPorCuit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cuit]);

  const formatCuit = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
  };

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCuit(e.target.value);
    handleChange('cuit', formatted);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Datos de la Empresa
        </CardTitle>
        <CardDescription className="text-slate-300">
          Ingrese el CUIT para buscar datos. Campos con * son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Empresa */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Empresa *</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) => handleChange('tipo', value as 'publica' | 'privada')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="publica" id="publica" className="border-white" />
                <Label htmlFor="publica" className="cursor-pointer">Pública</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="privada" id="privada" className="border-white" />
                <Label htmlFor="privada" className="cursor-pointer">Privada</Label>
              </div>
            </RadioGroup>
          </div>

          {/* CUIT - Campo obligatorio */}
          <div className="space-y-2">
            <Label htmlFor="cuit" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              CUIT/CUIL * (11 dígitos)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="cuit"
                  value={formData.cuit}
                  onChange={handleCuitChange}
                  placeholder="XX-XXXXXXXX-X"
                  required
                  maxLength={13}
                  className={`h-11 pr-10 ${cuitEncontrado ? 'border-green-500 bg-green-50' :
                    cuitNoEncontrado ? 'border-amber-500 bg-amber-50' :
                      errorCuit ? 'border-red-500' : ''
                    }`}
                />
                {cuitEncontrado && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                )}
                {buscandoCuit && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleBuscarPorCuit}
                disabled={buscandoCuit || formData.cuit.replace(/\D/g, '').length < 11}
                className="h-11 px-4"
              >
                {buscandoCuit ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            {/* Mensajes de estado */}
            {cuitEncontrado && (
              <Alert className="bg-green-50 border-green-200 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 text-sm">
                  <span className="font-medium">¡Datos encontrados!</span> Los campos han sido completados automáticamente.
                  {datosEditados && <span className="text-amber-600 ml-1">(Has editado algunos campos)</span>}
                </AlertDescription>
              </Alert>
            )}

            {cuitNoEncontrado && (
              <Alert className="bg-amber-50 border-amber-200 py-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 text-sm">
                  <span className="font-medium">CUIT no encontrado</span> en nuestros registros.
                  Por favor, complete los datos manualmente.
                </AlertDescription>
              </Alert>
            )}

            {errorCuit && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errorCuit}
              </p>
            )}

            <p className="text-xs text-slate-500">
              El CUIT se utilizará para realizar un análisis más profundo y preciso.
              Puede editar cualquier campo después de la búsqueda.
            </p>
          </div>

          {/* Nombre y Sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Nombre de la Empresa *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Grupo Constructor del Sur S.A."
                required
                className={`h-11 ${cuitEncontrado && formData.nombre ? 'bg-blue-50 border-blue-300' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Sector/Industria *
              </Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleChange('sector', e.target.value)}
                placeholder="Ej: Ingeniería y Construcción"
                required
                className={`h-11 ${cuitEncontrado && formData.sector ? 'bg-blue-50 border-blue-300' : ''}`}
              />
            </div>
          </div>

          {/* País y Empleados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pais" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                País de Operación *
              </Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => handleChange('pais', e.target.value)}
                placeholder="Ej: Argentina"
                required
                className={`h-11 ${cuitEncontrado && formData.pais ? 'bg-blue-50 border-blue-300' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empleados" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Número de Empleados
                {cuitEncontrado && formData.empleados && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto
                  </Badge>
                )}
              </Label>
              <Input
                id="empleados"
                value={formData.empleados}
                onChange={(e) => handleChange('empleados', e.target.value)}
                placeholder="Ej: 12,500"
                className={`h-11 ${cuitEncontrado && formData.empleados ? 'bg-blue-50 border-blue-300' : ''}`}
              />
              {cuitEncontrado && formData.empleados && (
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  Puede editar este valor si es incorrecto
                </p>
              )}
            </div>
          </div>

          {/* Fecha de Fundación y Sitio Web */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaFundacion" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Año de Fundación
                {cuitEncontrado && formData.fechaFundacion && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto
                  </Badge>
                )}
              </Label>
              <Input
                id="fechaFundacion"
                value={formData.fechaFundacion}
                onChange={(e) => handleChange('fechaFundacion', e.target.value)}
                placeholder="Ej: 1987"
                className={`h-11 ${cuitEncontrado && formData.fechaFundacion ? 'bg-blue-50 border-blue-300' : ''}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sitioWeb" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sitio Web
              </Label>
              <Input
                id="sitioWeb"
                type="url"
                value={formData.sitioWeb}
                onChange={(e) => handleChange('sitioWeb', e.target.value)}
                placeholder="https://www.ejemplo.com"
                className="h-11"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="flex items-center gap-2">
              Descripción de la Empresa
              {cuitEncontrado && formData.descripcion && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Auto
                </Badge>
              )}
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Describa brevemente la actividad principal de la empresa..."
              rows={4}
              className={`resize-none ${cuitEncontrado && formData.descripcion ? 'bg-blue-50 border-blue-300' : ''}`}
            />
            {cuitEncontrado && formData.descripcion && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                Puede editar esta descripción si es necesario
              </p>
            )}
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analizando...
              </span>
            ) : (
              'Iniciar Análisis de Due Diligence'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
