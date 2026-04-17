import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ClaimLandingPage } from '../ClaimLandingPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/claims']}>
      <Routes>
        <Route path="/claims" element={<ClaimLandingPage />} />
        <Route path="*" element={<div>Navigated</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Accesibilidad - Navegación por teclado', () => {
  it('Tab recorre todos los elementos interactivos sin trampas de foco', async () => {
    const user = userEvent.setup();
    renderPage();

    // Start tabbing from the beginning of the document
    // Expected tab order: BackLink → InfoBanner "Ver requisitos" → InfoBanner close → Radio (first) → StartButton → ActionCard 1 → ActionCard 2

    // 1. BackLink ("Volver")
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Volver').closest('a'));

    // 2. InfoBanner "Ver requisitos" button
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Ver requisitos'));

    // 3. InfoBanner close button
    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('Cerrar banner'));

    // 4. First radio option (ModeSelector - only first radio is tabbable when none selected)
    await user.tab();
    const radios = screen.getAllByRole('radio');
    expect(document.activeElement).toBe(radios[0]);

    // 5. StartButton
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Iniciar proceso'));

    // 6. First ActionCard ("Retome su solicitud")
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByText('Retome su solicitud').closest('[role="button"]')
    );

    // 7. Second ActionCard ("Consulte su solicitud")
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByText('Consulte su solicitud').closest('[role="button"]')
    );

    // 8. Shift+Tab goes back — proves no focus trap
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(
      screen.getByText('Retome su solicitud').closest('[role="button"]')
    );
  });
});

describe('Accesibilidad - Nombres accesibles', () => {
  it('BackLink tiene nombre accesible via texto', () => {
    renderPage();
    const link = screen.getByText('Volver').closest('a')!;
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Volver');
  });

  it('InfoBanner "Ver requisitos" tiene nombre accesible via texto', () => {
    renderPage();
    const btn = screen.getByText('Ver requisitos');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveTextContent('Ver requisitos');
  });

  it('InfoBanner botón de cierre tiene nombre accesible via aria-label', () => {
    renderPage();
    const closeBtn = screen.getByLabelText('Cerrar banner');
    expect(closeBtn).toBeInTheDocument();
  });

  it('opciones de radio tienen nombres accesibles via texto', () => {
    renderPage();
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveTextContent(/Con ayuda de un asistente IA/);
    expect(radios[1]).toHaveTextContent(/Continuar sin ayuda/);
  });

  it('StartButton tiene nombre accesible via texto', () => {
    renderPage();
    const button = screen.getByText('Iniciar proceso');
    expect(button.tagName).toBe('BUTTON');
  });

  it('ActionCards tienen nombres accesibles via texto', () => {
    renderPage();
    const resumeCard = screen.getByRole('button', { name: /Retome su solicitud/ });
    const statusCard = screen.getByRole('button', { name: /Consulte su solicitud/ });
    expect(resumeCard).toBeInTheDocument();
    expect(statusCard).toBeInTheDocument();
  });
});

describe('Accesibilidad - Atributos ARIA', () => {
  it('radiogroup tiene role="radiogroup" con aria-labelledby', () => {
    renderPage();
    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-labelledby');

    const labelId = radiogroup.getAttribute('aria-labelledby')!;
    const label = document.getElementById(labelId);
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Seleccione modalidad');
  });

  it('cada radio tiene role="radio" con aria-checked', () => {
    renderPage();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    radios.forEach((radio) => {
      expect(radio).toHaveAttribute('aria-checked');
    });
  });

  it('StartButton tiene aria-disabled="true" cuando no hay selección', () => {
    renderPage();
    const button = screen.getByText('Iniciar proceso');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('StartButton tiene aria-disabled="false" cuando hay selección', async () => {
    const user = userEvent.setup();
    renderPage();

    const radio = screen.getAllByRole('radio')[0];
    await user.click(radio);

    const button = screen.getByText('Iniciar proceso');
    expect(button).toHaveAttribute('aria-disabled', 'false');
  });

  it('InfoBanner tiene role="status"', () => {
    renderPage();
    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
    expect(within(banner).getByText('Consejos para hacer su reporte más rápido')).toBeInTheDocument();
  });
});

describe('Responsividad - Estructura semántica', () => {
  it('el contenedor principal tiene la clase de layout esperada', () => {
    const { container } = renderPage();
    const page = container.firstElementChild;
    expect(page).toHaveClass('page');
  });

  it('el contenido tiene la clase content para centrado y ancho máximo', () => {
    const { container } = renderPage();
    const content = container.querySelector('.content');
    expect(content).toBeInTheDocument();
  });

  it('HeaderBar usa un elemento <header> semántico', () => {
    const { container } = renderPage();
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('el título principal usa un elemento <h1>', () => {
    renderPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Comience su solicitud');
  });
});
