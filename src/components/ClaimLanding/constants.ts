import type { RadioOptionConfig } from './types';

export const DESIGN_TOKENS = {
  colors: {
    primary: '#ED1C27',
    primaryDark: '#C8151F',
    white: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    background: '#F5F5F5',
    border: '#E0E0E0',
    disabled: '#CCCCCC',
  },
  breakpoints: {
    mobile: 768,
    desktop: 1024,
  },
  typography: {
    minFontSize: 14,
  },
  layout: {
    maxContentWidth: 720,
  },
} as const;

export const MODE_OPTIONS: RadioOptionConfig[] = [
  {
    id: 'assisted',
    title: 'Con ayuda de un asistente IA',
    description: 'Un par de preguntas para entender lo ocurrido.',
    badge: 'Inteligencia artificial',
  },
  {
    id: 'self-service',
    title: 'Continuar sin ayuda',
    description: 'Prefiero completar el reporte por mi cuenta.',
  },
];

export const ROUTES = {
  assistedFlow: '/claims/assisted',
  selfServiceFlow: '/claims/self-service',
  resumeRequest: '/claims/resume',
  checkStatus: '/claims/status',
  back: '/home',
  requirements: '/claims/requirements',
} as const;
