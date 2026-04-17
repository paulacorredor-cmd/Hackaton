'use client';

import { usePathname } from 'next/navigation';
import NavBar from '@/app/components/ui/NavBar';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Registro', path: '/onboarding/registro' },
  { label: 'Términos', path: '/onboarding/terminos' },
  { label: 'Sandbox', path: '/onboarding/sandbox' },
] as const;

function getActiveStep(pathname: string): number {
  const idx = STEPS.findIndex((s) => pathname.startsWith(s.path));
  return idx === -1 ? 0 : idx;
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeStep = getActiveStep(pathname);

  return (
    <div className="min-h-screen flex flex-col bg-bolivar-gray-50">
      <NavBar currentModule="onboarding" />

      <nav aria-label="Progreso del onboarding" className="bg-white border-b border-bolivar-gray-200 px-5 py-5 desktop:px-10 shadow-sm">
        <ol className="flex items-center justify-center gap-3 desktop:gap-6" role="list">
          {STEPS.map((step, index) => {
            const isCompleted = index < activeStep;
            const isCurrent = index === activeStep;

            return (
              <li key={step.path} className="flex items-center gap-3 desktop:gap-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`
                      flex items-center justify-center w-9 h-9 rounded-full text-sm font-inter font-bold transition-all duration-200
                      ${isCurrent
                        ? 'bg-bolivar-green text-white shadow-sb-button'
                        : isCompleted
                          ? 'bg-bolivar-yellow text-bolivar-green-dark'
                          : 'bg-bolivar-gray-200 text-bolivar-gray-500'
                      }
                    `}
                    aria-hidden="true"
                  >
                    {isCompleted ? <Check size={16} /> : index + 1}
                  </span>
                  <span
                    className={`
                      text-sm font-inter font-semibold
                      ${isCurrent ? 'text-bolivar-green' : isCompleted ? 'text-bolivar-gray-700' : 'text-bolivar-gray-300'}
                    `}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {step.label}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={`w-10 desktop:w-20 h-0.5 rounded-full transition-colors duration-200 ${
                      index < activeStep ? 'bg-bolivar-green' : 'bg-bolivar-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <main className="flex-1 px-5 py-8 desktop:px-10 desktop:py-12">
        {children}
      </main>
    </div>
  );
}
