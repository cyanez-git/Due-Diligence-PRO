# Internacionalización del Formulario de Due Diligence Pro

**Fecha:** 2026-03-10  
**Autor:** Asistente IA (Antigravity)

## Objetivo

Adaptar Due Diligence Pro para analizar empresas de cualquier país, reemplazando la dependencia exclusiva del CUIT/CUIL argentino por un sistema de identificación fiscal internacional dinámico, y simplificando el formulario de entrada.

## Cambios Realizados

### 1. Modelo de Datos (`types/index.ts` / `models.py`)

| Campo | Antes | Después |
|-------|-------|---------|
| `cuit` | Obligatorio, formato argentino | Renombrado a `identificacionFiscal` (universal) |
| `empleados` | Input manual obligatorio | **Eliminado** — lo determina la IA en el research |
| `fechaFundacion` | Input manual obligatorio | **Eliminado** — lo determina la IA en el research |
| `sinSitioWeb` | No existía | **Nuevo** — checkbox para indicar que la empresa no tiene web |
| `descripcion` | Obligatorio | **Opcional** (default: vacío) |

### 2. Formulario (`EmpresaForm.tsx`)

**Nuevo orden de campos:**
1. **País de Operación** (Select con 11 países predefinidos, default: Argentina)
2. **Tipo de Empresa** (Pública/Privada)
3. **Identificación Fiscal** (etiqueta y validación dinámica según país)
4. **Nombre** + **Sector**
5. **Sitio Web** (obligatorio, con checkbox "No tiene web")
6. **Descripción** (opcional)

**Países soportados:**
Argentina (CUIT/CUIL), Brasil (CNPJ), Chile (RUT), Colombia (NIT), España (CIF/NIF), Estados Unidos (EIN/Tax ID), México (RFC), Paraguay (RUC), Perú (RUC), Uruguay (RUT), Otro.

**Comportamiento condicional:**
- Si el país es **Argentina**: se muestra máscara XX-XXXXXXXX-X, validación de 11 dígitos, y botón "Buscar" para autocompletar.
- Si el país es **otro**: campo de texto libre, sin máscara, sin botón de búsqueda.

### 3. Interfaz de Usuario (`App.tsx`)

- Badges dinámicos: muestran "CUIT" si el país es Argentina, "ID Fiscal" en caso contrario.
- Eliminadas las filas de Empleados y Año de Fundación del reporte visual.
- Texto de bienvenida actualizado.

### 4. Exportación PDF (`useExportPDF.ts`)

- La etiqueta "CUIT:" en el PDF se reemplazó por "ID Fiscal:".
- Se eliminaron las filas de Empleados y Año de Fundación de la tabla del PDF.

### 5. Backend - Servidor (`main.py`)

- Endpoint `/api/empresas/{cuit}` → `/api/empresas/{tax_id}`.
- Validación relajada (mínimo 8 caracteres alfanuméricos en vez de 11 dígitos).
- El endpoint `/api/research` ahora pasa el objeto `EmpresaData` completo al agente investigador.

### 6. Backend - Agente Investigador (`researcher.py`)

- Firma: `investigate_company(cuit, nombre, sector)` → `investigate_company(empresa: EmpresaData)`.
- El prompt de búsqueda ahora incluye:
  - País de operación
  - Sitio web oficial (si disponible)
  - Descripción del usuario (si proporcionada)
  - Regla extra: "enfocarse en el contexto del país y su marco regulatorio"

### 7. Backend - Agente Evaluador (`reviewer.py`)

- Prompt actualizado: referencia `identificacionFiscal` y `pais` en vez de solo `cuit`.

### 8. API Frontend (`api.ts` / `useResearch.ts`)

- `buscarEmpresaPorCuit()` → `buscarEmpresaPorId()`
- URL con `encodeURIComponent` para IDs con caracteres especiales.

## Archivos Modificados

| Archivo | Tipo |
|---------|------|
| `src/types/index.ts` | Frontend - Tipos |
| `src/sections/EmpresaForm.tsx` | Frontend - Formulario |
| `src/App.tsx` | Frontend - App principal |
| `src/services/api.ts` | Frontend - Servicio API |
| `src/hooks/useResearch.ts` | Frontend - Hook |
| `src/hooks/useExportPDF.ts` | Frontend - Export PDF |
| `backend/models.py` | Backend - Modelos Pydantic |
| `backend/main.py` | Backend - FastAPI Server |
| `backend/agents/researcher.py` | Backend - Agente IA Investigador |
| `backend/agents/reviewer.py` | Backend - Agente IA Evaluador |

## Verificación

- ✅ TypeScript build (`npx tsc --noEmit`): sin errores
- ✅ Lint warnings: resueltos
