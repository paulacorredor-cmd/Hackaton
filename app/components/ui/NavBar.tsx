'use client';

import Link from 'next/link';
import { Shield, BookOpen, Bot } from 'lucide-react';

interface NavBarProps {
  currentModule: 'onboarding' | 'catalogo' | 'playground';
}

const navLinks = [
  { module: 'onboarding' as const, href: '/onboarding/registro', label: 'Onboarding', icon: Shield },
  { module: 'catalogo' as const, href: '/catalogo', label: 'Catálogo', icon: BookOpen },
  { module: 'playground' as const, href: '/playground', label: 'AI Playground', icon: Bot },
] as const;

export default function NavBar({ currentModule }: NavBarProps) {
  return (
    <nav
      className="flex items-center justify-between bg-bolivar-green px-5 py-3.5 desktop:px-10 shadow-sb-nav"
      aria-label="Navegación principal"
    >
      <Link
        href="/"
        className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow rounded-sb"
        aria-label="Seguros Bolívar — Ir al inicio"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-bolivar-yellow rounded-full flex items-center justify-center">
            <span className="text-bolivar-green font-inter font-bold text-sm">SB</span>
          </div>
          <span className="text-bolivar-white font-inter font-bold text-lg desktop:text-xl tracking-tight">
            Seguros Bolívar
          </span>
        </div>
        <span className="text-bolivar-yellow/80 font-inter text-sm hidden desktop:inline font-light">
          Developer Portal
        </span>
      </Link>

      <ul className="flex items-center gap-1.5 desktop:gap-2" role="list">
        {navLinks.map(({ module, href, label, icon: Icon }) => {
          const isActive = currentModule === module;
          return (
            <li key={module}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-sb text-sm font-inter font-medium
                  transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
                  ${isActive
                    ? 'bg-bolivar-yellow text-bolivar-green-dark shadow-sb-button'
                    : 'text-bolivar-white/90 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="hidden mobile:hidden desktop:inline">{label}</span>
                <span className="desktop:hidden sr-only">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
