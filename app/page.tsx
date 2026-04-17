import React from 'react';
import Link from 'next/link';
import { Shield, BookOpen, Bot, ArrowRight } from 'lucide-react';
import NavBar from '@/app/components/ui/NavBar';

const features = [
  {
    icon: BookOpen,
    title: 'Catálogo de APIs',
    description:
      'Explora APIs de seguros organizadas por línea (Vida, Hogar, Autos, Salud) con documentación interactiva y pruebas en sandbox.',
  },
  {
    icon: Shield,
    title: 'Sandbox en tiempo real',
    description:
      'Prueba endpoints directamente desde el portal con credenciales sandbox generadas automáticamente al registrarte.',
  },
  {
    icon: Bot,
    title: 'AI Playground',
    description:
      'Interactúa con las APIs mediante lenguaje natural y observa cómo un agente AI opera los endpoints por ti.',
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar currentModule="onboarding" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-bolivar-green px-4 py-10 desktop:py-24 desktop:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl desktop:text-5xl font-inter font-bold text-bolivar-yellow mb-3 desktop:mb-4">
              Bolívar API Developer Portal
            </h1>
            <p className="text-sm desktop:text-lg font-inter text-bolivar-white max-w-2xl mx-auto mb-6 desktop:mb-8 leading-relaxed">
              Integra las APIs de Seguros Bolívar bajo el estándar Open Insurance colombiano.
              Regístrate, explora el catálogo y prueba con inteligencia artificial.
            </p>
            <Link
              href="/onboarding/registro"
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded font-inter font-semibold text-sm
                bg-bolivar-yellow text-bolivar-green
                hover:bg-bolivar-yellow/90 transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-white
              "
              aria-label="Comenzar registro en el portal de desarrolladores"
            >
              Comenzar ahora
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-8 desktop:py-16 desktop:px-8" aria-labelledby="features-heading">
          <div className="max-w-5xl mx-auto">
            <h2
              id="features-heading"
              className="text-xl desktop:text-3xl font-inter font-bold text-gray-900 text-center mb-6 desktop:mb-10"
            >
              ¿Qué ofrece el portal?
            </h2>
            <div className="grid grid-cols-1 desktop:grid-cols-3 gap-4 desktop:gap-8">
              {features.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-lg border border-gray-200 p-5 desktop:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bolivar-green/10 mb-4">
                    <Icon size={24} className="text-bolivar-green" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-inter font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm font-inter text-gray-600 leading-relaxed">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 px-4 py-6 desktop:px-8">
        <p className="text-center text-xs font-inter text-gray-500">
          © {new Date().getFullYear()} Seguros Bolívar — Developer Portal. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
