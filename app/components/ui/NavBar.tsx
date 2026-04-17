'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, BookOpen, Bot, Menu, X } from 'lucide-react';

interface NavBarProps {
  currentModule: 'onboarding' | 'catalogo' | 'playground';
}

const navLinks = [
  { module: 'onboarding' as const, href: '/onboarding/registro', label: 'Onboarding', icon: Shield },
  { module: 'catalogo' as const, href: '/catalogo', label: 'Catálogo', icon: BookOpen },
  { module: 'playground' as const, href: '/playground', label: 'AI Playground', icon: Bot },
] as const;

export default function NavBar({ currentModule }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="bg-bolivar-green px-4 py-3 desktop:px-8"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-between">
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

        {/* Desktop nav links */}
        <ul className="hidden desktop:flex items-center gap-4" role="list">
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
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger button */}
        <button
          type="button"
          className="desktop:hidden p-2 rounded text-bolivar-white hover:bg-bolivar-yellow/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={mobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <ul
          id="mobile-nav-menu"
          className="desktop:hidden mt-3 pb-2 flex flex-col gap-1 border-t border-bolivar-yellow/30 pt-3"
          role="list"
        >
          {navLinks.map(({ module, href, label, icon: Icon }) => {
            const isActive = currentModule === module;
            return (
              <li key={module}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded text-sm font-inter font-medium
                    transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-yellow
                    ${isActive
                      ? 'bg-bolivar-yellow text-bolivar-green'
                      : 'text-bolivar-white hover:bg-bolivar-yellow/20'
                    }
                  `}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
