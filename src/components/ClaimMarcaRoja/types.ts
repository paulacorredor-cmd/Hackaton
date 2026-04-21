/** Productos de seguro disponibles en Marca Roja */
export type ProductoSeguro =
  | 'deudores-davivienda'
  | 'proteccion-pagos'
  | 'mascotas'
  | 'bicicletas';

/** Configuración de un producto de seguro para el UI */
export interface ProductoSeguroConfig {
  id: ProductoSeguro;
  nombre: string;
  descripcion: string;
  iconSrc: string;
  iconAlt: string;
  campos: CampoFormulario[];
  documentosRequeridos: string[];
}

/** Tipos de documento de identidad */
export type TipoDocumento = 'CC' | 'CE' | 'TI' | 'PA' | 'NIT';

/** Datos del titular del seguro */
export interface DatosTitular {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
}

/** Definición de un campo del formulario dinámico */
export interface CampoFormulario {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: CampoValidationRule;
}

/** Regla de validación para un campo */
export interface CampoValidationRule {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  min?: number;
  max?: number;
}

/** Datos del formulario de reclamación */
export interface ClaimFormData {
  producto: ProductoSeguro;
  titular: DatosTitular;
  campos: Record<string, unknown>;
  documentos: UploadedFileRef[];
}

/** Referencia a un archivo subido */
export interface UploadedFileRef {
  id: string;
  name: string;
  size: number;
}

/** Errores de validación del formulario */
export type ClaimFormErrors = Partial<Record<string, string>>;

/** Resultado de la detección IA */
export interface AIDetectionResult {
  producto: ProductoSeguro;
  confianza: number; // 0-1
  mensaje: string;
}

/** Error de la detección IA */
export interface AIDetectionError {
  type: 'no_match' | 'network' | 'server';
  message: string;
}

/** Estados posibles de un caso */
export type EstadoCaso = 'en-analisis' | 'pendiente-documentos' | 'anulado' | 'cerrado';

/** Información de un caso de siniestro */
export interface CaseInfo {
  id: string;
  producto: ProductoSeguro;
  productoNombre: string;
  estado: EstadoCaso;
  fechaRadicacion: string; // ISO 8601
  razonEstado?: string;
  tieneCartaDefinicion: boolean;
}

/** Mapeo de estado a etiqueta visible */
export const ESTADO_CASO_LABELS: Record<EstadoCaso, string> = {
  'en-analisis': 'En análisis',
  'pendiente-documentos': 'Pendiente documentos',
  'anulado': 'Anulado',
  'cerrado': 'Cerrado',
};

/** Pasos del flujo de reclamación */
export type ClaimFlowStep =
  | 'entry'
  | 'ai-input'
  | 'ai-validation'
  | 'category-selection'
  | 'form'
  | 'tracking';

/** Estado del flujo de reclamación */
export interface ClaimFlowState {
  flowType: 'ai' | 'self-service' | null;
  selectedProduct: ProductoSeguro | null;
  aiInputText: string;
  step: ClaimFlowStep;
}
