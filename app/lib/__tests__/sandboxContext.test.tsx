import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SandboxProvider, useSandboxCredentials, type SandboxCredentials } from '../sandboxContext';

// Helper component to test the context
function TestConsumer() {
  const { credentials, setCredentials, clearCredentials } = useSandboxCredentials();

  return (
    <div>
      <span data-testid="status">
        {credentials ? `connected:${credentials.clientId}` : 'disconnected'}
      </span>
      <button
        onClick={() =>
          setCredentials({
            clientId: 'sb_test123',
            clientSecret: 'sk_secret456',
            createdAt: '2024-01-01T00:00:00.000Z',
          })
        }
      >
        Set Credentials
      </button>
      <button onClick={clearCredentials}>Clear</button>
    </div>
  );
}

describe('SandboxContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('inicia sin credenciales', () => {
    render(
      <SandboxProvider>
        <TestConsumer />
      </SandboxProvider>,
    );
    expect(screen.getByTestId('status').textContent).toBe('disconnected');
  });

  it('almacena credenciales al llamar setCredentials', async () => {
    const user = userEvent.setup();
    render(
      <SandboxProvider>
        <TestConsumer />
      </SandboxProvider>,
    );

    await user.click(screen.getByText('Set Credentials'));
    expect(screen.getByTestId('status').textContent).toBe('connected:sb_test123');
  });

  it('persiste credenciales en sessionStorage', async () => {
    const user = userEvent.setup();
    render(
      <SandboxProvider>
        <TestConsumer />
      </SandboxProvider>,
    );

    await user.click(screen.getByText('Set Credentials'));

    const stored = JSON.parse(sessionStorage.getItem('bolivar_sandbox_credentials')!);
    expect(stored.clientId).toBe('sb_test123');
    expect(stored.clientSecret).toBe('sk_secret456');
  });

  it('hidrata credenciales desde sessionStorage al montar', () => {
    const creds: SandboxCredentials = {
      clientId: 'sb_hydrated',
      clientSecret: 'sk_hydrated',
      createdAt: '2024-06-01T00:00:00.000Z',
    };
    sessionStorage.setItem('bolivar_sandbox_credentials', JSON.stringify(creds));

    render(
      <SandboxProvider>
        <TestConsumer />
      </SandboxProvider>,
    );

    expect(screen.getByTestId('status').textContent).toBe('connected:sb_hydrated');
  });

  it('limpia credenciales al llamar clearCredentials', async () => {
    const user = userEvent.setup();
    render(
      <SandboxProvider>
        <TestConsumer />
      </SandboxProvider>,
    );

    await user.click(screen.getByText('Set Credentials'));
    expect(screen.getByTestId('status').textContent).toBe('connected:sb_test123');

    await user.click(screen.getByText('Clear'));
    expect(screen.getByTestId('status').textContent).toBe('disconnected');
    expect(sessionStorage.getItem('bolivar_sandbox_credentials')).toBeNull();
  });

  it('ignora datos corruptos en sessionStorage', () => {
    sessionStorage.setItem('bolivar_sandbox_credentials', 'not-json');

    render(
      <SandboxProvider>
        <TestConsumer />
      </SandboxProvider>,
    );

    expect(screen.getByTestId('status').textContent).toBe('disconnected');
  });

  it('ignora datos incompletos en sessionStorage', () => {
    sessionStorage.setItem('bolivar_sandbox_credentials', JSON.stringify({ clientId: 'sb_only' }));

    render(
      <SandboxProvider>
        <TestConsumer />
      </SandboxProvider>,
    );

    expect(screen.getByTestId('status').textContent).toBe('disconnected');
  });
});
