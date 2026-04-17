'use client';

import { usePathname } from 'next/navigation';
import NavBar from '@/app/components/ui/NavBar';

const STEPS = [
  { label: 'Registro', path: '/onboarding/registro' },
  { label: 'Términos', path: '/onboarding/terminos' },
  { label: 'Sandbox', path: '/onboarding/sandbox' },
] as const;

function getActiveStep(pathname: string): number {
  const idx = STEPS.findIndex((s) => pathname.startsWith(s.path));
  return idx === -1 ? 0 : idx;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeStep = getActiveStep(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar currentModule="onboarding" />

      <nav aria-label="Progreso del onboarding" className="bg-white border-b border-gray-200 px-4 py-4 desktop:px-8">
        <ol className="flex items-center justify-center gap-2 desktop:gap-4" role="list">
          {STEPS.map((step, index) => {
            const isCompleted = index < activeStep;
            const isCurrent = index === activeStep;

            return (
              <li key={step.path} className="flex items-center gap-2 desktop:gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-inter font-semibold
                      ${isCurrent
                        ? 'bg-bolivar-green text-bolivar-white'
                        : isCompleted
                          ? 'bg-bolivar-yellow text-bolivar-green'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                    aria-hidden="true"
                  >
                    {isCompleted ? '✓' : index + 1}
                  </span>
                  <span
                    className={`
                      text-sm font-inter font-medium
                      ${isCurrent ? 'text-bolivar-green' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                    `}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 desktop:w-16 h-0.5 ${
                      index < activeStep ? 'bg-bolivar-yellow' : 'bg-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="flex-1 px-4 py-6 desktop:px-8 desktop:py-10">
        {children}
      </main>
    </div>
  );
}
