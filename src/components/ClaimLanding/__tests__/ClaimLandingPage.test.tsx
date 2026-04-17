import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ClaimLandingPage } from '../ClaimLandingPage';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/claims']}>
      <Routes>
        <Route
          path="/claims"
          element={
            <>
              <ClaimLandingPage />
              <LocationDisplay />
            </>
          }
        />
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ClaimLandingPage - Integration', () => {
  it('renderiza todos los componentes en el orden correcto', () => {
    renderPage();

    // HeaderBar: logo
    expect(screen.getByAltText('Davivienda')).toBeInTheDocument();

    // BackLink
    expect(screen.getByText('Volver')).toBeInTheDocument();

    // InfoBanner
    expect(screen.getByText('Consejos para hacer su reporte más rápido')).toBeInTheDocument();
    expect(screen.getByText('Ver requisitos')).toBeInTheDocument();

    // Title and subtitle
    expect(screen.getByText('Comience su solicitud')).toBeInTheDocument();
    expect(
      screen.getByText('Vamos a resolverlo juntos, comience por elegir como desea tramitar su solicitud.')
    ).toBeInTheDocument();

    // ModeSelector options
    expect(screen.getByText('Con ayuda de un asistente IA')).toBeInTheDocument();
    expect(screen.getByText('Continuar sin ayuda')).toBeInTheDocument();

    // StartButton
    expect(screen.getByText('Iniciar proceso')).toBeInTheDocument();

    // Existing requests text
    expect(
      screen.getByText('Continúe su solicitud o verifique el estado de su caso de reclamación.')
    ).toBeInTheDocument();

    // ActionCards
    expect(screen.getByText('Retome su solicitud')).toBeInTheDocument();
    expect(screen.getByText('Consulte su solicitud')).toBeInTheDocument();
  });

  it('flujo completo: seleccionar modo asistido → click "Iniciar proceso" → navega a /claims/assisted', async () => {
    const user = userEvent.setup();
    renderPage();

    // Select assisted mode
    const assistedOption = screen.getByText('Con ayuda de un asistente IA').closest('[role="radio"]')!;
    await user.click(assistedOption);

    // Click start button
    await user.click(screen.getByText('Iniciar proceso'));

    // Verify navigation
    expect(screen.getByTestId('location-display')).toHaveTextContent('/claims/assisted');
  });

  it('flujo completo: seleccionar modo autoservicio → click "Iniciar proceso" → navega a /claims/self-service', async () => {
    const user = userEvent.setup();
    renderPage();

    // Select self-service mode
    const selfServiceOption = screen.getByText('Continuar sin ayuda').closest('[role="radio"]')!;
    await user.click(selfServiceOption);

    // Click start button
    await user.click(screen.getByText('Iniciar proceso'));

    // Verify navigation
    expect(screen.getByTestId('location-display')).toHaveTextContent('/claims/self-service');
  });

  it('cerrar banner no afecta el resto de la página', async () => {
    const user = userEvent.setup();
    renderPage();

    // Banner is visible
    expect(screen.getByText('Consejos para hacer su reporte más rápido')).toBeInTheDocument();

    // Close banner
    await user.click(screen.getByLabelText('Cerrar banner'));

    // Banner is gone
    expect(screen.queryByText('Consejos para hacer su reporte más rápido')).not.toBeInTheDocument();

    // Rest of the page still works
    expect(screen.getByText('Comience su solicitud')).toBeInTheDocument();
    expect(screen.getByText('Con ayuda de un asistente IA')).toBeInTheDocument();
    expect(screen.getByText('Iniciar proceso')).toBeInTheDocument();
    expect(screen.getByText('Retome su solicitud')).toBeInTheDocument();
  });

  it('botón deshabilitado no navega al hacer click', async () => {
    const user = userEvent.setup();
    renderPage();

    // Button should be disabled initially (no mode selected)
    const button = screen.getByText('Iniciar proceso');
    expect(button).toHaveAttribute('aria-disabled', 'true');

    // Click the disabled button
    await user.click(button);

    // Should still be on the same page
    expect(screen.getByTestId('location-display')).toHaveTextContent('/claims');
  });
});
