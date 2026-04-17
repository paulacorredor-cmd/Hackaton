'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

interface CopyToClipboardProps {
  value: string;
  masked?: boolean;
  revealDuration?: number;
  onCopy?: () => void;
  ariaLabel: string;
}

/**
 * Masks a string by replacing every character with the mask character.
 */
export function maskValue(value: string, maskChar = '•'): string {
  return maskChar.repeat(value.length);
}

/**
 * Reveals the original value (identity function, used for round-trip property).
 */
export function revealValue(value: string): string {
  return value;
}

export default function CopyToClipboard({
  value,
  masked = false,
  revealDuration = 5000,
  onCopy,
  ariaLabel,
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silent fail
    }
  }, [value, onCopy]);

  const handleRevealToggle = useCallback(() => {
    if (revealed) {
      setRevealed(false);
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    } else {
      setRevealed(true);
      revealTimerRef.current = setTimeout(() => setRevealed(false), revealDuration);
    }
  }, [revealed, revealDuration]);

  const displayValue = masked && !revealed ? maskValue(value) : value;

  return (
    <div className="flex items-center gap-2 font-inter text-sm mobile:text-mobile-min">
      <code
        className="flex-1 bg-gray-100 px-3 py-2 rounded font-mono text-gray-800 break-all"
        aria-label={ariaLabel}
      >
        {displayValue}
      </code>

      {masked && (
        <button
          type="button"
          onClick={handleRevealToggle}
          className="p-2 rounded hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-green"
          aria-label={revealed ? 'Ocultar valor' : 'Revelar valor temporalmente'}
        >
          {revealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="p-2 rounded hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bolivar-green"
        aria-label={copied ? 'Copiado' : `Copiar ${ariaLabel}`}
      >
        {copied ? (
          <Check size={18} className="text-bolivar-green" aria-hidden="true" />
        ) : (
          <Copy size={18} aria-hidden="true" />
        )}
      </button>

      <span
        aria-live="polite"
        className="sr-only"
      >
        {copied ? 'Valor copiado al portapapeles' : ''}
      </span>
    </div>
  );
}
