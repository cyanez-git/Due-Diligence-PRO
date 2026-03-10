import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Globe,
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

const PAISES = [
  { value: 'Argentina', label: 'Argentina', idLabel: 'CUIT/CUIL', idPlaceholder: 'XX-XXXXXXXX-X', idLength: 11 },
  { value: 'Brasil', label: 'Brasil', idLabel: 'CNPJ', idPlaceholder: 'Ej: 00.000.000/0000-00', idLength: 0 },
  { value: 'Chile', label: 'Chile', idLabel: 'RUT', idPlaceholder: 'Ej: 12.345.678-9', idLength: 0 },
  { value: 'Colombia', label: 'Colombia', idLabel: 'NIT', idPlaceholder: 'Ej: 900.123.456-7', idLength: 0 },
  { value: 'España', label: 'España', idLabel: 'CIF/NIF', idPlaceholder: 'Ej: B12345678', idLength: 0 },
  { value: 'Estados Unidos', label: 'Estados Unidos', idLabel: 'EIN / Tax ID', idPlaceholder: 'Ej: 12-3456789', idLength: 0 },
  { value: 'México', label: 'México', idLabel: 'RFC', idPlaceholder: 'Ej: ABC123456AB1', idLength: 0 },
  { value: 'Paraguay', label: 'Paraguay', idLabel: 'RUC', idPlaceholder: 'Ej: 80012345-6', idLength: 0 },
  { value: 'Perú', label: 'Perú', idLabel: 'RUC', idPlaceholder: 'Ej: 20123456789', idLength: 0 },
  { value: 'Uruguay', label: 'Uruguay', idLabel: 'RUT', idPlaceholder: 'Ej: 211234560019', idLength: 0 },
  { value: 'Otro', label: 'Otro país', idLabel: 'Tax ID / Nº Identificación Fiscal', idPlaceholder: 'Ingrese el identificador fiscal', idLength: 0 },
];

interface EmpresaFormProps {
  onSubmit: (data: EmpresaData) => void;
  loading?: boolean;
  onBuscarPorCuit?: (cuit: string) => Promise<DatosEmpresaEnriquecidos | null>;
}


