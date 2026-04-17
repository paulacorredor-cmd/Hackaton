import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

import RegistroPage from '../page';

describe('RegistroPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Renderizado de campos, labels y aria-labels (Req 2.1, 2.2, 11.3) ---

  it('renderiza el título y la descripción del formulario', () => {
    render(<RegistroPage />);
    expect(screen.getByRole('heading', { level: 1, name: /registro de socio/i })).toBeInTheDocument();
    expect(screen.getByText(/complete los datos de su empresa/i)).toBeInTheDocument();
  });

  it('renderiza los 5 campos del formulario con labels visibles', () => {
    render(<RegistroPage />);
    expect(screen.getByLabelText(/NIT de la empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Razón social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Representante legal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico corporativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Documento de Cámara de Comercio/i)).toBeInTheDocument();
  });

  it('cada campo tiene un aria-label descriptivo', () => {
    render(<RegistroPage />);
    const nit = screen.getByLabelText(/NIT de la empresa/i);
    expect(nit).toHaveAttribute('aria-label', expect.stringContaining('NIT'));

    const razon = screen.getByLabelText(/Razón social/i);
    expect(razon).toHaveAttribute('aria-label', expect.stringContaining('Razón social'));

    const rep = screen.getByLabelText(/Representante legal/i);
    expect(rep).toHaveAttribute('aria-label', expect.stringContaining('representante legal'));

    const correo = screen.getByLabelText(/Correo electrónico corporativo/i);
    expect(correo).toHaveAttribute('aria-label', expect.stringContaining('Correo electrónico'));

    const doc = screen.getByLabelText(/Documento de Cámara de Comercio/i);
    expect(doc).toHaveAttribute('aria-label', expect.stringContaining('Cámara de Comercio'));
  });

  it('renderiza el botón Continuar', () => {
    render(<RegistroPage />);
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  // --- Errores en envío inválido (Req 2.5) ---

  it('muestra mensajes de error al enviar el formulario vacío', async () => {
    render(<RegistroPage />);
    const button = screen.getByRole('button', { name: /continuar/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/el NIT es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/la razón social es obligatoria/i)).toBeInTheDocument();
      expect(screen.getByText(/el nombre del representante legal es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/debe cargar el documento/i)).toBeInTheDocument();
    });
  });

  it('muestra error de formato NIT al ingresar un NIT inválido', async () => {
    render(<RegistroPage />);
    const nitInput = screen.getByLabelText(/NIT de la empresa/i);

    fireEvent.change(nitInput, { target: { value: '12345' } });
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/9 dígitos, guión, 1 dígito de verificación/i)).toBeInTheDocument();
    });
  });

  it('los campos inválidos tienen aria-invalid=true tras envío', async () => {
    render(<RegistroPage />);
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      const nitInput = screen.getByLabelText(/NIT de la empresa/i);
      expect(nitInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('limpia el error de un campo al corregirlo', async () => {
    render(<RegistroPage />);
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/el NIT es obligatorio/i)).toBeInTheDocument();
    });

    const nitInput = screen.getByLabelText(/NIT de la empresa/i);
    fireEvent.change(nitInput, { target: { value: '123456789-0' } });

    expect(screen.queryByText(/el NIT es obligatorio/i)).not.toBeInTheDocument();
  });

  // --- Navegación exitosa (Req 2.4) ---

  it('navega a /onboarding/terminos al enviar formulario válido', async () => {
    render(<RegistroPage />);

    fireEvent.change(screen.getByLabelText(/NIT de la empresa/i), {
      target: { value: '123456789-0' },
    });
    fireEvent.change(screen.getByLabelText(/Razón social/i), {
      target: { value: 'Empresa S.A.' },
    });
    fireEvent.change(screen.getByLabelText(/Representante legal/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/Correo electrónico corporativo/i), {
      target: { value: 'juan@empresa.com' },
    });

    // Simulate PDF file upload
    const pdfFile = new File(['pdf-content'], 'camara.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Documento de Cámara de Comercio/i);
    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/onboarding/terminos');
    });
  });

  it('no navega si hay errores de validación', async () => {
    render(<RegistroPage />);
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/el NIT es obligatorio/i)).toBeInTheDocument();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
