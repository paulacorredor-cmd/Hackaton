import type {
  ProductoSeguro,
  DatosTitular,
  UploadedFileRef,
  EstadoCaso,
} from './types';

/** Request para el endpoint de detección IA */
export interface DetectProductRequest {
  texto: string;
}

/** Response del endpoint de detección IA */
export interface DetectProductResponse {
  producto: ProductoSeguro;
  confianza: number;
  mensaje: string;
}

/** Request para enviar una reclamación */
export interface SubmitClaimRequest {
  producto: ProductoSeguro;
  titular: DatosTitular;
  campos: Record<string, unknown>;
  documentos: UploadedFileRef[];
}

/** Response de envío exitoso */
export interface SubmitClaimResponse {
  caseId: string;
  mensaje: string;
  estado: EstadoCaso;
}

/** Response de error de la API */
export interface ClaimApiError {
  error: string;
  mensaje: string;
  detalles?: { campo: string; mensaje: string }[];
}