export function EmpresaForm({ onSubmit, loading, onBuscarPorCuit }: EmpresaFormProps) {
  const [formData, setFormData] = useState<EmpresaData>({
    nombre: '',
    tipo: 'privada',
    identificacionFiscal: '',
    sector: '',
    pais: 'Argentina',
    sitioWeb: '',
    sinSitioWeb: false,
    descripcion: '',
  });

  const [buscandoId, setBuscandoId] = useState(false);
  const [idEncontrado, setIdEncontrado] = useState(false);
  const [idNoEncontrado, setIdNoEncontrado] = useState(false);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [datosEditados, setDatosEditados] = useState(false);

  const paisConfig = PAISES.find(p => p.value === formData.pais) || PAISES[PAISES.length - 1];
  const esArgentina = formData.pais === 'Argentina';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof EmpresaData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'identificacionFiscal') {
      setIdEncontrado(false);
      setIdNoEncontrado(false);
      setErrorId(null);
      setDatosEditados(false);
    } else if (field === 'pais') {
      // Reset identification state when country changes
      setFormData(prev => ({
        ...prev,
        pais: value as string,
        identificacionFiscal: '',
      }));
      setIdEncontrado(false);
      setIdNoEncontrado(false);
      setErrorId(null);
      setDatosEditados(false);
    } else if (idEncontrado) {
      setDatosEditados(true);
    }
  };

  const handleBuscarPorId = async () => {
    if (!esArgentina) return;

    const idLimpio = formData.identificacionFiscal.replace(/\D/g, '');
    if (idLimpio.length < 11) {
      setErrorId('Ingrese un CUIT/CUIL válido (11 dígitos)');
      return;
    }

    setBuscandoId(true);
    setErrorId(null);
    setIdEncontrado(false);
    setIdNoEncontrado(false);

    try {
      if (onBuscarPorCuit) {
        const datos = await onBuscarPorCuit(formData.identificacionFiscal);
        if (datos) {
          setFormData(prev => ({
            ...prev,
            nombre: datos.nombre || prev.nombre,
            sector: datos.sector || prev.sector,
            tipo: datos.tipo || prev.tipo,
            descripcion: datos.descripcion || prev.descripcion,
            pais: datos.sede || prev.pais,
          }));
          setIdEncontrado(true);
          setIdNoEncontrado(false);
        } else {
          setIdNoEncontrado(true);
          setIdEncontrado(false);
        }
      }
    } catch {
      setErrorId('Error al buscar datos. Intente nuevamente.');
    } finally {
      setBuscandoId(false);
    }
  };


  // Auto-buscar cuando el CUIT tiene 11 dígitos (solo Argentina)
  useEffect(() => {
    if (!esArgentina) return;
    const idLimpio = formData.identificacionFiscal.replace(/\D/g, '');
    if (idLimpio.length === 11 && onBuscarPorCuit && !idEncontrado && !buscandoId && !idNoEncontrado) {
      handleBuscarPorId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.identificacionFiscal]);

  const formatCuit = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (esArgentina) {
      const formatted = formatCuit(e.target.value);
      handleChange('identificacionFiscal', formatted);
    } else {
      handleChange('identificacionFiscal', e.target.value);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Datos de la Empresa
        </CardTitle>
        <CardDescription className="text-slate-300">
          Seleccione el país e ingrese la identificación fiscal para comenzar. Campos con * son obligatorios.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevenir que "Enter" en cualquier input envíe el formulario accidentalmente
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
              e.preventDefault();
            }
          }}
          className="space-y-6"
        >
          {/* País de Operación - PRIMER CAMPO */}
          <div className="space-y-2">
            <Label htmlFor="pais" className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="w-4 h-4" />
              País de Operación *
            </Label>
            <Select
              value={formData.pais}
              onValueChange={(value) => handleChange('pais', value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccione un país" />
              </SelectTrigger>
              <SelectContent>
                {PAISES.map((pais) => (
                  <SelectItem key={pais.value} value={pais.value}>
                    {pais.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {esArgentina && (
              <p className="text-xs text-slate-500">
                Al seleccionar Argentina, podrá buscar datos automáticamente por CUIT.
              </p>
            )}
            {!esArgentina && (
              <p className="text-xs text-slate-500">
                Para empresas fuera de Argentina, deberá completar los datos manualmente.
              </p>
            )}
          </div>

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

          {/* Identificación Fiscal - Dinámico según país */}
          <div className="space-y-2">
            <Label htmlFor="identificacionFiscal" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {paisConfig.idLabel} *
              {esArgentina && <span className="text-xs text-slate-500">(11 dígitos)</span>}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="identificacionFiscal"
                  value={formData.identificacionFiscal}
                  onChange={handleIdChange}
                  placeholder={paisConfig.idPlaceholder}
                  required
                  maxLength={esArgentina ? 13 : 30}
                  className={`h-11 pr-10 ${idEncontrado ? 'border-green-500 bg-green-50' :
                    idNoEncontrado ? 'border-amber-500 bg-amber-50' :
                      errorId ? 'border-red-500' : ''
                    }`}
                />
                {idEncontrado && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                )}
                {buscandoId && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>
              {esArgentina && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBuscarPorId}
                  disabled={buscandoId || formData.identificacionFiscal.replace(/\D/g, '').length < 11}
                  className="h-11 px-4"
                >
                  {buscandoId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Mensajes de estado */}
            {idEncontrado && (
              <Alert className="bg-green-50 border-green-200 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 text-sm">
                  <span className="font-medium">¡Datos encontrados!</span> Los campos han sido completados automáticamente.
                  {datosEditados && <span className="text-amber-600 ml-1">(Has editado algunos campos)</span>}
                </AlertDescription>
              </Alert>
            )}

            {idNoEncontrado && (
              <Alert className="bg-amber-50 border-amber-200 py-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 text-sm">
                  <span className="font-medium">{paisConfig.idLabel} no encontrado</span> en nuestros registros.
                  Por favor, complete los datos manualmente.
                </AlertDescription>
              </Alert>
            )}

            {errorId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errorId}
              </p>
            )}

            <p className="text-xs text-slate-500">
              {esArgentina
                ? 'El CUIT se utilizará para realizar un análisis más profundo y preciso. Puede editar cualquier campo después de la búsqueda.'
                : 'El identificador fiscal se utilizará para el análisis de la empresa.'}
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
                className={`h-11 ${idEncontrado && formData.nombre ? 'bg-blue-50 border-blue-300' : ''}`}
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
                className={`h-11 ${idEncontrado && formData.sector ? 'bg-blue-50 border-blue-300' : ''}`}
              />
            </div>
          </div>

          {/* Sitio Web - Obligatorio con opción "No tiene web" */}
          <div className="space-y-2">
            <Label htmlFor="sitioWeb" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Sitio Web *
            </Label>
            <Input
              id="sitioWeb"
              type="url"
              value={formData.sitioWeb}
              onChange={(e) => handleChange('sitioWeb', e.target.value)}
              placeholder="https://www.ejemplo.com"
              required={!formData.sinSitioWeb}
              disabled={formData.sinSitioWeb}
              className={`h-11 ${formData.sinSitioWeb ? 'bg-slate-100 text-slate-400' : ''}`}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sinSitioWeb"
                checked={formData.sinSitioWeb}
                onCheckedChange={(checked) => {
                  handleChange('sinSitioWeb', checked === true);
                  if (checked) {
                    handleChange('sitioWeb', '');
                  }
                }}
              />
              <Label
                htmlFor="sinSitioWeb"
                className="text-sm text-slate-600 cursor-pointer"
              >
                La empresa no cuenta con sitio web
              </Label>
            </div>
            <p className="text-xs text-slate-500">
              El sitio web ayuda significativamente a la IA a realizar un análisis más preciso y evitar confusiones con empresas homónimas.
            </p>
          </div>

          {/* Descripción - Opcional */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="flex items-center gap-2">
              Descripción de la Empresa
              <span className="text-xs text-slate-400">(opcional)</span>
              {idEncontrado && formData.descripcion && (
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
              className={`resize-none ${idEncontrado && formData.descripcion ? 'bg-blue-50 border-blue-300' : ''}`}
            />
            {idEncontrado && formData.descripcion && (
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
