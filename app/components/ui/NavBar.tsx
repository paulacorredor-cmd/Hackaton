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
      className="flex items-center justify-between bg-bolivar-green px-4 py-3 desktop:px-8"
      aria-label="Navegación principal"
    >
      <Link
        href="/"
        className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow rounded"
        aria-label="Seguros Bolívar — Ir al inicio"
      >
        <span className="text-bolivar-yellow font-inter font-bold text-lg desktop:text-xl">
          Seguros Bolívar
        </span>
        <span className="text-bolivar-white font-inter text-sm hidden desktop:inline">
          Developer Portal
        </span>
      </Link>

      <ul className="flex items-center gap-1 desktop:gap-4" role="list">
        {navLinks.map(({ module, href, label, icon: Icon }) => {
          const isActive = currentModule === module;
          return (
            <li key={module}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded text-sm font-inter font-medium
                  transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
                  ${isActive
                    ? 'bg-bolivar-yellow text-bolivar-green'
                    : 'text-bolivar-white hover:bg-bolivar-yellow/20'
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
